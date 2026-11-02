"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun, Flame, Zap, Award, BookCheck } from "lucide-react";
import { getGamificationState } from "@/lib/storage";
import { GamificationState } from "@/lib/types";

export function Header() {
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setGamification(getGamificationState());
    const isDarkMode = document.documentElement.classList.contains("dark") || 
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="h-16 px-6 border-b border-border bg-card/40 backdrop-blur sticky top-0 z-30 flex items-center justify-between">
      <div className="flex items-center gap-4 pl-10 lg:pl-0">
        <span className="text-xs font-medium text-muted-foreground hidden sm:inline-block">
          Günün Sözü: <span className="text-foreground italic">"Anlamadığın kodu asla kopyalama."</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>{gamification?.streakDays || 7} Gün</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{gamification?.xp || 1420} XP</span>
        </div>

        {/* Level */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>Seviye {gamification?.level || 4}</span>
        </div>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
          title="Temayı Değiştir"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
