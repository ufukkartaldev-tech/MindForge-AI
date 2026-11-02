"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  getCourseById, 
  updateTopicMastery, 
  getStoredApiKey 
} from "@/lib/storage";
import { Course, Topic, LessonContent, LessonSection } from "@/lib/types";
import { getFallbackLesson } from "@/lib/gemini";
import { CodePlayground } from "@/components/interactive/code-playground";
import { MathVisualizer } from "@/components/interactive/math-visualizer";
import { OSSimulator } from "@/components/interactive/os-simulator";
import { AlgorithmVisualizer } from "@/components/interactive/algorithm-visualizer";
import { TutorDrawer } from "@/components/ai/tutor-drawer";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  ChevronRight,
  Loader2
} from "lucide-react";
import katex from "katex";

export default function TopicLearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const topicId = params?.topicId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId && topicId) {
      const c = getCourseById(courseId);
      if (c) {
        setCourse(c);
        let foundTopic: Topic | null = null;
        for (const m of c.modules) {
          const t = m.topics.find(item => item.id === topicId);
          if (t) {
            foundTopic = t;
            break;
          }
        }
        setTopic(foundTopic);

        // Fetch or load Lesson Content
        fetchLesson(c.title, foundTopic?.title || "Konu");
      }
    }
  }, [courseId, topicId]);

  const fetchLesson = async (cTitle: string, tTitle: string) => {
    setLoading(true);
    try {
      const storedKey = getStoredApiKey();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedKey ? { "x-gemini-key": storedKey } : {})
        },
        body: JSON.stringify({
          action: "lesson",
          courseTitle: cTitle,
          courseId,
          topicTitle: tTitle,
          topicId
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setLesson(json.data);
      } else {
        setLesson(getFallbackLesson(courseId, topicId, tTitle));
      }
    } catch (e) {
      console.error("Ders yüklenirken hata:", e);
      setLesson(getFallbackLesson(courseId, topicId, tTitle));
    } finally {
      setLoading(false);
    }
  };

  const handleNextSection = () => {
    if (!lesson) return;
    if (activeSectionIndex + 1 < lesson.sections.length) {
      setActiveSectionIndex(activeSectionIndex + 1);
    } else {
      // Completed last section! Mark progress
      updateTopicMastery(courseId, topicId, "in_progress", 75, 20);
      router.push(`/quiz?courseId=${courseId}&topicId=${topicId}`);
    }
  };

  const handlePrevSection = () => {
    if (activeSectionIndex > 0) {
      setActiveSectionIndex(activeSectionIndex - 1);
    }
  };

  const renderLatex = (latexStr?: string) => {
    if (!latexStr) return null;
    try {
      const html = katex.renderToString(latexStr, { throwOnError: false });
      return (
        <div
          className="my-3 p-3 rounded-lg bg-muted/40 font-mono text-sm overflow-x-auto text-primary"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return <div className="font-mono text-sm text-primary my-2">{latexStr}</div>;
    }
  };

  if (loading || !lesson || !topic || !course) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">
          Yapay zekâ pedagojik ders modülünü hazırlıyor...
        </p>
      </div>
    );
  }

  const currentSection = lesson.sections[activeSectionIndex];
  const isLast = activeSectionIndex === lesson.sections.length - 1;

  // Render appropriate interactive visualizer based on subject
  const renderSubjectVisualizer = () => {
    const isCpp = courseId.includes("cpp") || topic.title.toLowerCase().includes("pointer") || topic.title.toLowerCase().includes("kod");
    const isMath = courseId.includes("math") || topic.title.toLowerCase().includes("türev") || topic.title.toLowerCase().includes("limit");
    const isOS = courseId.includes("os") || topic.title.toLowerCase().includes("çizelgeleme") || topic.title.toLowerCase().includes("scheduling");
    const isAlgo = courseId.includes("algo") || topic.title.toLowerCase().includes("sıralama") || topic.title.toLowerCase().includes("arama");

    if (isCpp) return <CodePlayground />;
    if (isMath) return <MathVisualizer />;
    if (isOS) return <OSSimulator />;
    if (isAlgo) return <AlgorithmVisualizer />;

    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{course?.title || "Ders"} Müfredatına Dön</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/quiz?courseId=${courseId}&topicId=${topicId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent text-xs font-semibold text-foreground transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>Bu Konunun Quizini Çöz</span>
          </Link>
        </div>
      </div>

      {/* Topic Title Bar */}
      <div className="border-b border-border pb-4">
        <span className="text-[11px] font-mono text-primary font-semibold uppercase tracking-wider">
          İnteraktif Öğrenme Motoru
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-0.5">
          {topic.title}
        </h1>
      </div>

      {/* Stepper Progress Bar (9 Sections) */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto py-2 no-scrollbar">
        {lesson.sections.map((sec, idx) => {
          const isDone = idx < activeSectionIndex;
          const isCurrent = idx === activeSectionIndex;

          return (
            <button
              key={idx}
              onClick={() => setActiveSectionIndex(idx)}
              className={`flex-1 min-w-[70px] p-2 rounded-lg border text-left transition-all ${
                isCurrent
                  ? "border-primary bg-primary/10 shadow-sm"
                  : isDone
                  ? "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground"
                  : "border-border bg-card/40 text-muted-foreground hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold">
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <span>{idx + 1}.</span>
                )}
                <span className="truncate">{sec.type}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Section Content Card */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="uppercase tracking-wider">Bölüm {activeSectionIndex + 1} / {lesson.sections.length}</span>
        </div>

        <h2 className="text-lg font-bold text-foreground">
          {currentSection.title}
        </h2>

        {/* Content Body */}
        <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line space-y-3">
          {currentSection.content}
        </div>

        {/* LaTeX formula if present */}
        {renderLatex(currentSection.mathLatex)}

        {/* Interactive Activity in section if defined */}
        {currentSection.interactiveActivity && (
          <div className="pt-2">
            <CodePlayground
              predictionQuestion={currentSection.interactiveActivity.prompt}
              initialCode={currentSection.interactiveActivity.codeSnippet}
              language={currentSection.interactiveActivity.language || "cpp"}
              options={currentSection.interactiveActivity.options}
              correctAnswer={String(currentSection.interactiveActivity.correctAnswer)}
              explanation={currentSection.interactiveActivity.explanation}
            />
          </div>
        )}

        {/* Subject-specific simulator at Applied/Concept stage */}
        {(currentSection.type === "applied" || currentSection.type === "concept") && !currentSection.interactiveActivity && (
          <div className="pt-3">
            {renderSubjectVisualizer()}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <button
            onClick={handlePrevSection}
            disabled={activeSectionIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Önceki Bölüm</span>
          </button>

          <button
            onClick={handleNextSection}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
          >
            <span>{isLast ? "Konuyu Tamamla & Quize Geç" : "Devam Et"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating AI Tutor Drawer */}
      <TutorDrawer
        courseTitle={course.title}
        topicTitle={topic.title}
        courseId={course.id}
        topicId={topic.id}
      />
    </div>
  );
}
