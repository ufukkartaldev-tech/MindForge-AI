import { Badge } from "@/lib/types";

export const INITIAL_BADGES: Badge[] = [
  {
    id: "badge-first-topic",
    title: "İlk Adım",
    description: "Platformdaki ilk konunu başarıyla tamamladın.",
    icon: "Footprints",
    category: "study",
    unlockedAt: "2026-10-20T10:00:00Z"
  },
  {
    id: "badge-10-quizzes",
    title: "Soru Avcısı",
    description: "10 farklı quiz testini başarıyla çözdün.",
    icon: "Target",
    category: "quiz",
    unlockedAt: "2026-10-29T18:00:00Z"
  },
  {
    id: "badge-math-master",
    title: "Matematik Kurdu",
    description: "Matematik veya Mühendislik konularında %85 üzeri başarı elde ettin.",
    icon: "Binary",
    category: "course",
    unlockedAt: "2026-10-31T12:00:00Z"
  },
  {
    id: "badge-streak-7",
    title: "7 Günlük Seri",
    description: "7 gün boyunca aralıksız her gün MindForge üzerinde çalıştın.",
    icon: "Flame",
    category: "streak",
    unlockedAt: "2026-11-01T20:30:00Z"
  },
  {
    id: "badge-code-ninja",
    title: "Kodlama Serisi",
    description: "C++, C# ve Algoritma konularındaki tüm kod tamamlama pratiklerini hatasız geçtin.",
    icon: "Code2",
    category: "course"
  },
  {
    id: "badge-exam-veteran",
    title: "Vizeye Hazır",
    description: "İlk vize simülasyonunu %80 ve üzeri başarıyla tamamladın.",
    icon: "Award",
    category: "quiz"
  }
];
