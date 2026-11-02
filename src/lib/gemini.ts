import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { LessonContent, QuizQuestion, Course } from "./types";

// Zod Schemas for Validation
export const CurriculumSchema = z.object({
  modules: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    orderIndex: z.number(),
    topics: z.array(z.object({
      id: z.string(),
      title: z.string(),
      summary: z.string(),
      orderIndex: z.number(),
      difficulty: z.enum(["Başlangıç", "Orta", "İleri"]),
      prerequisites: z.array(z.string()).optional(),
      learningObjectives: z.array(z.string())
    }))
  }))
});

export const LessonSectionSchema = z.object({
  type: z.enum([
    "intro", "prereq", "concept", "detail", 
    "real_world", "applied", "common_mistakes", 
    "summary", "mini_eval"
  ]),
  title: z.string(),
  content: z.string(),
  mathLatex: z.string().optional(),
  interactiveActivity: z.object({
    type: z.enum(["code_prediction", "code_fix", "math_step", "os_scheduling", "algo_trace", "matching"]),
    title: z.string(),
    prompt: z.string(),
    codeSnippet: z.string().optional(),
    language: z.string().optional(),
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.number()]),
    explanation: z.string(),
    hints: z.array(z.string())
  }).optional()
});

export const LessonContentSchema = z.object({
  topicId: z.string(),
  topicTitle: z.string(),
  courseId: z.string(),
  sections: z.array(LessonSectionSchema)
});

export const QuizQuestionsSchema = z.array(z.object({
  id: z.string(),
  type: z.enum(["multiple_choice", "true_false", "fill_in_the_blank", "code_prediction", "matching"]),
  question: z.string(),
  code: z.string().optional(),
  math: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string(),
  hint: z.string(),
  difficulty: z.enum(["Kolay", "Orta", "Zor"])
}));

// Fallback high-quality lesson generator for standard topics when offline or without API key
export function getFallbackLesson(courseId: string, topicId: string, topicTitle: string): LessonContent {
  // If it's a C++ topic
  if (courseId.includes("cpp") || topicTitle.toLowerCase().includes("pointer") || topicTitle.toLowerCase().includes("işaretçi")) {
    return {
      topicId,
      topicTitle,
      courseId,
      sections: [
        {
          type: "intro",
          title: "1. Konuya Giriş: Bellek Neden Önemlidir?",
          content: "Bilgisayarda çalıştırdığın her program, tanımladığın her değişken ve oluşturduğun her nesne fiziksel RAM üzerinde bir adreste yaşar. Normalde değişken adıyla (`x`, `sayi`) bu hücrelere erişiriz; ancak işaretçiler (pointer) doğrudan bu bellek adreslerinin kendisine erişmemizi ve onları manipüle etmemizi sağlar."
        },
        {
          type: "prereq",
          title: "2. Ön Bilgiler: Değişkenlerin Bellekteki Yeri",
          content: "Bir değişken oluşturduğunda iki temel özellik bulunur: 1) İçerdiği değer (Value) ve 2) Bellekteki konumu (Address). Adres operatörü olan `&` (Ampersand), bir değişkenin RAM adresini döndürür. Örneğin `&sayi`, sayının RAM'deki 16'lık tabandaki (hexadecimal) adresini (`0x7ffee4...`) verir."
        },
        {
          type: "concept",
          title: "3. Temel Kavram: İşaretçi (Pointer) Nedir?",
          content: "İşaretçi, **başka bir değişkenin bellek adresini tutan özel bir değişkendir**. Tipi, işaret ettiği verinin tipiyle eşleşmelidir (`int*`, `double*`, `char*`). Tanımlanırken yıldız `*` kullanılır.",
          interactiveActivity: {
            type: "code_prediction",
            title: "Hızlı Kontrol: Değişken ve Adres",
            prompt: "Aşağıdaki kod parçasında ptr değişkeninin tuttuğu değer nedir?",
            codeSnippet: "int a = 42;\nint* ptr = &a;\nstd::cout << *ptr;",
            language: "cpp",
            options: [
              "a değişkeninin bellek adresi",
              "42",
              "Hata verir",
              "Rastgele bir sayı"
            ],
            correctAnswer: "42",
            explanation: "`*ptr` (dereference) işlemi, ptr'ın tuttuğu adrese giderek oradaki asıl değere erişir. Dolayısıyla ekrana 42 yazdırılır.",
            hints: ["`ptr` adres tutar, ancak başına `*` konulduğunda (dereference) adresteki değere ulaşır."]
          }
        },
        {
          type: "detail",
          title: "4. Detaylı Açıklama: Dereferencing (*) ve Adres (&) Farkı",
          content: "İki kritik operatör vardır:\n\n1. `&` (Adres Operatörü): 'Bu değişken nerede duruyor?' sorusunun cevabıdır.\n2. `*` (Dereference Operatörü): 'Bu adreste hangi değer var?' sorusunun cevabıdır.\n\nEğer `*ptr = 100;` derseniz, `a` değişkenini doğrudan değiştirmeden dolaylı yoldan değerini 100 yapmış olursunuz!"
        },
        {
          type: "real_world",
          title: "5. Gerçek Hayat Benzetmesi: Kargo Dolapları",
          content: "Düşün ki bir sitede kargo dolapları var. Dolabın numarası (örneğin Dolap #42) **bellek adresidir**. Dolabın içindeki koli ise **değerdir**. Sen kuryeye kolinin kendisini vermek yerine sadece dolap numarasını (adres/pointer) verirsen, koca koliyi taşımadan çok hızlı işlem yapmış olursun. C++ fonksiyonlarına devasa nesneleri kopyalamak yerine adreslerini göndermek de tam olarak bu tasarrufu sağlar."
        },
        {
          type: "applied",
          title: "6. Uygulamalı Kod Örneği",
          content: "Aşağıdaki kodda pointer ile değişken manipülasyonunun adımlarını inceleyelim:",
          interactiveActivity: {
            type: "code_fix",
            title: "İnteraktif Kod Tamamlama",
            prompt: "ptr üzerinden 'sayi' değişkeninin değerini 2 katına çıkarıp ekrana yazdırmak istiyoruz. Boş bırakılan yere hangi ifade gelmelidir?",
            codeSnippet: "int sayi = 15;\nint* ptr = &sayi;\n// Değeri ikiye katla:\n___ = *ptr * 2;\nstd::cout << sayi;",
            language: "cpp",
            options: ["*ptr", "ptr", "&ptr", "&sayi"],
            correctAnswer: "*ptr",
            explanation: "`*ptr = *ptr * 2;` ifadesi adresteki 15 değerini alır, 2 ile çarpar (30) ve tekrar o adrese yazar. Böylece `sayi` 30 olur.",
            hints: ["Adresteki değere yazmak için dereference (*) operatörünü kullan."]
          }
        },
        {
          type: "common_mistakes",
          title: "7. Sık Yapılan Hatalar",
          content: "- **Uninitialized Pointer (Wild Pointer)**: Bir işaretçiyi oluşturup hiçbir adrese bağlamadan (`int* p;`) içine değer yazmaya çalışmak programın çökmesine (Segmentation Fault) sebep olur.\n- **Null Pointer Dereference**: `nullptr` olan bir işaretçinin başına `*` koyarak değer okumaya çalışmak en yaygın çökme sebebidir.\n- **Dangling Pointer (Sallantıda Kalan İşaretçi)**: Bellekten silinmiş (delete edilmiş) bir adresin hala kullanılmaya çalışılması."
        },
        {
          type: "summary",
          title: "8. Konu Özeti",
          content: "Pointer'lar C++'ın en güçlü donanım kontrol aracıdır. Büyük verileri kopyalamadan aktarmak, dinamik bellek tahsis etmek (heap) ve karmaşık veri yapıları (linked list, tree) inşa etmek için vazgeçilmezdir."
        },
        {
          type: "mini_eval",
          title: "9. Mini Değerlendirme",
          content: "Tebrikler! Pointer mantığını başarıyla tamamladın. Şimdi öğrendiklerini pekiştirmek için bu konunun Quiz testine geçebilirsin."
        }
      ]
    };
  }

  // Generic rich pedagogical fallback
  return {
    topicId,
    topicTitle,
    courseId,
    sections: [
      {
        type: "intro",
        title: "1. Konuya Giriş",
        content: `${topicTitle} konusuna hoş geldin! Bu ders boyunca konunun temel mantığını, gerçek hayattaki izdüşümlerini ve problem çözme yaklaşımlarını adım adım ele alacağız.`
      },
      {
        type: "prereq",
        title: "2. Ön Bilgiler ve Hazırlık",
        content: `Bu konuyu sağlam kavramak için temel mantıksal bağıntıları ve önceki derslerde incelediğimiz yapı taşlarını hatırlamamız gerekiyor. Konunun adımlarını sırayla takip ettiğinde tüm parçalar birleşecektir.`
      },
      {
        type: "concept",
        title: "3. Temel Kavram ve Teori",
        content: `${topicTitle}, akademik literatürde ve mühendislik uygulamalarında temel bir omurga oluşturur. Sistemin nasıl çalıştığını soyuttan somuta doğru inceliyoruz.`,
        mathLatex: courseId.includes("math") || courseId.includes("data") ? "f(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x) - f(x)}{\\Delta x}" : undefined
      },
      {
        type: "detail",
        title: "4. Detaylı Açıklama ve Mekanizma",
        content: "Konunun mekanizmasını oluşturan parametreler birbirine sıkı sıkıya bağlıdır. Her bir girdi, sistemin çıktısını ve çalışma verimliliğini doğrudan etkiler."
      },
      {
        type: "real_world",
        title: "5. Gerçek Hayat Uygulaması",
        content: "Bu prensip günlük hayatta modern teknoloji sistemlerinde, otomasyonda ve yazılım mimarilerinde ölçeklenebilirliği garanti altına almak için aktif olarak kullanılır."
      },
      {
        type: "applied",
        title: "6. Uygulamalı Örnek & Problem Çözümü",
        content: "Şimdi karşına çıkabilecek tipik bir sınav sorusu veya endüstri problemi üzerinden adımları uygulayalım:",
        interactiveActivity: {
          type: "matching",
          title: "Kavram - Anlam Eşleştirmesi",
          prompt: "Bu konuda öğrendiğin kritik kavramın temel görevini seç:",
          options: ["Doğru Yaklaşım", "Yanlış Yaklaşım", "İlgisiz Parametre"],
          correctAnswer: "Doğru Yaklaşım",
          explanation: "Temel prensip uygulandığında sistem optimum çalışma koşullarına ulaşır.",
          hints: ["Dersin ilk bölümlerinde vurgulanan temel tanımı hatırla."]
        }
      },
      {
        type: "common_mistakes",
        title: "7. Sık Yapılan Hatalar ve Dikkat Edilecekler",
        content: "Öğrencilerin vize ve finallerde en sık puan kaybettiği noktalar: işlem önceliği hataları, ön koşulları göz ardı etme ve sınır durumlarını (edge-cases) test etmemektir."
      },
      {
        type: "summary",
        title: "8. Konu Özeti",
        content: `${topicTitle} konusunun kilit prensiplerini kavradın. Artık bu teoriyi uygulamaya dökme ve quiz çözme vaktin geldi.`
      },
      {
        type: "mini_eval",
        title: "9. Mini Değerlendirme & Sonraki Adım",
        content: "Harika iş çıkardın! Bilgilerini kalıcı hale getirmek için hemen konu quiz'ini başlat."
      }
    ]
  };
}

// Fallback Quiz questions generator
export function getFallbackQuiz(courseId: string, topicTitle: string): QuizQuestion[] {
  if (courseId.includes("cpp") || topicTitle.toLowerCase().includes("pointer")) {
    return [
      {
        id: "q1",
        type: "multiple_choice",
        question: "C++ dilinde bir değişkenin RAM üzerindeki bellek adresini almak için hangi operatör kullanılır?",
        options: ["*", "&", "->", "%"],
        correctAnswer: "&",
        explanation: "`&` (ampersand) operatörü değişkenin bellek adresini döndürür. `*` ise dereferencing (adresteki değere erişim) içindir.",
        hint: "İngilizce 'Address-of' operatörü olarak adlandırılır.",
        difficulty: "Kolay"
      },
      {
        id: "q2",
        type: "code_prediction",
        question: "Aşağıdaki C++ kodunun konsol çıktısı ne olur?",
        code: "int x = 10;\nint* p = &x;\n*p = 25;\nstd::cout << x;",
        options: ["10", "25", "x'in adresi", "Derleme hatası"],
        correctAnswer: "25",
        explanation: "`*p = 25;` ifadesi p'nin işaret ettiği adres olan x'in değerini 25 olarak günceller.",
        hint: "`*p` üzerinden yapılan değişiklik doğrudan `x`'i etkiler.",
        difficulty: "Orta"
      },
      {
        id: "q3",
        type: "true_false",
        question: "Henüz hiçbir bellek adresine atanmamış (uninitialized) bir işaretçiyi dereference etmek güvenlidir.",
        options: ["Doğru", "Yanlış"],
        correctAnswer: "Yanlış",
        explanation: "Başlatılmamış bir işaretçiyi dereference etmek rastgele bir bellek bölgesine yazmaya çalışır ve 'Segmentation Fault' çökmesine yol açar.",
        hint: "Wild pointer kavramını hatırla.",
        difficulty: "Kolay"
      },
      {
        id: "q4",
        type: "fill_in_the_blank",
        question: "C++11 standardında hiçbir yeri göstermeyen güvenli boş işaretçi sabiti olarak hangi anahtar kelime kullanılır?",
        correctAnswer: "nullptr",
        explanation: "Eski C tarzı `NULL` yerine tür güvenliği sağlayan `nullptr` anahtar kelimesi kullanılır.",
        hint: "null ile başlar, ptr ile biter.",
        difficulty: "Orta"
      }
    ];
  }

  if (courseId.includes("math")) {
    return [
      {
        id: "q-m1",
        type: "multiple_choice",
        question: "Limiti x -> 0 iken sin(x)/x ifadesinin değeri kaçtır?",
        math: "\\lim_{x \\to 0} \\frac{\\sin(x)}{x}",
        options: ["0", "1", "Sonsuz", "Tanımsız"],
        correctAnswer: "1",
        explanation: "L'Hopital kuralı veya birim çember geometrisi ile bu standart limitin değeri 1'dir.",
        hint: "0/0 belirsizliğine L'Hopital uyguladığında cos(0)/1 gelir.",
        difficulty: "Kolay"
      },
      {
        id: "q-m2",
        type: "multiple_choice",
        question: "f(x) = x^3 + 2x fonksiyonunun türevi f'(x) nedir?",
        math: "f'(x) = ?",
        options: ["3x^2 + 2", "3x^2", "x^2 + 2", "3x + 2"],
        correctAnswer: "3x^2 + 2",
        explanation: "Kuvvet kuralı: d/dx(x^n) = n*x^(n-1). d/dx(x^3) = 3x^2 ve d/dx(2x) = 2.",
        hint: "Kuvveti başa katsayı olarak indirip üssü bir azalt.",
        difficulty: "Kolay"
      }
    ];
  }

  if (courseId.includes("algo") || courseId.includes("os")) {
    return [
      {
        id: "q-a1",
        type: "multiple_choice",
        question: "İkili Arama (Binary Search) algoritmasının en kötü durumdaki zaman karmaşıklığı (Time Complexity) nedir?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        correctAnswer: "O(log n)",
        explanation: "Binary Search diziyi her adımda iki eşit parçaya böler; bu nedenle arama adımı logaritma tabanında ilerler.",
        hint: "Her adımda arama uzayı yarıya iner.",
        difficulty: "Kolay"
      },
      {
        id: "q-a2",
        type: "true_false",
        question: "Binary Search algoritmasını uygulayabilmek için dizinin önceden sıralı (sorted) olması zorunludur.",
        options: ["Doğru", "Yanlış"],
        correctAnswer: "Doğru",
        explanation: "Eğer dizi sıralı değilse ortadaki elemana göre sağa veya sola karar verilemez.",
        hint: "Rastgele sırada olan bir listede elemanın nerede olduğunu tahmin edebilir misin?",
        difficulty: "Kolay"
      }
    ];
  }

  // Default questions
  return [
    {
      id: "q-gen-1",
      type: "multiple_choice",
      question: `${topicTitle} konusundaki temel yaklaşımın ana hedefi nedir?`,
      options: [
        "Sistemin doğruluğunu ve verimini maksimize etmek",
        "Karmaşıklığı gereksiz yere artırmak",
        "Tüm kaynakları tek bir noktada tüketmek",
        "Daha yavaş ve maliyetli bir yapı kurmak"
      ],
      correctAnswer: "Sistemin doğruluğunu ve verimini maksimize etmek",
      explanation: "Tüm mühendislik ve akademik metotların ana gayesi optimum verimliliktir.",
      hint: "En faydalı seçeneği düşün.",
      difficulty: "Kolay"
    },
    {
      id: "q-gen-2",
      type: "true_false",
      question: "Bu konudaki kuralları uygulamadan önce ön koşulların sağlanmış olması gereklidir.",
      options: ["Doğru", "Yanlış"],
      correctAnswer: "Doğru",
      explanation: "Ön koşullar sağlanmadığında teorik varsayımlar geçerliliğini yitirir.",
      hint: "Adımların hiyerarşisini hatırla.",
      difficulty: "Kolay"
    }
  ];
}
