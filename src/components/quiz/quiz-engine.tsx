"use client";

import React, { useState } from "react";
import { QuizQuestion, QuizAttempt } from "@/lib/types";
import { saveQuizAttempt } from "@/lib/storage";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Lightbulb, 
  ArrowRight, 
  RotateCcw, 
  Award,
  BookOpen
} from "lucide-react";
import katex from "katex";

interface QuizEngineProps {
  courseId: string;
  courseTitle: string;
  topicId?: string;
  topicTitle?: string;
  questions: QuizQuestion[];
  onFinish?: (attempt: QuizAttempt) => void;
}

export function QuizEngine({
  courseId,
  courseTitle,
  topicId,
  topicTitle,
  questions,
  onFinish
}: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [fillBlankInput, setFillBlankInput] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);
  const [retryWrongOnly, setRetryWrongOnly] = useState(false);
  const [activeQuestionList, setActiveQuestionList] = useState<QuizQuestion[]>(questions);

  const currentQ = activeQuestionList[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (hasSubmitted) return;
    setSelectedAnswer(opt);
  };

  const handleSubmitAnswer = () => {
    if (!currentQ) return;
    const answer = currentQ.type === "fill_in_the_blank" ? fillBlankInput.trim() : selectedAnswer;
    if (!answer) return;

    setUserAnswers(prev => ({ ...prev, [currentQ.id]: answer }));
    setHasSubmitted(true);
  };

  const handleNextQuestion = () => {
    setHasSubmitted(false);
    setSelectedAnswer("");
    setFillBlankInput("");
    setShowHint(false);

    if (currentIndex + 1 < activeQuestionList.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished all questions! Calculate score
      let correct = 0;
      const wrongList: QuizQuestion[] = [];

      activeQuestionList.forEach(q => {
        const ans = userAnswers[q.id] || (q.id === currentQ.id ? (q.type === "fill_in_the_blank" ? fillBlankInput.trim() : selectedAnswer) : "");
        const isMatch = ans.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
        if (isMatch) {
          correct++;
        } else {
          wrongList.push(q);
        }
      });

      const total = activeQuestionList.length;
      const finalScore = Math.round((correct / total) * 100);

      const attempt: QuizAttempt = {
        id: `att-${Date.now()}`,
        courseId,
        courseTitle,
        topicId,
        topicTitle,
        score: finalScore,
        totalQuestions: total,
        answers: userAnswers,
        wrongQuestions: wrongList,
        createdAt: new Date().toISOString()
      };

      saveQuizAttempt(attempt);
      setAttemptResult(attempt);
      setIsCompleted(true);

      if (finalScore >= 70) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }

      if (onFinish) onFinish(attempt);
    }
  };

  const handleStartRetryWrong = () => {
    if (!attemptResult || attemptResult.wrongQuestions.length === 0) return;
    setActiveQuestionList(attemptResult.wrongQuestions);
    setCurrentIndex(0);
    setUserAnswers({});
    setSelectedAnswer("");
    setFillBlankInput("");
    setHasSubmitted(false);
    setShowHint(false);
    setIsCompleted(false);
    setRetryWrongOnly(true);
  };

  const renderMath = (latexStr?: string) => {
    if (!latexStr) return null;
    try {
      const html = katex.renderToString(latexStr, { throwOnError: false });
      return <div className="my-2 p-2 rounded bg-muted/40 font-mono text-xs overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return <div className="font-mono text-xs text-primary">{latexStr}</div>;
    }
  };

  // If completed, show Result Card & Analysis
  if (isCompleted && attemptResult) {
    const isPassing = attemptResult.score >= 60;
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-2xl mx-auto space-y-6 text-center animate-in fade-in">
        <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mx-auto">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground">
            {retryWrongOnly ? "Yanlış Soruları Tekrar Değerlendirmesi" : "Quiz Tamamlandı!"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {courseTitle} {topicTitle ? `• ${topicTitle}` : ""}
          </p>
        </div>

        {/* Big Score Dial */}
        <div className="py-4">
          <div className="text-5xl font-black font-mono text-primary">
            %{attemptResult.score}
          </div>
          <span className="text-xs font-medium text-muted-foreground mt-1 block">
            Başarı Puanı ({attemptResult.totalQuestions - attemptResult.wrongQuestions.length} / {attemptResult.totalQuestions} Doğru)
          </span>
        </div>

        {/* Diagnosis & Recommendations */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border text-left space-y-2 text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-primary" /> Yapay Zekâ Performans Analizi:
          </span>
          <p className="text-muted-foreground leading-relaxed">
            {isPassing
              ? "Tebrikler! Konunun ana hatlarını ve problem çözüm adımlarını başarıyla kavradın. Bu konu 'Öğrenildi' durumuna güncellendi."
              : "Bu konuda henüz pekişmemiş kavramlar var. Yanlış yaptığın soruları hemen inceleyebilir ve konuyu tekrar çalışabilirsin."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {attemptResult.wrongQuestions.length > 0 && (
            <button
              onClick={handleStartRetryWrong}
              className="flex items-center gap-2 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Yanlışları Tekrar Çöz ({attemptResult.wrongQuestions.length})
            </button>
          )}

          <button
            onClick={() => {
              setActiveQuestionList(questions);
              setCurrentIndex(0);
              setUserAnswers({});
              setSelectedAnswer("");
              setFillBlankInput("");
              setHasSubmitted(false);
              setShowHint(false);
              setIsCompleted(false);
              setRetryWrongOnly(false);
            }}
            className="flex items-center gap-2 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2.5 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Tüm Quizi Yeniden Başlat
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return <div className="p-8 text-center text-xs text-muted-foreground">Soru yükleniyor...</div>;
  }

  const isCurrentCorrect =
    hasSubmitted &&
    (currentQ.type === "fill_in_the_blank"
      ? fillBlankInput.trim().toLowerCase() === currentQ.correctAnswer.toLowerCase().trim()
      : selectedAnswer.trim().toLowerCase() === currentQ.correctAnswer.toLowerCase().trim());

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden max-w-2xl mx-auto">
      {/* Quiz Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary uppercase">
            Soru {currentIndex + 1} / {activeQuestionList.length}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {currentQ.difficulty}
          </span>
        </div>

        {/* Hint toggle */}
        {currentQ.hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity font-medium"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {showHint ? "İpucunu Gizle" : "İpucu Al"}
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Hint banner if active */}
        {showHint && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2 animate-in fade-in">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-0.5">Yapay Zekâ İpucu:</strong>
              {currentQ.hint}
            </div>
          </div>
        )}

        {/* Question Title */}
        <h3 className="text-sm font-semibold text-foreground leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Optional LaTeX Math */}
        {renderMath(currentQ.math)}

        {/* Optional Code Snippet */}
        {currentQ.code && (
          <div className="p-3 rounded-lg bg-zinc-950 font-mono text-xs text-zinc-100 overflow-x-auto border border-zinc-800">
            <pre>
              <code>{currentQ.code}</code>
            </pre>
          </div>
        )}

        {/* Options for Multiple Choice or True/False or Code Prediction */}
        {currentQ.options && currentQ.options.length > 0 ? (
          <div className="space-y-2 pt-1">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isRight = option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

              let style = "border-border hover:bg-accent/50 text-foreground";
              if (hasSubmitted) {
                if (isRight) {
                  style = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold";
                } else if (isSelected && !isRight) {
                  style = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                } else {
                  style = "border-border opacity-50";
                }
              } else if (isSelected) {
                style = "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary";
              }

              return (
                <button
                  key={idx}
                  disabled={hasSubmitted}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${style}`}
                >
                  <span className="flex-1 pr-2">{option}</span>
                  {hasSubmitted && isRight && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  {hasSubmitted && isSelected && !isRight && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Fill in the blank input */
          <div className="pt-2">
            <label className="text-xs text-muted-foreground block mb-1.5 font-medium">
              Cevabını Yaz:
            </label>
            <input
              type="text"
              disabled={hasSubmitted}
              placeholder="Örn: nullptr, O(n log n), &..."
              value={fillBlankInput}
              onChange={e => setFillBlankInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-mono"
            />
          </div>
        )}

        {/* Explanation Banner after submission */}
        {hasSubmitted && (
          <div
            className={`p-3.5 rounded-lg border text-xs leading-relaxed animate-in fade-in space-y-1 ${
              isCurrentCorrect
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                : "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300"
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5">
              {isCurrentCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Doğru Cevap! Harika Analiz</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>
                    Yanlış! Doğru cevap: <strong>{currentQ.correctAnswer}</strong>
                  </span>
                </>
              )}
            </div>
            <p className="text-muted-foreground pt-1">{currentQ.explanation}</p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          {!hasSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={
                currentQ.type === "fill_in_the_blank" ? !fillBlankInput.trim() : !selectedAnswer
              }
              className="text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
            >
              Cevabı Onayla
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
            >
              <span>{currentIndex + 1 < activeQuestionList.length ? "Sonraki Soru" : "Sonuçları Gör"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
