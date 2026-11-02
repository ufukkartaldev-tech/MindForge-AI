"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Clock, 
  Flame, 
  Award, 
  Calendar, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  BookOpen,
  Code2,
  Globe,
  BarChart3,
  Binary,
  Layers,
  ShieldAlert,
  Atom,
  TerminalSquare,
  BrainCircuit,
  Calculator,
  Cpu,
  GitBranch,
  Target
} from "lucide-react";
import { getStoredCourses, getGamificationState } from "@/lib/storage";
import { Course, GamificationState, Topic } from "@/lib/types";

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  Code2,
  Globe,
  BarChart3,
  Binary,
  Layers,
  ShieldAlert,
  Atom,
  TerminalSquare,
  BrainCircuit,
  Calculator,
  Cpu,
  GitBranch
};

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [gamification, setGamification] = useState<GamificationState | null>(null);

  useEffect(() => {
    setCourses(getStoredCourses());
    setGamification(getGamificationState());
  }, []);

  // Compute aggregate metrics
  const allTopics: { topic: Topic; courseTitle: string; courseId: string }[] = [];
  courses.forEach(c => {
    c.modules.forEach(m => {
      m.topics.forEach(t => {
        allTopics.push({ topic: t, courseTitle: c.title, courseId: c.id });
      });
    });
  });

  const totalTopics = allTopics.length;
  const completedTopics = allTopics.filter(t => t.topic.masteryStatus === "mastered").length;
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const totalStudyMinutes = allTopics.reduce((acc, t) => acc + (t.topic.timeSpentMinutes || 0), 0);

  // Weak topics (needs review or low score)
  const weakTopics = allTopics
    .filter(t => t.topic.masteryStatus === "needs_review" || (t.topic.masteryScore > 0 && t.topic.masteryScore < 60))
    .slice(0, 3);

  // Recently studied topics
  const recentTopics = allTopics
    .filter(t => t.topic.lastStudiedAt)
    .sort((a, b) => new Date(b.topic.lastStudiedAt!).getTime() - new Date(a.topic.lastStudiedAt!).getTime())
    .slice(0, 3);

  // Today's suggested courses (e.g. Pazartesi or current day)
  const currentDay = "Pazartesi"; // or dynamic
  const todayCourses = courses.filter(c => c.dayOfWeek === currentDay || c.id === "cpp-intro" || c.id === "math-1");

  // Upcoming exams
  const upcomingExams = courses
    .filter(c => c.examDate)
    .sort((a, b) => new Date(a.examDate!).getTime() - new Date(b.examDate!).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome & Hero Banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-card via-card to-primary/5 p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kişiselleştirilmiş Yapay Zekâ Eğitimi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Hoş geldin, Geleceğin Mühendisi! 👋
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bugün PDF veya slayt yüklemen gerekmeden, doğrudan interaktif modellerle konuları kavrayabilir, kodlama simülasyonları yapabilir ve vize sınavlarına hazırlanabilirsin.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/courses/cpp-intro/learn/cpp-t5"
              className="inline-flex items-center gap-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <span>Kaldığın Yerden Devam Et: C++ İşaretçiler</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/exam"
              className="inline-flex items-center gap-2 text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2.5 rounded-lg border border-border transition-colors"
            >
              <Target className="w-4 h-4 text-primary" />
              <span>Vize Simülasyonunu Başlat</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Daily Target */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Günün Hedefi</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono text-foreground">
            {gamification?.todayStudiedMinutes || 45} / {gamification?.dailyTargetMinutes || 60} <span className="text-xs font-normal text-muted-foreground">dk</span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${Math.min(100, Math.round(((gamification?.todayStudiedMinutes || 45) / (gamification?.dailyTargetMinutes || 60)) * 100))}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Çalışma Serisi</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-500">
            {gamification?.streakDays || 7} <span className="text-xs font-normal text-muted-foreground">Gün</span>
          </div>
          <span className="text-[11px] text-muted-foreground block">
            Aralıksız devam ediyor 🔥
          </span>
        </div>

        {/* Overall Progress */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Genel İlerleme</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-foreground">
            %{overallProgress}
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Total Time */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Öğrenme Süresi</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black font-mono text-foreground">
            {Math.floor(totalStudyMinutes / 60)}s {totalStudyMinutes % 60}d
          </div>
          <span className="text-[11px] text-muted-foreground block">
            {completedTopics} konu tam öğrenildi
          </span>
        </div>
      </div>

      {/* 3. AI Recommendations & Weak Topics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Insights & Weak Points */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Tutor Personalized Recommendation */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Sparkles className="w-4 h-4 fill-current" />
              <span>YAPAY ZEKÂ KİŞİSELLEŞTİRİLMİŞ TAVSİYESİ</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              "Son çözdüğün quizlerde <strong>C++ İşaretçiler (Pointers)</strong> ve <strong>Kalıtım (Inheritance)</strong> konularında başarı oranın %40 seviyelerinde kaldı. Yaklaşan vize sınavından önce bu iki konunun interaktif bellek simülasyonunu tekrar etmen başarını %35 artıracaktır."
            </p>
          </div>

          {/* Eksik / Tekrar Edilmesi Gereken Konular */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Eksik Öğrenilen Konular (Tekrar Listesi)
              </h3>
              <span className="text-[11px] text-muted-foreground">Öncelikli</span>
            </div>

            <div className="space-y-2">
              {weakTopics.length > 0 ? (
                weakTopics.map(({ topic, courseTitle, courseId }) => (
                  <div
                    key={topic.id}
                    className="p-3 rounded-lg border border-border bg-background flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground block">
                        {topic.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {courseTitle} • Başarı: %{topic.masteryScore}
                      </span>
                    </div>
                    <Link
                      href={`/courses/${courseId}/learn/${topic.id}`}
                      className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      Çalış <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Harika gidiyorsun! Şu an eksik işaretlenmiş kritik bir konu bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Upcoming Exams & Today's Plan */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-border bg-card space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-primary" />
              Yaklaşan Vize Sınavları
            </h3>

            <div className="space-y-2.5">
              {upcomingExams.map(c => {
                const examD = new Date(c.examDate!);
                const now = new Date();
                const diffDays = Math.ceil((examD.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={c.id} className="p-3 rounded-lg bg-background border border-border text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground truncate max-w-[150px]">
                        {c.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold">
                        {diffDays > 0 ? `${diffDays} gün kaldı` : "Bugün!"}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex justify-between">
                      <span>{c.examDate}</span>
                      <span>{c.examLocation || "Amfi"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Ders Kartları (12 Üniversite Dersi) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Derslerim ({courses.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Müfredat programında tanımlı hazır üniversite derslerin. Herhangi birine tıklayarak interaktif derse başla.
            </p>
          </div>
          <Link
            href="/courses"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            Tümünü Yönet <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => {
            const Icon = ICON_MAP[course.icon] || BookOpen;

            // Stats for course
            let cTotal = 0;
            let cCompleted = 0;
            course.modules.forEach(m => {
              m.topics.forEach(t => {
                cTotal++;
                if (t.masteryStatus === "mastered") cCompleted++;
              });
            });
            const cPct = cTotal > 0 ? Math.round((cCompleted / cTotal) * 100) : 0;

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                      {course.dayOfWeek} {course.timeSlot}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>İlerleme: %{cPct}</span>
                    <span className="font-mono">{cCompleted}/{cTotal} Konu</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${cPct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
