"use client";

import React, { useState, useEffect } from "react";
import { getStoredCourses, saveExamResult, getStoredExamResults, getStoredApiKey } from "@/lib/storage";
import { Course, QuizQuestion, ExamSimulationResult } from "@/lib/types";
import { getFallbackQuiz } from "@/lib/gemini";
import confetti from "canvas-confetti";
import { 
  GraduationCap, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Award, 
  RotateCcw,
  Sparkles,
  BarChart2,
  FileCheck2,
  Loader2
} from "lucide-react";
import katex from "katex";

export default function ExamSimulationPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("cpp-intro");
  const [questionCount, setQuestionCount] = useState<number>(6);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [difficulty, setDifficulty] = useState<"Kolay" | "Orta" | "Zor" | "Karma">("Karma");

  // Exam Run State
  const [isExamActive, setIsExamActive] = useState(false);
  const [examQuestions, setExamQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [examResult, setExamResult] = useState<ExamSimulationResult | null>(null);
  const [pastResults, setPastResults] = useState<ExamSimulationResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredCourses();
    setCourses(stored);
    setPastResults(getStoredExamResults());
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isExamActive || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExamActive, timeLeftSeconds]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const startExam = async () => {
    if (!selectedCourse) return;
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
          action: "quiz",
          courseTitle: selectedCourse.title,
          courseId: selectedCourse.id,
          topicTitle: `${selectedCourse.title} Vize Kapsamı`,
          difficulty: difficulty === "Karma" ? "Orta" : difficulty
        })
      });

      const json = await res.json();
      let questions: QuizQuestion[] = [];
      if (json.success && json.data && json.data.length > 0) {
        questions = json.data;
      } else {
        questions = getFallbackQuiz(selectedCourse.id, selectedCourse.title);
      }

      // Multiply or pad to target questionCount if needed
      while (questions.length < questionCount) {
        const copy = { ...questions[questions.length % questions.length], id: `q-pad-${questions.length + 1}` };
        questions.push(copy);
      }
      questions = questions.slice(0, questionCount);

      setExamQuestions(questions);
      setCurrentIndex(0);
      setUserAnswers({});
      setTimeLeftSeconds(durationMinutes * 60);
      setIsExamActive(true);
      setExamResult(null);
    } catch (e) {
      console.error("Sınav başlatma hatası:", e);
    } finally {
      setLoading(false);
    }
  };

  const finishExam = () => {
    if (!selectedCourse) return;
    setIsExamActive(false);

    let correct = 0;
    let wrong = 0;
    let empty = 0;

    examQuestions.forEach(q => {
      const ans = userAnswers[q.id];
      if (!ans) {
        empty++;
      } else if (ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correct++;
      } else {
        wrong++;
      }
    });

    const score = Math.round((correct / examQuestions.length) * 100);
    const spentSec = durationMinutes * 60 - timeLeftSeconds;

    const strongTopics = score >= 70 ? ["Temel Algoritmik Mantık", "Sözdizimi Kuralları"] : ["Temel Kavramlar"];
    const weakTopics = score < 70 ? ["İşaretçiler ve Bellek Adresleme", "Zaman Karmaşıklığı"] : [];
    const recommendations = score >= 80 
      ? ["Harika performans! Vize sınavına tam olarak hazırsın. Bilgilerini korumak için haftada bir tekrar quizleri çözmen yeterli."]
      : ["Özellikle yanlış yaptığın soruların çözümlerini dikkatle incele ve bu konularda pratik yap."];

    const result: ExamSimulationResult = {
      id: `exam-${Date.now()}`,
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      score,
      totalQuestions: examQuestions.length,
      correctCount: correct,
      wrongCount: wrong,
      emptyCount: empty,
      durationMinutes,
      timeSpentSeconds: spentSec,
      topicBreakdown: [
        { topicId: "top-1", topicTitle: "Temel İlkeler", score: Math.min(score + 10, 100), total: 100 },
        { topicId: "top-2", topicTitle: "Uygulamalı Sorular", score: Math.max(score - 10, 30), total: 100 }
      ],
      strongTopics,
      weakTopics,
      recommendations,
      completedAt: new Date().toISOString(),
      questions: examQuestions,
      answers: userAnswers
    };

    saveExamResult(result);
    setExamResult(result);
    setPastResults(getStoredExamResults());

    if (score >= 70) {
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 1. RESULT VIEW
  if (examResult) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-foreground">
            Vize Simülasyonu Sonuç Raporu
          </h2>
          <p className="text-xs text-muted-foreground">
            {examResult.courseTitle} • Süre: {Math.floor(examResult.timeSpentSeconds / 60)} dk {examResult.timeSpentSeconds % 60} sn
          </p>

          {/* Big Score Card */}
          <div className="py-4">
            <span className="text-6xl font-black font-mono text-primary">
              %{examResult.score}
            </span>
            <span className="text-xs text-muted-foreground block mt-1">
              Genel Başarı Puanı
            </span>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
              {examResult.correctCount} Doğru
            </div>
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold">
              {examResult.wrongCount} Yanlış
            </div>
            <div className="p-2.5 rounded-lg bg-secondary border border-border text-muted-foreground font-bold">
              {examResult.emptyCount} Boş
            </div>
          </div>
        </div>

        {/* Diagnosis & Recommendations */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Yapay Zekâ Vize Teşhis Analizi
          </h3>

          <div className="space-y-3">
            {examResult.strongTopics.length > 0 && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                <strong>Güçlü Olduğun Yönler:</strong> {examResult.strongTopics.join(", ")}
              </div>
            )}

            {examResult.weakTopics.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                <strong>Geliştirilmesi Gereken Konular:</strong> {examResult.weakTopics.join(", ")}
              </div>
            )}

            <div className="p-3 rounded-lg bg-muted/40 border border-border leading-relaxed text-muted-foreground">
              {examResult.recommendations[0]}
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => {
                setExamResult(null);
                setIsExamActive(false);
              }}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-colors shadow-sm"
            >
              Yeni Sınav Başlat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE EXAM VIEW
  if (isExamActive && examQuestions.length > 0) {
    const currentQ = examQuestions[currentIndex];
    const isAnswered = !!userAnswers[currentQ.id];

    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
        {/* Exam Navigation & Timer Bar */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              {selectedCourse?.title} • VİZE SİMÜLASYONU
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-mono font-bold text-xs">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Kalan Süre: {formatTimer(timeLeftSeconds)}</span>
          </div>
        </div>

        {/* Question Palette */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {examQuestions.map((q, idx) => {
            const hasAns = !!userAnswers[q.id];
            const isCurr = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                  isCurr
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                    : hasAns
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-secondary text-muted-foreground border border-border"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-primary">Soru {currentIndex + 1} / {examQuestions.length}</span>
            <span className="font-mono">{currentQ.difficulty} Seviye</span>
          </div>

          <h3 className="text-sm font-bold text-foreground leading-relaxed">
            {currentQ.question}
          </h3>

          {currentQ.code && (
            <div className="p-3 rounded-lg bg-zinc-950 font-mono text-xs text-zinc-100 overflow-x-auto border border-zinc-800">
              <pre><code>{currentQ.code}</code></pre>
            </div>
          )}

          {/* Options */}
          {currentQ.options && currentQ.options.length > 0 ? (
            <div className="space-y-2 pt-2">
              {currentQ.options.map((opt, i) => {
                const isSelected = userAnswers[currentQ.id] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => setUserAnswers({ ...userAnswers, [currentQ.id]: opt })}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                        : "border-border hover:bg-accent text-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="pt-2">
              <input
                type="text"
                placeholder="Cevabınızı girin..."
                value={userAnswers[currentQ.id] || ""}
                onChange={e => setUserAnswers({ ...userAnswers, [currentQ.id]: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-input bg-background font-mono"
              />
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Önceki Soru</span>
            </button>

            {currentIndex + 1 < examQuestions.length ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90"
              >
                <span>Sonraki Soru</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={finishExam}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                Sınavı Bitir & Raporu Al
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. EXAM CONFIGURATION / HOME VIEW
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          <span>Vize Simülasyonu Motoru</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Gerçek vize sınavı koşullarında, geri sayım sayacı ve yapay zekâ analiz raporuyla kendini test et.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Setup Form */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Sınav Parametrelerini Belirle
          </h2>

          <div className="space-y-4 text-xs">
            {/* Course select */}
            <div>
              <label className="text-muted-foreground block mb-1 font-medium">Ders Seç</label>
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background font-medium"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.dayOfWeek} • Vize: {c.examDate || "Tarih Yok"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Question Count */}
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Soru Sayısı</label>
                <select
                  value={questionCount}
                  onChange={e => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono"
                >
                  <option value={5}>5 Soru (Hızlı)</option>
                  <option value={8}>8 Soru (Standart)</option>
                  <option value={12}>12 Soru (Kapsamlı)</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Sınav Süresi</label>
                <select
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono"
                >
                  <option value={10}>10 Dakika</option>
                  <option value={15}>15 Dakika</option>
                  <option value={25}>25 Dakika</option>
                  <option value={40}>40 Dakika</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Zorluk Seviyesi</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                >
                  <option value="Kolay">Kolay</option>
                  <option value="Orta">Orta (Vize Düzeyi)</option>
                  <option value="Zor">Zor (Final Düzeyi)</option>
                  <option value="Karma">Karma (Önerilen)</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={startExam}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI Vize Sorularını Derliyor...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    <span>Vize Simülasyonunu Başlat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Past Exams */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
            <span>Geçmiş Sınavlarım ({pastResults.length})</span>
          </h2>

          <div className="space-y-3">
            {pastResults.length > 0 ? (
              pastResults.slice(0, 4).map(res => (
                <div key={res.id} className="p-3 rounded-lg bg-background border border-border text-xs space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="truncate max-w-[150px]">{res.courseTitle}</span>
                    <span className="text-primary font-mono">%{res.score}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex justify-between">
                    <span>{res.correctCount} Doğru / {res.wrongCount} Yanlış</span>
                    <span>{new Date(res.completedAt).toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                Henüz vize simülasyonu çözmedin. İlk sınavını başlatarak seviyeni ölç!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
