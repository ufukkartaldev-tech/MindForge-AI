"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  getCourseById, 
  saveCourse, 
  getStoredApiKey 
} from "@/lib/storage";
import { Course, Module, Topic } from "@/lib/types";
import { 
  Sparkles, 
  BookOpen, 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Calendar, 
  Layers, 
  HelpCircle, 
  Loader2,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [generatingCurriculum, setGeneratingCurriculum] = useState(false);
  const [pdfUploadNotice, setPdfUploadNotice] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (courseId) {
      const found = getCourseById(courseId);
      if (found) {
        setCourse(found);
        // expand all modules by default
        const exp: Record<string, boolean> = {};
        found.modules.forEach(m => { exp[m.id] = true; });
        setExpandedModules(exp);
      }
    }
  }, [courseId]);

  if (!course) {
    return (
      <div className="p-12 text-center text-xs text-muted-foreground">
        Ders yükleniyor veya bulunamadı...
      </div>
    );
  }

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Generate or Expand Curriculum with AI
  const handleGenerateCurriculum = async () => {
    setGeneratingCurriculum(true);
    try {
      const storedKey = getStoredApiKey();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedKey ? { "x-gemini-key": storedKey } : {})
        },
        body: JSON.stringify({
          action: "curriculum",
          courseTitle: course.title,
          courseId: course.id
        })
      });

      const json = await res.json();
      if (json.success && json.data?.modules) {
        // Map into full Course Module / Topic objects
        const newModules: Module[] = json.data.modules.map((m: any, mIdx: number) => ({
          id: m.id || `mod-${Date.now()}-${mIdx}`,
          courseId: course.id,
          title: m.title,
          description: m.description,
          orderIndex: m.orderIndex || mIdx + 1,
          topics: (m.topics || []).map((t: any, tIdx: number) => ({
            id: t.id || `top-${Date.now()}-${tIdx}`,
            moduleId: m.id,
            courseId: course.id,
            title: t.title,
            summary: t.summary,
            orderIndex: t.orderIndex || tIdx + 1,
            difficulty: t.difficulty || "Orta",
            prerequisites: t.prerequisites || [],
            learningObjectives: t.learningObjectives || [],
            masteryStatus: "unstarted",
            masteryScore: 0,
            timeSpentMinutes: 0
          }))
        }));

        const updatedCourse: Course = {
          ...course,
          modules: newModules
        };

        saveCourse(updatedCourse);
        setCourse(updatedCourse);

        const exp: Record<string, boolean> = {};
        newModules.forEach(m => { exp[m.id] = true; });
        setExpandedModules(exp);
      }
    } catch (e) {
      console.error("Müfredat üretilemedi:", e);
    } finally {
      setGeneratingCurriculum(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back button */}
      <div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Tüm Derslere Dön</span>
        </Link>
      </div>

      {/* Course Banner */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {course.category}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {course.dayOfWeek} {course.timeSlot}
              </span>
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              {course.title}
            </h1>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateCurriculum}
              disabled={generatingCurriculum}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {generatingCurriculum ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Müfredatı İnşa Ediyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI ile Müfredatı Yeniden Üret</span>
                </>
              )}
            </button>

            <button
              onClick={() => setPdfUploadNotice(!pdfUploadNotice)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-border bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span>PDF Yükleme (Opsiyonel)</span>
            </button>
          </div>
        </div>

        {/* Exam metadata box */}
        {course.examDate && (
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Vize Sınavı: <strong className="text-foreground">{course.examDate}</strong> ({course.examLocation || "Amfi"})</span>
            </div>
            <Link
              href="/exam"
              className="text-xs text-primary font-semibold hover:underline"
            >
              Bu Dersin Vize Simülasyonunu Başlat →
            </Link>
          </div>
        )}

        {/* PDF Notice & Academic Disclaimer Modal/Banner */}
        {pdfUploadNotice && (
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Pedagojik Not & İsteğe Bağlı Doküman Entegrasyonu:</span>
            </div>
            <p className="leading-relaxed">
              MindForge AI'ın en büyük gücü slayt veya PDF yükleme zorunluluğu <strong>bulunmamasıdır</strong>. Platform, dünya genelindeki üniversite standartlarındaki akademik müfredatı baz alarak konuları baştan sona eksiksiz öğretir. Dilersen hocanın özel izlencesini eklemek için de PDF aktarabilirsin.
            </p>
          </div>
        )}
      </div>

      {/* Curriculum Module Tree */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span>Akademik Müfredat ve Konu Ağacı</span>
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            {course.modules.length} Modül • {course.modules.reduce((a, b) => a + b.topics.length, 0)} Konu
          </span>
        </div>

        <div className="space-y-3">
          {course.modules.map(module => {
            const isExpanded = expandedModules[module.id] ?? true;

            return (
              <div
                key={module.id}
                className="rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all"
              >
                {/* Module Header Toggle */}
                <div
                  onClick={() => toggleModule(module.id)}
                  className="p-4 bg-muted/30 border-b border-border flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <h3 className="text-xs font-bold text-foreground">
                        {module.orderIndex}. {module.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-muted-foreground">
                    {module.topics.length} Konu
                  </span>
                </div>

                {/* Topics List */}
                {isExpanded && (
                  <div className="divide-y divide-border">
                    {module.topics.map(topic => {
                      const isMastered = topic.masteryStatus === "mastered";
                      const isNeedsReview = topic.masteryStatus === "needs_review";

                      return (
                        <div
                          key={topic.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-accent/20 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">
                                {topic.title}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                  isMastered
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : isNeedsReview
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "bg-secondary text-secondary-foreground"
                                }`}
                              >
                                {isMastered ? "Öğrenildi" : isNeedsReview ? "Tekrar Edilmeli" : "Çalışılıyor"}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                • {topic.difficulty}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground">
                              {topic.summary}
                            </p>

                            {topic.learningObjectives && topic.learningObjectives.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {topic.learningObjectives.map((obj, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded"
                                  >
                                    ✓ {obj}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href={`/courses/${course.id}/learn/${topic.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Öğren</span>
                            </Link>

                            <Link
                              href={`/quiz?courseId=${course.id}&topicId=${topic.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-medium hover:bg-accent transition-colors"
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-primary" />
                              <span>Quiz</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
