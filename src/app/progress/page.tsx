"use client";

import React, { useState, useEffect } from "react";
import { getStoredCourses, getGamificationState, getStoredQuizAttempts } from "@/lib/storage";
import { Course, GamificationState, QuizAttempt, Topic } from "@/lib/types";
import { 
  TrendingUp, 
  Award, 
  Flame, 
  Zap, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Target,
  BarChart2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

export default function ProgressPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    setCourses(getStoredCourses());
    setGamification(getGamificationState());
    setAttempts(getStoredQuizAttempts());
  }, []);

  // Compute status distributions
  let mastered = 0;
  let inProgress = 0;
  let developing = 0;
  let needsReview = 0;
  let unstarted = 0;

  const courseBarData: { name: string; score: number }[] = [];

  courses.forEach(c => {
    let sum = 0;
    let count = 0;

    c.modules.forEach(m => {
      m.topics.forEach(t => {
        count++;
        sum += t.masteryScore;
        if (t.masteryStatus === "mastered") mastered++;
        else if (t.masteryStatus === "in_progress") inProgress++;
        else if (t.masteryStatus === "developing") developing++;
        else if (t.masteryStatus === "needs_review") needsReview++;
        else unstarted++;
      });
    });

    courseBarData.push({
      name: c.title.length > 12 ? c.title.substring(0, 12) + "..." : c.title,
      score: count > 0 ? Math.round(sum / count) : 0
    });
  });

  const pieData = [
    { name: "Öğrenildi", value: mastered, color: "#10b981" },
    { name: "Çalışılıyor", value: inProgress, color: "#3b82f6" },
    { name: "Gelişiyor", value: developing, color: "#8b5cf6" },
    { name: "Tekrar Edilmeli", value: needsReview, color: "#f59e0b" },
    { name: "Öğrenilmedi", value: unstarted, color: "#6b7280" }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          <span>İlerleme ve Öğrenme Yeterlilik Analizi</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Adaptif öğrenme motorunun quiz, pratik ve çalışma sürelerine göre oluşturduğu performans haritası.
        </p>
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Toplam Puan</span>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black font-mono text-primary">
            {gamification?.xp || 1420} XP
          </div>
          <span className="text-[11px] text-muted-foreground block">
            Seviye {gamification?.level || 4}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Çalışma Serisi</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-500">
            {gamification?.streakDays || 7} Gün
          </div>
          <span className="text-[11px] text-muted-foreground block">
            Zinciri kırma!
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Öğrenilen Konular</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-500">
            {mastered} Konu
          </div>
          <span className="text-[11px] text-muted-foreground block">
            Tam kavrandı
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Tekrar Listesi</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-500">
            {needsReview} Konu
          </div>
          <span className="text-[11px] text-muted-foreground block">
            Vize öncesi öncelikli
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Course Mastery Bar Chart */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span>Ders Bazında Yeterlilik Puanları (%)</span>
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" stroke="#6b7280" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px" }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <span>Konu Durumu Dağılımı</span>
          </h2>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}:</span>
                <span className="font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges & Gamification Showcase */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Kazanılan Başarı Rozetleri</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {gamification?.badges.map(badge => {
            const isUnlocked = !!badge.unlockedAt;

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border text-center space-y-2 transition-all ${
                  isUnlocked
                    ? "border-primary/30 bg-primary/5 text-foreground shadow-sm"
                    : "border-border bg-muted/20 opacity-40 grayscale"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs block">{badge.title}</span>
                  <span className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                    {badge.description}
                  </span>
                </div>
                {isUnlocked && (
                  <span className="text-[9px] font-mono text-emerald-500 font-semibold block">
                    Kazanıldı
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
