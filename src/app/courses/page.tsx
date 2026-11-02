"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  Check,
  X,
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
} from "lucide-react";
import { getStoredCourses, saveCourses, deleteCourse, saveCourse } from "@/lib/storage";
import { Course } from "@/lib/types";

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Bilgisayar Mühendisliği",
    dayOfWeek: "Pazartesi" as Course["dayOfWeek"],
    timeSlot: "10.00–12.00",
    examDate: "",
    examLocation: ""
  });

  useEffect(() => {
    setCourses(getStoredCourses());
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Bu dersi ve ilgili tüm konuları silmek istediğinize emin misiniz?")) {
      deleteCourse(id);
      setCourses(getStoredCourses());
    }
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      category: "Bilgisayar Mühendisliği",
      dayOfWeek: "Pazartesi",
      timeSlot: "10.00–12.00",
      examDate: "",
      examLocation: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      dayOfWeek: course.dayOfWeek,
      timeSlot: course.timeSlot,
      examDate: course.examDate || "",
      examLocation: course.examLocation || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editingCourse) {
      const updated: Course = {
        ...editingCourse,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        dayOfWeek: formData.dayOfWeek,
        timeSlot: formData.timeSlot,
        examDate: formData.examDate,
        examLocation: formData.examLocation
      };
      saveCourse(updated);
    } else {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        icon: "BookOpen",
        category: formData.category,
        difficulty: "Orta",
        dayOfWeek: formData.dayOfWeek,
        timeSlot: formData.timeSlot,
        examDate: formData.examDate,
        examLocation: formData.examLocation,
        createdAt: new Date().toISOString(),
        modules: [
          {
            id: `mod-${Date.now()}`,
            courseId: `course-${Date.now()}`,
            title: "Temel Kavramlar",
            description: "Giriş ve temel ilkeler.",
            orderIndex: 1,
            topics: [
              {
                id: `top-${Date.now()}`,
                moduleId: `mod-${Date.now()}`,
                courseId: `course-${Date.now()}`,
                title: `${formData.title} Giriş`,
                summary: "Temel tanımlar ve metodoloji.",
                orderIndex: 1,
                difficulty: "Başlangıç",
                learningObjectives: ["Temel kavramları anlamak"],
                masteryStatus: "unstarted",
                masteryScore: 0,
                timeSpentMinutes: 0
              }
            ]
          }
        ]
      };
      saveCourse(newCourse);
    }

    setCourses(getStoredCourses());
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Derslerim ({courses.length})
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Müfredatındaki tüm üniversite derslerini görüntüle, yeni ders ekle veya vize tarihlerini düzenle.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Ders Ekle</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Ders adı veya kategori ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-input bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(course => {
          const Icon = ICON_MAP[course.icon] || BookOpen;

          let topicCount = 0;
          let masteredCount = 0;
          course.modules.forEach(m => {
            m.topics.forEach(t => {
              topicCount++;
              if (t.masteryStatus === "mastered") masteredCount++;
            });
          });
          const pct = topicCount > 0 ? Math.round((masteredCount / topicCount) * 100) : 0;

          return (
            <div
              key={course.id}
              className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm relative group"
            >
              {/* Card Header & Controls */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => handleOpenEdit(course, e)}
                      title="Dersi Düzenle"
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => handleDelete(course.id, e)}
                      title="Dersi Sil"
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {course.category}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {course.dayOfWeek} {course.timeSlot}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-border space-y-3">
                {/* Exam Date Banner */}
                {course.examDate && (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Vize: {course.examDate}
                    </span>
                    <span>{course.examLocation || "Amfi"}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Öğrenildi: %{pct}</span>
                    <span className="font-mono">{masteredCount}/{topicCount} Konu</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/courses/${course.id}`}
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold transition-colors"
                >
                  <span>Ders Detayları & Müfredat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">
                {editingCourse ? "Dersi Düzenle" : "Yeni Üniversite Dersi Ekle"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Ders Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Bilgisayar Ağları"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Kısa Açıklama</label>
                <textarea
                  rows={2}
                  placeholder="Dersin kapsamı ve hedefleri..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Ders Günü</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                  >
                    {["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Ders Saati</label>
                  <input
                    type="text"
                    placeholder="Örn: 13.00–15.00"
                    value={formData.timeSlot}
                    onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Vize Sınav Tarihi</label>
                  <input
                    type="date"
                    value={formData.examDate}
                    onChange={e => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">Sınav Yeri / Salon</label>
                  <input
                    type="text"
                    placeholder="Örn: Amfi B-101"
                    value={formData.examLocation}
                    onChange={e => setFormData({ ...formData, examLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  {editingCourse ? "Değişiklikleri Kaydet" : "Dersi Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
