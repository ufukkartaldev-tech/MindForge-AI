"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getStoredCourses, getStoredQuizAttempts, getStoredApiKey } from "@/lib/storage";
import { Course, QuizQuestion, QuizAttempt } from "@/lib/types";
import { getFallbackQuiz } from "@/lib/gemini";
import { QuizEngine } from "@/components/quiz/quiz-engine";
import { 
  HelpCircle, 
  Sparkles, 
  RotateCcw, 
  Award, 
  Calendar, 
  Loader2, 
  BookOpen, 
  SlidersHorizontal,
  Flame,
  ArrowRight
} from "lucide-react";

function QuizCenterContent() {
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "cpp-intro";
  const initialTopicId = searchParams.get("topicId") || "";

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopicId);
  const [difficulty, setDifficulty] = useState<"Kolay" | "Orta" | "Zor">("Orta");
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredCourses();
    setCourses(stored);
    setAttempts(getStoredQuizAttempts());

    if (initialTopicId && stored.length > 0) {
      // Auto start quiz for this topic
      const course = stored.find(c => c.id === initialCourseId);
      const topic = course?.modules.flatMap(m => m.topics).find(t => t.id === initialTopicId);
      if (course && topic) {
        startQuiz(course, topic.title);
      }
    }
  }, [initialCourseId, initialTopicId]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const courseTopics = selectedCourse?.modules.flatMap(m => m.topics) || [];
  const selectedTopic = courseTopics.find(t => t.id === selectedTopicId);

  const startQuiz = async (c = selectedCourse, tTitle = selectedTopic?.title) => {
    if (!c) return;
    setLoading(true);
    setActiveQuizQuestions(null);

    try {
      const storedKey = getStoredApiKey();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedKey ? { "x-gemini-key": storedKey } : {})
        },
        body: JSON.stringify({
          action: "quiz",
          courseTitle: c.title,
          courseId: c.id,
          topicTitle: tTitle || c.title,
          difficulty
        })
      });

      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        setActiveQuizQuestions(json.data);
      } else {
        setActiveQuizQuestions(getFallbackQuiz(c.id, tTitle || c.title));
      }
    } catch (e) {
      console.error("Quiz çekme hatası:", e);
      setActiveQuizQuestions(getFallbackQuiz(c.id, tTitle || c.title));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" />
          <span>Quiz Merkezi & Kendini Değerlendir</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Ders veya konu seçerek yapay zekâ tarafından hazırlanan çoktan seçmeli, doğru/yanlış ve kod tahmin sorularını çöz.
        </p>
      </div>

      {/* Quiz Configuration Panel */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span>Quiz Ayarları</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Select Course */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Ders Seç
            </label>
            <select
              value={selectedCourseId}
              onChange={e => {
                setSelectedCourseId(e.target.value);
                setSelectedTopicId("");
              }}
              className="w-full text-xs px-3 py-2 rounded-lg border border-input bg-background"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Select Topic */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Konu Seç (Opsiyonel - Genel Ders için boş bırak)
            </label>
            <select
              value={selectedTopicId}
              onChange={e => setSelectedTopicId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-input bg-background"
            >
              <option value="">Tüm Konulardan Karma</option>
              {courseTopics.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Zorluk Seviyesi
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["Kolay", "Orta", "Zor"] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 text-xs rounded-lg border font-medium transition-all ${
                    difficulty === d
                      ? "border-primary bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => startQuiz()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Soruları Hazırlıyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Quizi Başlat</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Quiz Engine */}
      {activeQuizQuestions && activeQuizQuestions.length > 0 && selectedCourse && (
        <div className="pt-4">
          <QuizEngine
            courseId={selectedCourse.id}
            courseTitle={selectedCourse.title}
            topicId={selectedTopic?.id}
            topicTitle={selectedTopic?.title}
            questions={activeQuizQuestions}
            onFinish={() => {
              setAttempts(getStoredQuizAttempts());
            }}
          />
        </div>
      )}

      {/* Quiz History */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Geçmiş Quiz Denemeleri ({attempts.length})</span>
        </h2>

        {attempts.length > 0 ? (
          <div className="divide-y divide-border">
            {attempts.slice(0, 5).map(att => (
              <div key={att.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground block">
                    {att.courseTitle}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {att.topicTitle ? `${att.topicTitle} • ` : ""}
                    {new Date(att.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-primary block">
                      %{att.score}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {att.totalQuestions - att.wrongQuestions.length} / {att.totalQuestions} Doğru
                    </span>
                  </div>

                  {att.wrongQuestions.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedCourseId(att.courseId);
                        setActiveQuizQuestions(att.wrongQuestions);
                      }}
                      className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium hover:bg-amber-500/20 text-[11px] transition-colors"
                    >
                      Yanlışları Çöz ({att.wrongQuestions.length})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-6">
            Henüz tamamlanmış bir quiz denemen yok. Yukarıdan bir ders seçerek ilk testine başla!
          </p>
        )}
      </div>
    </div>
  );
}

export default function QuizCenterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Quiz Merkezi yükleniyor...</div>}>
      <QuizCenterContent />
    </Suspense>
  );
}
