"use client";

import React, { useState, useEffect } from "react";
import { 
  getStoredApiKey, 
  saveApiKey, 
  getGamificationState, 
  saveCourses, 
  saveStudyTasks 
} from "@/lib/storage";
import { INITIAL_COURSES } from "@/data/initial-courses";
import { 
  Settings, 
  Key, 
  ShieldCheck, 
  Clock, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Save,
  Moon,
  Info
} from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [dailyTarget, setDailyTarget] = useState(60);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setApiKey(getStoredApiKey());
    const g = getGamificationState();
    if (g) setDailyTarget(g.dailyTargetMinutes);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKey(apiKey.trim());

    const g = getGamificationState();
    g.dailyTargetMinutes = Number(dailyTarget);
    localStorage.setItem("mindforge_gamification", JSON.stringify(g));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (confirm("Tüm dersleri, çalışma kayıtlarını ve quiz denemelerini fabrika ayarlarına sıfırlamak istediğinize emin misiniz?")) {
      saveCourses(INITIAL_COURSES);
      localStorage.removeItem("mindforge_quiz_attempts");
      localStorage.removeItem("mindforge_exam_results");
      localStorage.removeItem("mindforge_study_tasks");
      alert("Tüm veriler başarıyla sıfırlandı!");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          <span>Platform Ayarları</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Yapay zekâ anahtarı, günlük çalışma hedefleri ve hesap tercihlerinizi yönetin.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gemini API Key Card */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
            <Key className="w-4 h-4 text-primary" />
            <span>Google Gemini API Anahtarı</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            MindForge AI; müfredat oluşturma, 9 adımlı ders anlatımı, quiz soru üretimi ve yapay zekâ öğretmen danışmanlığı için Gemini API'ı kullanır. API anahtarı girmediğiniz takdirde platform yerleşik yüksek nitelikli akademik simülasyon motorunu kullanır.
          </p>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Gemini API Key:
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-input bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Anahtarınız yalnızca tarayıcınızda yerel olarak saklanır ve doğrudan güvenli backend isteklerinde kullanılır.
            </span>
          </div>
        </div>

        {/* Study Targets Card */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
            <Clock className="w-4 h-4 text-primary" />
            <span>Çalışma Hedefleri & Rutin</span>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Günlük Çalışma Hedefi (Dakika): {dailyTarget} dk
            </label>
            <input
              type="range"
              min="20"
              max="180"
              step="10"
              value={dailyTarget}
              onChange={e => setDailyTarget(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>20 dk (Hafif)</span>
              <span>60 dk (Önerilen)</span>
              <span>180 dk (Yoğun Vize Dönemi)</span>
            </div>
          </div>
        </div>

        {/* Save button & feedback */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Ayarlar başarıyla kaydedildi!</span>
            </div>
          )}
          {!savedSuccess && <div />}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Ayarları Kaydet</span>
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3">
        <h3 className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
          <RotateCcw className="w-4 h-4" />
          <span>Verileri Sıfırla (Fabrika Ayarları)</span>
        </h3>
        <p className="text-xs text-muted-foreground">
          Tüm oluşturulan müfredatları, kaydedilen quiz sonuçlarını ve çalışma planı görevlerini varsayılan 12 derse sıfırlayabilirsiniz.
        </p>
        <button
          onClick={handleResetData}
          className="px-4 py-2 rounded-lg border border-destructive/40 text-destructive text-xs font-semibold hover:bg-destructive/10 transition-colors"
        >
          Tüm Verileri Sıfırla
        </button>
      </div>
    </div>
  );
}
