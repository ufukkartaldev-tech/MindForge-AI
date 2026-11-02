# MindForge AI — İnteraktif Üniversite Öğrenme Platformu

MindForge AI, üniversite öğrencilerinin derslerini klasik PDF, slayt ve pasif video izleme yöntemlerinin ötesinde; etkileşimli, kişiselleştirilmiş ve yapay zekâ destekli olarak öğrenebileceği yeni nesil bir web platformudur.

## 🚀 Temel Özellikler

1. **Hazır 12 Üniversite Dersi Entegrasyonu:**
   - **Pazartesi:** C++ Programlamaya Giriş (09.30–11.00), Dijital Okuryazarlık (11.00–12.00), Veri Bilimi ve Olasılık Kuramı (16.30–17.30)
   - **Salı:** Matematik 1 (09.00–10.30), OOP C++ ile (13.00–15.00)
   - **Çarşamba:** İş Sağlığı ve Güvenliği (15.30–16.30)
   - **Perşembe:** Kuantum Mekaniği (13.00–14.30), C Sharp Programlama (14.30–16.00), Yapay Zekâ ve Uzman Sistemler (16.00–17.30)
   - **Cuma:** Mühendislik Matematiği (09.00–10.30)
   - **Cumartesi:** İşletim Sistemlerinin Temelleri (13.00–15.00), Algoritmalar (15.00–17.00)

2. **AI Müfredat ve Konu Oluşturucu:**
   - Herhangi bir PDF veya slayt yüklemeden, sıfırdan akademik ve pedagojik müfredat ağacı oluşturma.
   - Modüller, konular, ön koşullar, öğrenme hedefleri ve zorluk seviyeleri.
   - İsteğe bağlı PDF yükleme ve hocanın izlencesini ekleme desteği.

3. **9 Aşamalı İnteraktif Öğrenme Motoru:**
   - Giriş, Ön Bilgi, Temel Kavram, Detaylı Açıklama, Gerçek Hayat Örneği, Uygulamalı Örnek, Sık Yapılan Hatalar, Özet ve Mini Değerlendirme.
   - **C++ / C#:** Bellek durumu takibi (variable tracer), kod çıktısı tahmini, eksik kod tamamlama.
   - **Matematik:** KaTeX formülleri, adım adım türev çözücü ve dinamik eğri çizimi (SVG grafik).
   - **İşletim Sistemleri:** FCFS, SJF ve Round Robin CPU çizelgeleme simülasyonu, süreç ekleme/silme ve Gantt şeması.
   - **Algoritmalar:** Bubble Sort ve Binary Search adım adım görselleştirici, Big-O karmaşıklık analizi.

4. **Yapay Zekâ Üniversite Öğretmeni (AI Tutor):**
   - Ders içi açılır panel (Drawer) veya bağımsız danışma merkezi.
   - Mevcut ders ve konuyu bilen, soruları yanıtlayan, formülleri basitleştiren ve sınav ipuçları veren AI danışman.

5. **Adaptif Quiz Motoru:**
   - Çoktan seçmeli, doğru/yanlış, boşluk doldurma ve kod çıktısı tahmin soruları.
   - İpuçları, anlık pedagojik açıklamalar, başarı yüzdesi ve yanlış soruları tek tıkla tekrar çözme.

6. **Vize Simülasyonu:**
   - Gerçek sınav arayüzü, süre sayacı (countdown timer), soru geçişleri.
   - Sınav sonrası detaylı yapay zekâ teşhis raporu (güçlü/zayıf yönler ve önerilen tekrar konuları).

7. **AI Çalışma Planı (Study Planner):**
   - Sınav tarihlerine ve öğrencinin zayıf olduğu konulara göre dinamik görev takvimi.
   - Günlük çalışma yükü takibi.

8. **Oyunlaştırma (Gamification) & İlerleme:**
   - XP, Seviye, Günlük Seri (Streak) ve başarı rozetleri (İlk Adım, Soru Avcısı, Matematik Kurdu vb.).
   - Recharts ile ders bazında yeterlilik grafikleri ve konu dağılımı.

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+ (Node 20 veya 24 önerilir)
- npm veya pnpm

### Adımlar

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. `.env.local` dosyasını oluşturun (isteğe bağlı, API anahtarı olmadan da yerleşik simülasyon motoruyla %100 çalışır):
   ```bash
   cp .env.example .env.local
   ```
   İçeriği:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```
   Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

4. Üretim derlemesi (Production Build):
   ```bash
   npm run build
   npm run start
   ```

## ⚙️ Çevrimdışı ve Güvenli Çalışma Mimarisi
- API anahtarı girilmediğinde hiçbir sayfa veya özellik çökmez; platform zengin yerleşik pedagojik veri ve simülasyon motoruna geçiş yapar.
- Kullanıcılar API anahtarlarını dilerlerse doğrudan **Ayarlar** sayfasından girebilirler. Anahtar yalnızca tarayıcı yerel belleğinde tutulur ve sunucu rotası üzerinden güvenle işlenir.
