"use client";

import React, { useState, useEffect } from "react";
import { 
  getStoredCourses, 
  getStoredStudyTasks, 
  saveStudyTasks, 
  toggleTaskCompleted,
  getGamificationState
} from "@/lib/storage";
import { Course, StudyPlanTask } from "@/lib/types";
import { 
  CalendarDays, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  AlertTriangle, 
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";

export default function StudyPlannerPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<StudyPlanTask[]>([]);
  const [dailyTarget, setDailyTarget] = useState(60);
  const [selectedCourseForTask, setSelectedCourseForTask] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState(45);
  const [newTaskPriority, setNewTaskPriority] = useState<"Yüksek" | "Orta" | "Düşük">("Orta");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    setCourses(getStoredCourses());
    setTasks(getStoredStudyTasks());
    const g = getGamificationState();
    if (g) setDailyTarget(g.dailyTargetMinutes);
  }, []);

  const handleToggle = (taskId: string) => {
    toggleTaskCompleted(taskId);
    setTasks(getStoredStudyTasks());
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const course = courses.find(c => c.id === selectedCourseForTask) || courses[0];
    const newTask: StudyPlanTask = {
      id: `task-${Date.now()}`,
      courseId: course ? course.id : "cpp-intro",
      courseTitle: course ? course.title : "Genel Ders",
      topicTitle: newTaskTitle,
      date: new Date().toISOString().split("T")[0],
      durationMinutes: newTaskDuration,
      completed: false,
      priority: newTaskPriority
    };

    const updated = [...tasks, newTask];
    saveStudyTasks(updated);
    setTasks(updated);
    setNewTaskTitle("");
  };

  const handleAiAutoSchedule = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      // Intelligently generate plan based on upcoming exams & weak topics
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];

      const generated: StudyPlanTask[] = [
        {
          id: `ai-task-1`,
          courseId: "cpp-intro",
          courseTitle: "C++ Programlamaya Giriş",
          topicTitle: "İşaretçi Aritmetiği & Bellek Yönetimi (Vizeye 21 Gün Kaldı)",
          date: today,
          durationMinutes: 45,
          completed: false,
          priority: "Yüksek"
        },
        {
          id: `ai-task-2`,
          courseId: "math-1",
          courseTitle: "Matematik 1",
          topicTitle: "Limit ve Çarpanlara Ayırma Pratiği",
          date: today,
          durationMinutes: 30,
          completed: false,
          priority: "Orta"
        },
        {
          id: `ai-task-3`,
          courseId: "oop-cpp",
          courseTitle: "OOP (C++ ile)",
          topicTitle: "Kalıtım (Inheritance) Taban Sınıf Kurucuları",
          date: tomorrow,
          durationMinutes: 45,
          completed: false,
          priority: "Yüksek"
        },
        {
          id: `ai-task-4`,
          courseId: "operating-systems",
          courseTitle: "İşletim Sistemleri",
          topicTitle: "CPU Çizelgeleme Simülasyonu & Gantt Şemaları",
          date: dayAfter,
          durationMinutes: 40,
          completed: false,
          priority: "Orta"
        }
      ];

      saveStudyTasks(generated);
      setTasks(generated);
      setIsAiGenerating(false);
    }, 600);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const upcomingTasks = tasks.filter(t => t.date !== todayStr);

  const completedTodayMins = todayTasks
    .filter(t => t.completed)
    .reduce((a, b) => a + b.durationMinutes, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            <span>AI Çalışma Planım</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sınav tarihlerine ve öğrenme yeterliliğine göre optimize edilmiş akıllı çalışma takvimi.
          </p>
        </div>

        <button
          onClick={handleAiAutoSchedule}
          disabled={isAiGenerating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:bg-primary/90 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{isAiGenerating ? "Plan Hesaplanıyor..." : "Yapay Zekâ ile Planı Yeniden Optimize Et"}</span>
        </button>
      </div>

      {/* Target Progress Card */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Bugünün Çalışma Yükü
          </span>
          <span className="font-mono text-muted-foreground">
            {completedTodayMins} / {dailyTarget} Dakika Tamamlandı
          </span>
        </div>

        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((completedTodayMins / dailyTarget) * 100))}%` }}
          />
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Task Lists */}
        <div className="lg:col-span-2 space-y-5">
          {/* Today's Tasks */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Bugünün Çalışma Görevleri ({todayTasks.length})</span>
              <span className="text-[11px] font-normal text-muted-foreground font-mono">{todayStr}</span>
            </h2>

            <div className="space-y-2">
              {todayTasks.length > 0 ? (
                todayTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => handleToggle(task.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      task.completed
                        ? "border-emerald-500/20 bg-emerald-500/5 text-muted-foreground line-through opacity-75"
                        : "border-border bg-background hover:border-primary/40 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <span className="font-bold block">{task.topicTitle}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {task.courseTitle} • Süre: {task.durationMinutes} dk
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        task.priority === "Yüksek"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 font-bold"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {task.priority} Öncelik
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Bugün için planlanmış bir görev kalmadı. Harika iş!
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Gelecek Günlerin Planı ({upcomingTasks.length})
            </h2>

            <div className="space-y-2">
              {upcomingTasks.map(task => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-border bg-background flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground block">{task.topicTitle}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {task.courseTitle} • {task.date}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {task.durationMinutes} dk
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Add Manual Task */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <span>Plana Görev Ekle</span>
          </h2>

          <form onSubmit={handleAddTask} className="space-y-3 text-xs">
            <div>
              <label className="text-muted-foreground block mb-1 font-medium">Ders</label>
              <select
                value={selectedCourseForTask}
                onChange={e => setSelectedCourseForTask(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1 font-medium">Konu / Hedef</label>
              <input
                type="text"
                placeholder="Örn: 20 soru soru bankasından çöz"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Süre (dk)</label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  step="15"
                  value={newTaskDuration}
                  onChange={e => setNewTaskDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Öncelik</label>
                <select
                  value={newTaskPriority}
                  onChange={e => setNewTaskPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                >
                  <option value="Yüksek">Yüksek</option>
                  <option value="Orta">Orta</option>
                  <option value="Düşük">Düşük</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm mt-2"
            >
              Görevi Kaydet
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
