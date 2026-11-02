import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  CurriculumSchema, 
  LessonContentSchema, 
  QuizQuestionsSchema, 
  getFallbackLesson, 
  getFallbackQuiz 
} from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, courseTitle, courseId, topicTitle, topicId, userQuestion, context } = body;

    const apiKey = process.env.GEMINI_API_KEY || req.headers.get("x-gemini-key") || "";

    // 1. CURRICULUM GENERATOR
    if (action === "curriculum") {
      if (!apiKey) {
        // Fallback realistic curriculum if no API key
        return NextResponse.json({
          success: true,
          source: "fallback",
          data: {
            modules: [
              {
                id: `mod-${Date.now()}-1`,
                title: `${courseTitle} - Temel Kavramlar ve Giriş`,
                description: "Temel prensipler, terminoloji ve teorik omurga.",
                orderIndex: 1,
                topics: [
                  {
                    id: `top-${Date.now()}-1`,
                    title: `${courseTitle} Giriş ve Temel İlkeler`,
                    summary: "Konunun doğuşu, temel hedefleri ve metodolojik yaklaşım.",
                    orderIndex: 1,
                    difficulty: "Başlangıç",
                    learningObjectives: ["Temel kavramları tanımlamak", "İlkeleri ayırt etmek"]
                  },
                  {
                    id: `top-${Date.now()}-2`,
                    title: "Yapısal Kurallar ve Analiz Yöntemleri",
                    summary: "Sistem bileşenleri, operasyonel akış ve standartlar.",
                    orderIndex: 2,
                    difficulty: "Orta",
                    learningObjectives: ["Akış şemalarını okuyabilmek", "Standartlara uygun analiz yapmak"]
                  }
                ]
              },
              {
                id: `mod-${Date.now()}-2`,
                title: `${courseTitle} - İleri Seviye Uygulamalar`,
                description: "Problem çözme teknikleri ve endüstriyel senaryolar.",
                orderIndex: 2,
                topics: [
                  {
                    id: `top-${Date.now()}-3`,
                    title: "Optimizasyon ve Hata Ayıklama",
                    summary: "Karşılaşılan kritik darboğazlar ve çözüm modelleri.",
                    orderIndex: 1,
                    difficulty: "İleri",
                    learningObjectives: ["Darboğazları tespit etmek", "Optimum çözümü kurgulamak"]
                  }
                ]
              }
            ]
          }
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Sen üniversite düzeyinde bir eğitim teknolojileri ve müfredat uzmanısın.
Ders Adı: "${courseTitle}".
Bu ders için üniversite standartlarında mantıklı, pedagojik ve akademik açıdan tutarlı bir konu ağacı (müfredat) oluştur.
Öğrencinin sıfırdan ileri seviyeye öğrenebilmesi için modüller ve konular belirle.
Cevabını SADECE aşağıdaki JSON şemasına birebir uygun formatta ver (Markdown kod blokları haricinde hiçbir ek metin yazma):
{
  "modules": [
    {
      "id": "mod-1",
      "title": "Modül Başlığı",
      "description": "Modül açıklaması",
      "orderIndex": 1,
      "topics": [
        {
          "id": "top-1",
          "title": "Konu Başlığı",
          "summary": "Konu kısa özeti",
          "orderIndex": 1,
          "difficulty": "Başlangıç",
          "prerequisites": ["Varsa ön koşul konu adı"],
          "learningObjectives": ["Hedef 1", "Hedef 2"]
        }
      ]
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      const validated = CurriculumSchema.parse(parsed);

      return NextResponse.json({ success: true, source: "gemini", data: validated });
    }

    // 2. LESSON GENERATOR
    if (action === "lesson") {
      if (!apiKey) {
        return NextResponse.json({
          success: true,
          source: "fallback",
          data: getFallbackLesson(courseId || "general", topicId || "top", topicTitle || "Ders Konusu")
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Sen kıdemli bir üniversite hocası ve interaktif öğrenme uzmanısın.
Ders: "${courseTitle || 'Üniversite Dersi'}"
Konu: "${topicTitle}"

Bu konu için Türkçe, açık, pedagojik ve 9 bölümlü etkileşimli bir anlatım hazırla.
Bölümler şunlardır:
1. intro: Konuya giriş (Neden önemli?)
2. prereq: Ön bilgi (Neyi bilmeliyiz?)
3. concept: Temel kavram (Tanım ve matematik veya kod özü)
4. detail: Detaylı açıklama (Mekanizma nasıl çalışır?)
5. real_world: Gerçek hayat örneği (Somut bir benzetme)
6. applied: Uygulamalı örnek (Soru veya pratik senaryo)
7. common_mistakes: Sık yapılan hatalar (Öğrencilerin sınavda düştüğü tuzaklar)
8. summary: Konu özeti (Kilit noktalar)
9. mini_eval: Mini değerlendirme

Cevabını SADECE JSON formatında ver:
{
  "topicId": "${topicId}",
  "topicTitle": "${topicTitle}",
  "courseId": "${courseId}",
  "sections": [
    {
      "type": "intro",
      "title": "1. Konuya Giriş: ...",
      "content": "Açıklama...",
      "mathLatex": "varsa LaTeX formül",
      "interactiveActivity": {
        "type": "code_prediction",
        "title": "Hızlı Kontrol",
        "prompt": "Soru metni",
        "codeSnippet": "kod...",
        "language": "cpp",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A",
        "explanation": "Neden A olduğu",
        "hints": ["İpucu"]
      }
    }
  ]
}`;

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        const validated = LessonContentSchema.parse(parsed);
        return NextResponse.json({ success: true, source: "gemini", data: validated });
      } catch (err) {
        console.error("Gemini lesson error, falling back:", err);
        return NextResponse.json({
          success: true,
          source: "fallback",
          data: getFallbackLesson(courseId || "general", topicId || "top", topicTitle || "Ders Konusu")
        });
      }
    }

    // 3. QUIZ GENERATOR
    if (action === "quiz") {
      if (!apiKey) {
        return NextResponse.json({
          success: true,
          source: "fallback",
          data: getFallbackQuiz(courseId || "general", topicTitle || "Genel Konu")
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Sen üniversite sınav hazırlama komisyonu üyesisin.
Ders: "${courseTitle || 'Ders'}"
Konu: "${topicTitle}"

Bu konuyu ölçen 4 adet nitelikli Türkçe soru üret.
Soru tipleri karma olmalıdır (multiple_choice, true_false, code_prediction veya fill_in_the_blank).
Her soru için açıklayıcı ipucu (hint) ve detaylı çözüm (explanation) sağla.

SADECE aşağıdaki JSON şemasına uygun liste ver:
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "question": "Soru metni...",
    "code": "varsa kod parçacığı",
    "math": "varsa LaTeX formülü",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "Doğru şık metni",
    "explanation": "Detaylı çözüm...",
    "hint": "Öğrenciye yol gösteren ipucu...",
    "difficulty": "Orta"
  }
]`;

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        const validated = QuizQuestionsSchema.parse(parsed);
        return NextResponse.json({ success: true, source: "gemini", data: validated });
      } catch (err) {
        console.error("Gemini quiz error, falling back:", err);
        return NextResponse.json({
          success: true,
          source: "fallback",
          data: getFallbackQuiz(courseId || "general", topicTitle || "Genel Konu")
        });
      }
    }

    // 4. AI TUTOR CHAT
    if (action === "tutor") {
      if (!apiKey) {
        // High quality contextual tutor responses for demo/offline
        let answer = `Harika bir soru! "${topicTitle || 'Bu konu'}" üzerinde çalışırken özellikle temel mantığı ve değişkenlerin bellekteki durumunu gözden kaçırmamak kritik.`;
        if (userQuestion.toLowerCase().includes("kod") || userQuestion.toLowerCase().includes("örnek")) {
          answer += `\n\nPratik bir örnek üzerinden gidelim:\n\`\`\`cpp\n// Basit ve temiz bir yaklaşım:\nint x = 10;\nint* ptr = &x;\n*ptr = 20; // x artık 20!\n\`\`\`\nBurada dikkat edersen değişkene doğrudan dokunmadan adresi üzerinden değiştirdik.`;
        } else if (userQuestion.toLowerCase().includes("sınav") || userQuestion.toLowerCase().includes("vize")) {
          answer += `\n\nVize sınavlarında hocalar genellikle tanımlardan ziyade "kod çıktısı tahmin etme" ve "bellek diyagramı çizme" soruları sorarlar. Yanlış yaptığın quiz sorularını tekrar çözmeni öneririm!`;
        } else {
          answer += `\n\nBunu daha basit bir analojiyle anlatmamı ister misin, yoksa adım adım bir soru çözümü mü yapalım?`;
        }

        return NextResponse.json({
          success: true,
          source: "fallback",
          reply: answer
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Sen üniversite öğrencilerine rehberlik eden samimi, pedagojik, sabırlı ve uzman bir Türk Yapay Zekâ Üniversite Öğretmenisin.
Öğrencinin çalıştığı Ders: "${courseTitle || 'Genel Ders'}"
Mevcut Konu: "${topicTitle || 'Genel Konu'}"
Önceki Bağlam: ${JSON.stringify(context || [])}

Öğrencinin Sorusu: "${userQuestion}"

Yönerge:
- Türkçe, motive edici, nazik ve anlaşılır ol.
- Gereksiz akademik karmaşıklıktan kaçın, konuyu sadeleştir.
- Gerekirse net kod veya matematik formülleri kullan.
- Öğrencinin seviyesini yukarı taşıyacak bir ipucu veya düşündürücü soruyla bitir.`;

      const result = await model.generateContent(prompt);
      return NextResponse.json({
        success: true,
        source: "gemini",
        reply: result.response.text()
      });
    }

    return NextResponse.json({ error: "Geçersiz işlem (invalid action)" }, { status: 400 });
  } catch (error: any) {
    console.error("API /api/ai general error:", error);
    return NextResponse.json({ error: error.message || "Bilinmeyen bir hata oluştu" }, { status: 500 });
  }
}
