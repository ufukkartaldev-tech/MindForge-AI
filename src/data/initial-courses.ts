import { Course } from "@/lib/types";

export const INITIAL_COURSES: Course[] = [
  {
    id: "cpp-intro",
    title: "C++ Programlamaya Giriş",
    description: "Programlama temelleri, değişkenler, koşul ve döngü yapıları, diziler, işaretçiler ve fonksiyonel programlama.",
    icon: "Code2",
    category: "Bilgisayar Mühendisliği",
    difficulty: "Başlangıç",
    dayOfWeek: "Pazartesi",
    timeSlot: "09.30–11.00",
    examDate: "2026-11-23",
    examLocation: "Amfi B-101",
    createdAt: "2026-09-15T09:00:00Z",
    modules: [
      {
        id: "cpp-mod-1",
        courseId: "cpp-intro",
        title: "C++ Temelleri ve Sözdizimi",
        description: "Temel veri tipleri, girdi/çıktı akışları ve bellek modelleri.",
        orderIndex: 1,
        topics: [
          {
            id: "cpp-t1",
            moduleId: "cpp-mod-1",
            courseId: "cpp-intro",
            title: "Değişkenler, Veri Tipleri ve std::cout",
            summary: "int, float, char, boolean tipleri ve konsol akış manipülatörleri.",
            orderIndex: 1,
            difficulty: "Başlangıç",
            learningObjectives: ["Temel tipleri doğru seçmek", "std::cin ve std::cout ile formatlı girdi/çıktı"],
            masteryStatus: "mastered",
            masteryScore: 92,
            timeSpentMinutes: 45,
            lastStudiedAt: "2026-10-28T14:30:00Z"
          },
          {
            id: "cpp-t2",
            moduleId: "cpp-mod-1",
            courseId: "cpp-intro",
            title: "Koşul İfadeleri (if-else, switch-case)",
            summary: "Mantıksal operatörler, dallanma ve kontrol akışı.",
            orderIndex: 2,
            difficulty: "Başlangıç",
            prerequisites: ["Değişkenler ve Veri Tipleri"],
            learningObjectives: ["Dallanma yapılarını kurabilmek", "Ternary ve switch optimizasyonları"],
            masteryStatus: "mastered",
            masteryScore: 88,
            timeSpentMinutes: 35,
            lastStudiedAt: "2026-10-30T11:00:00Z"
          }
        ]
      },
      {
        id: "cpp-mod-2",
        courseId: "cpp-intro",
        title: "Döngüler ve Fonksiyonlar",
        description: "Tekrarlı algoritmalar, parametre aktarımı ve bellek yığını.",
        orderIndex: 2,
        topics: [
          {
            id: "cpp-t3",
            moduleId: "cpp-mod-2",
            courseId: "cpp-intro",
            title: "Döngü Yapıları (for, while, do-while)",
            summary: "Sayaç ve koşul kontrollü döngüler, break ve continue mantığı.",
            orderIndex: 1,
            difficulty: "Başlangıç",
            prerequisites: ["Koşul İfadeleri"],
            learningObjectives: ["İç içe döngüler yazabilmek", "Sonsuz döngü tuzaklarını önlemek"],
            masteryStatus: "in_progress",
            masteryScore: 65,
            timeSpentMinutes: 50,
            lastStudiedAt: "2026-11-01T16:20:00Z"
          },
          {
            id: "cpp-t4",
            moduleId: "cpp-mod-2",
            courseId: "cpp-intro",
            title: "Fonksiyonlar, Referans ile Çağırma & Bellek",
            summary: "Pass-by-value vs pass-by-reference (&), stack belleği mantığı.",
            orderIndex: 2,
            difficulty: "Orta",
            prerequisites: ["Döngü Yapıları"],
            learningObjectives: ["Referans parametreleri anlamak", "Fonksiyon prototipi ve modülerlik"],
            masteryStatus: "developing",
            masteryScore: 50,
            timeSpentMinutes: 30
          }
        ]
      },
      {
        id: "cpp-mod-3",
        courseId: "cpp-intro",
        title: "Diziler ve İşaretçiler (Pointers)",
        description: "Bellek adresleme, dinamik bellek yönetimi ve pointer aritmetiği.",
        orderIndex: 3,
        topics: [
          {
            id: "cpp-t5",
            moduleId: "cpp-mod-3",
            courseId: "cpp-intro",
            title: "İşaretçi (Pointer) Mantığı ve Adres Operatörü",
            summary: "Adres (&), dereference (*), bellek haritası ve işaretçi aritmetiği.",
            orderIndex: 1,
            difficulty: "Orta",
            prerequisites: ["Fonksiyonlar"],
            learningObjectives: ["Pointer ve adres kavramını somutlaştırmak", "Dizi-işaretçi ilişkisini çözmek"],
            masteryStatus: "needs_review",
            masteryScore: 38,
            timeSpentMinutes: 60,
            lastStudiedAt: "2026-10-25T10:00:00Z"
          }
        ]
      }
    ]
  },
  {
    id: "digital-literacy",
    title: "Dijital Okuryazarlık",
    description: "Bilgi güvenliği, bulut bilişim sistemleri, veri mahremiyeti ve dijital araştırma metotları.",
    icon: "Globe",
    category: "Genel Eğitim",
    difficulty: "Başlangıç",
    dayOfWeek: "Pazartesi",
    timeSlot: "11.00–12.00",
    examDate: "2026-11-25",
    examLocation: "Online Sınav Merkezi",
    createdAt: "2026-09-15T09:00:00Z",
    modules: [
      {
        id: "dig-mod-1",
        courseId: "digital-literacy",
        title: "Siber Güvenlik ve Veri Mahremiyeti",
        description: "Şifreleme, kimlik avı koruması, 2FA ve KVKK/GDPR prensipleri.",
        orderIndex: 1,
        topics: [
          {
            id: "dig-t1",
            moduleId: "dig-mod-1",
            courseId: "digital-literacy",
            title: "Dijital Kimlik ve Parola Güvenliği",
            summary: "Entropy, tuzlama (salting), çok faktörlü kimlik doğrulama.",
            orderIndex: 1,
            difficulty: "Başlangıç",
            learningObjectives: ["Güvenli dijital kimlik oluşturma", "Sosyal mühendislik saldırılarını tanıma"],
            masteryStatus: "mastered",
            masteryScore: 95,
            timeSpentMinutes: 40
          }
        ]
      }
    ]
  },
  {
    id: "data-science-prob",
    title: "Veri Bilimi ve Olasılık Kuramı",
    description: "Rastgele değişkenler, olasılık dağılımları, Bayes teoremi, tanımlayıcı istatistik ve hipotez testleri.",
    icon: "BarChart3",
    category: "Matematik & Veri",
    difficulty: "Orta",
    dayOfWeek: "Pazartesi",
    timeSlot: "16.30–17.30",
    examDate: "2026-11-27",
    examLocation: "Amfi C-204",
    createdAt: "2026-09-15T09:00:00Z",
    modules: [
      {
        id: "ds-mod-1",
        courseId: "data-science-prob",
        title: "Olasılık Temelleri ve Bayes Kuramı",
        description: "Koşullu olasılık, bağımsız olaylar, Bayes kuralı ve uygulamaları.",
        orderIndex: 1,
        topics: [
          {
            id: "ds-t1",
            moduleId: "ds-mod-1",
            courseId: "data-science-prob",
            title: "Koşullu Olasılık ve Bayes Teoremi",
            summary: "P(A|B) formülasyonu, posterior olasılık ve gerçek hayat teşhis problemleri.",
            orderIndex: 1,
            difficulty: "Orta",
            learningObjectives: ["Bayes teoremini adım adım uygulamak", "Önsel ve sonsal olasılıkları ayırt etmek"],
            masteryStatus: "developing",
            masteryScore: 55,
            timeSpentMinutes: 50
          }
        ]
      }
    ]
  },
  {
    id: "math-1",
    title: "Matematik 1",
    description: "Tek değişkenli kalkülüs, limit, süreklilik, türev uygulamaları, Taylor serileri ve integrasyon temelleri.",
    icon: "Binary",
    category: "Temel Bilimler",
    difficulty: "Orta",
    dayOfWeek: "Salı",
    timeSlot: "09.00–10.30",
    examDate: "2026-11-24",
    examLocation: "Merkezi Derslik 3",
    createdAt: "2026-09-15T09:00:00Z",
    modules: [
      {
        id: "math1-mod-1",
        courseId: "math-1",
        title: "Limit ve Süreklilik",
        description: "Epsilon-delta tanımı, tek taraflı limitler ve belirsizlikler (0/0, sonsuz/sonsuz).",
        orderIndex: 1,
        topics: [
          {
            id: "math1-t1",
            moduleId: "math1-mod-1",
            courseId: "math-1",
            title: "Limit Kuralları ve Çarpanlara Ayırma Yöntemi",
            summary: "0/0 belirsizliğini sadeleştirme, eşlenikle çarpma ve L'Hopital kuralı.",
            orderIndex: 1,
            difficulty: "Orta",
            learningObjectives: ["0/0 belirsizliklerini çözebilmek", "Eşlenik çarpımını doğru uygulamak"],
            masteryStatus: "mastered",
            masteryScore: 85,
            timeSpentMinutes: 60
          }
        ]
      },
      {
        id: "math1-mod-2",
        courseId: "math-1",
        title: "Türev ve Geometrik Yorumu",
        description: "Teğet eğimi, zincir kuralı, kapalı fonksiyon türevi ve ekstremum noktalar.",
        orderIndex: 2,
        topics: [
          {
            id: "math1-t2",
            moduleId: "math1-mod-2",
            courseId: "math-1",
            title: "Türev Kuralları ve Zincir Kuralı",
            summary: "Bileşke fonksiyon türevi f'(g(x)) * g'(x) ve pratik türev alma.",
            orderIndex: 1,
            difficulty: "Orta",
            learningObjectives: ["Zincir kuralını zincirleme basamaklarda hatasız işletmek"],
            masteryStatus: "in_progress",
            masteryScore: 70,
            timeSpentMinutes: 45
          }
        ]
      }
    ]
  },
  {
    id: "oop-cpp",
    title: "OOP (C++ ile)",
    description: "Nesne yönelimli programlama felsefesi: Kapsülleme, Kalıtım, Çok Biçimlilik, Sanal Fonksiyonlar ve Şablonlar.",
    icon: "Layers",
    category: "Bilgisayar Mühendisliği",
    difficulty: "İleri",
    dayOfWeek: "Salı",
    timeSlot: "13.00–15.00",
    examDate: "2026-11-26",
    examLocation: "Amfi A-102",
    createdAt: "2026-09-15T09:00:00Z",
    modules: [
      {
        id: "oop-mod-1",
        courseId: "oop-cpp",
        title: "Sınıf, Nesne ve Kapsülleme",
        description: "Class mimarisi, constructor/destructor, getter/setter ve const metotlar.",
        orderIndex: 1,
        topics: [
          {
            id: "oop-t1",
            moduleId: "oop-mod-1",
            courseId: "oop-cpp",
            title: "Sınıf ve Nesne Kavramı, Constructor & Destructor",
            summary: "Default, parametreli ve copy constructor; RAII prensibi ve bellek temizliği.",
            orderIndex: 1,
            difficulty: "Orta",
            learningObjectives: ["RAII desenini kavramak", "Deep copy vs Shallow copy farkını bilmek"],
            masteryStatus: "mastered",
            masteryScore: 90,
            timeSpentMinutes: 65
          },
          {
            id: "oop-t2",
            moduleId: "oop-mod-1",
            courseId: "oop-cpp",
            title: "Kapsülleme (Encapsulation) ve Erişim Belirteçleri",
            summary: "public, private, protected ayrımı ve veri saklama.",
            orderIndex: 2,
            difficulty: "Başlangıç",
            learningObjectives: ["Veri gizleme prensibini uygulamak", "Sınıf içi durum bütünlüğünü korumak"],
            masteryStatus: "mastered",
            masteryScore: 94,
            timeSpentMinutes: 40
          }
        ]
      },
      {
        id: "oop-mod-2",
        courseId: "oop-cpp",
        title: "Kalıtım ve Çok Biçimlilik (Polymorphism)",
        description: "Kalıtım türleri, virtual fonksiyonlar, vtable mekanizması ve soyut sınıflar.",
        orderIndex: 2,
        topics: [
          {
            id: "oop-t3",
            moduleId: "oop-mod-2",
            courseId: "oop-cpp",
            title: "Kalıtım (Inheritance) & Taban Sınıf Başlatıcıları",
            summary: "Base class constructor zincirleme, 'is-a' ilişkisi, protected erişimi.",
            orderIndex: 1,
            difficulty: "Orta",
            learningObjectives: ["Taban sınıf türetme kurallarını işletmek", "Constructor çağırma sırasını yönetmek"],
            masteryStatus: "needs_review",
            masteryScore: 42,
            timeSpentMinutes: 55,
            lastStudiedAt: "2026-10-31T09:00:00Z"
          },
          {
            id: "oop-t4",
            moduleId: "oop-mod-2",
            courseId: "oop-cpp",
            title: "Sanal Fonksiyonlar, Polymorphism ve vptr/vtable",
            summary: "Geç bağlama (late binding), pure virtual fonksiyonlar ve soyut sınıflar (interface).",
            orderIndex: 2,
            difficulty: "İleri",
            learningObjectives: ["Çalışma zamanı polimorfizmini kurgulamak", "Virtual destructor önemini kavramak"],
            masteryStatus: "developing",
            masteryScore: 48,
            timeSpentMinutes: 70
          }
        ]
      }
    ]
  },
  {
    id: "occupational-health",
    title: "İş Sağlığı ve Güvenliği",
    description: "İş kazalarını önleme, 6331 sayılı yasa, risk değerlendirme metodolojileri ve ergonomi.",
    icon: "ShieldAlert",
    category: "Mühendislik Genel",
    difficulty: "Başlangıç",
    dayOfWeek: "Çarşamba",
    timeSlot: "15.30–16.30",
    examDate: "2026-11-28",
    examLocation: "Derslik D-302",
    createdAt: "2026-09-15T09:00:00Z",
    modules: [
      {
        id: "isg-mod-1",
        courseId: "occupational-health",
        title: "Risk Değerlendirmesi ve Tehlike Belirleme",
        description: "Fine-Kinney ve Matris risk analiz yöntemleri, ramak kala olaylar.",
        orderIndex: 1,
        topics: [
          {
            id: "isg-t1",
            moduleId: "isg-mod-1",
            courseId: "occupational-health",
            title: "Risk Analiz Matrisi (5x5) ve Önleme Hiyerarşisi",
            summary: "Olasılık x Şiddet puanlaması, eliminasyon, mühendislik önlemleri ve KKD.",
            orderIndex: 1,
            difficulty: "Başlangıç",
            learningObjectives: ["Önleme hiyerarşisi adımlarını sırasıyla uygulamak", "Risk puanını doğru hesaplamak"],
            masteryStatus: "mastered",
            masteryScore: 89,
            timeSpentMinutes: 30
          }
        ]
      }
    ]
  },
  {
    id: "quantum-mechanics",
    title: "Kuantum Mekaniği",
    description: "Dalga-parçacık ikiliği, Schrödinger dalga denklemi, Heisenberg belirsizlik ilkesi ve kuantum kutusu.",
    icon: "Atom",
    category: "Fizik & İleri Bilim",
    difficulty: "İleri",
    dayOfWeek: "Perşembe",
    timeSlot: "13.00–14.30",
    examDate: "2026-12-01",
    examLocation: "Fizik Amfisi",
    createdAt: "2026-09-15T09:00:00Z",
    modules: [
      {
        id: "qm-mod-1",
        courseId: "quantum-mechanics",
        title: "Kuantum Postülatları ve Dalga Fonksiyonu",
        description: "Psi dalga fonksiyonu, Born olasılık yorumu ve normalizasyon koşulu.",
        orderIndex: 1,
        topics: [
          {
            id: "qm-t1",
            moduleId: "quantum-mechanics",
            courseId: "quantum-mechanics",
            title: "Schrödinger Denklemi ve Sonsuz Potansiyel Kuyusu",
            summary: "Zamana bağlı olmayan Schrödinger denklemi Hψ = Eψ, enerji seviyelerinin kuantalanması.",
            orderIndex: 1,
            difficulty: "İleri",
            learningObjectives: ["Tek boyutlu kutudaki parçacık dalga fonksiyonunu türetmek", "Enerji kuantizasyonunu yorumlamak"],
            masteryStatus: "developing",
            masteryScore: 52,
            timeSpentMinutes: 75
          }
        ]
      }
    ]
  },
  {
    id: "c-sharp-prog",
    title: "C Sharp Programlama",
    description: ".NET ekosistemi, LINQ sorguları, asenkron programlama (async/await), Entity Framework ve REST mimarisi.",
    icon: "TerminalSquare",
    category: "Yazılım Geliştirme",
    difficulty: "Orta",
    dayOfWeek: "Perşembe",
    timeSlot: "14.30–16.00",
    examDate: "2026-12-02",
    examLocation: "Laboratuvar L-2",
    createdAt: "2026-09-15T09:00:00Z",
    modules: [
      {
        id: "cs-mod-1",
        courseId: "c-sharp-prog",
        title: "Modern C# ve LINQ Mimarisi",
        description: "Lambda ifadeleri, LINQ extension metotları (Select, Where, GroupBy, Join).",
        orderIndex: 1,
        topics: [
          {
            id: "cs-t1",
            moduleId: "cs-mod-1",
            courseId: "c-sharp-prog",
            title: "LINQ ile Veri Filtreleme ve Dönüştürme",
            summary: "IEnumerable akışları, deferred execution (ertelenmiş yürütme) ve anonim tipler.",
            orderIndex: 1,
            difficulty: "Orta",
            learningObjectives: ["LINQ sorgularını lambda sözdizimi ile kurmak", "Deferred vs Immediate execution farkını anlamak"],
            masteryStatus: "mastered",
            masteryScore: 84,
            timeSpentMinutes: 50
          }
        ]
      }
    ]
  },
  {
    id: "ai-expert-systems",
    title: "Yapay Zekâ ve Uzman Sistemler",
    description: "Arama algoritmaları (A*, Minimax), kural tabanlı sistemler, çıkarım motorları ve yapay sinir ağlarına giriş.",
    icon: "BrainCircuit",
    category: "Yapay Zekâ",
    difficulty: "İleri",
    dayOfWeek: "Perşembe",
    timeSlot: "16.00–17.30",
    examDate: "2026-12-03",
    examLocation: "Amfi B-105",
    createdAt: "2026-09-15T09:00:00Z",
    modules: [
      {
        id: "ai-mod-1",
        courseId: "ai-expert-systems",
        title: "Sezgisel Arama ve A* Algoritması",
        description: "Graf aramaları, f(n) = g(n) + h(n), admissibility ve tutarlılık kriterleri.",
        orderIndex: 1,
        topics: [
          {
            id: "ai-t1",
            moduleId: "ai-mod-1",
            courseId: "ai-expert-systems",
            title: "A* Arama Algoritması ve Heuristik Tasarımı",
            summary: "f(n) maliyet fonksiyonu, Manhattan mesafesi, optimal yol garantisi.",
            orderIndex: 1,
            difficulty: "İleri",
            learningObjectives: ["Heuristic fonksiyonunun admissable olmasını test etmek", "A* adımlarını graf üzerinde adım adım işletmek"],
            masteryStatus: "developing",
            masteryScore: 60,
            timeSpentMinutes: 65
          }
        ]
      }
    ]
  },
  {
    id: "engineering-math",
    title: "Mühendislik Matematiği",
    description: "Diferansiyel denklemler, Laplace dönüşümleri, Fourier serileri ve lineer cebir sistemleri.",
    icon: "Calculator",
    category: "Mühendislik Temelleri",
    difficulty: "İleri",
    dayOfWeek: "Cuma",
    timeSlot: "09.00–10.30",
    examDate: "2026-12-04",
    examLocation: "Merkezi Derslik 1",
    createdAt: "2026-09-15T09:00:00Z",
    modules: [
      {
        id: "engmath-mod-1",
        courseId: "engineering-math",
        title: "Birinci ve İkinci Dereceden Diferansiyel Denklemler",
        description: "Ayrılabilir denklemler, integral çarpanı ve sabit katsayılı lineer denklemler.",
        orderIndex: 1,
        topics: [
          {
            id: "engmath-t1",
            moduleId: "engmath-mod-1",
            courseId: "engineering-math",
            title: "İntegral Çarpanı ile Lineer Diferansiyel Denklem Çözümü",
            summary: "y' + P(x)y = Q(x) formunda mu(x) = exp(int P(x)dx) dönüşümü.",
            orderIndex: 1,
            difficulty: "İleri",
            learningObjectives: ["İntegral çarpanını hesaplamak", "Genel ve özel çözümü belirlemek"],
            masteryStatus: "in_progress",
            masteryScore: 58,
            timeSpentMinutes: 55
          }
        ]
      }
    ]
  },
  {
    id: "operating-systems",
    title: "İşletim Sistemlerinin Temelleri",
    description: "Süreç ve iş parçacığı yönetimi, CPU planlama algoritmaları, senkronizasyon, deadlock ve sanal bellek.",
    icon: "Cpu",
    category: "Sistem ve Donanım",
    difficulty: "Orta",
    dayOfWeek: "Cumartesi",
    timeSlot: "13.00–15.00",
    examDate: "2026-12-05",
    examLocation: "Amfi C-101",
    createdAt: "2026-09-15T09:00:00Z",
    modules: [
      {
        id: "os-mod-1",
        courseId: "operating-systems",
        title: "Süreç Yönetimi ve CPU Çizelgeleme",
        description: "Process State diyagramı, context switch, FCFS, SJF ve Round Robin algoritmaları.",
        orderIndex: 1,
        topics: [
          {
            id: "os-t1",
            moduleId: "os-mod-1",
            courseId: "operating-systems",
            title: "CPU Çizelgeleme Algoritmaları (FCFS, SJF, Round Robin)",
            summary: "Turnaround time, waiting time, Gantt şeması ve context-switch maliyeti.",
            orderIndex: 1,
            difficulty: "Orta",
            learningObjectives: ["Gantt şeması oluşturarak ortalama bekleme süresini hesaplamak", "Round Robin zaman kuantumu etkisini görmek"],
            masteryStatus: "developing",
            masteryScore: 62,
            timeSpentMinutes: 70
          },
          {
            id: "os-t2",
            moduleId: "os-mod-1",
            courseId: "operating-systems",
            title: "Deadlock (Kilitlenme) Koşulları ve Banker Algoritması",
            summary: "Karşılıklı dışlama, tut ve bekle, devredilemezlik ve döngüsel bekleme.",
            orderIndex: 2,
            difficulty: "İleri",
            learningObjectives: ["Dört kilitlenme koşulunu analiz etmek", "Banker algoritması ile güvenli durumu hesaplamak"],
            masteryStatus: "unstarted",
            masteryScore: 0,
            timeSpentMinutes: 0
          }
        ]
      }
    ]
  },
  {
    id: "algorithms",
    title: "Algoritmalar",
    description: "Asimptotik analiz (Big-O), sıralama ve arama algoritmaları, dinamik programlama, açgözlü algoritmalar ve çizge teorisi.",
    icon: "GitBranch",
    category: "Bilgisayar Bilimleri",
    difficulty: "İleri",
    dayOfWeek: "Cumartesi",
    timeSlot: "15.00–17.00",
    examDate: "2026-12-06",
    examLocation: "Merkezi Derslik 4",
    createdAt: "2026-09-15T09:00:00Z",
    modules: [
      {
        id: "algo-mod-1",
        courseId: "algorithms",
        title: "Sıralama Algoritmaları ve Karmaşıklık Analizi",
        description: "Bubble, Selection, Insertion, Merge ve Quick sort karşılaştırması.",
        orderIndex: 1,
        topics: [
          {
            id: "algo-t1",
            moduleId: "algo-mod-1",
            courseId: "algorithms",
            title: "Sıralama Algoritmaları (Bubble, Merge Sort) ve Big-O Analizi",
            summary: "O(n^2) vs O(n log n) karşılaştırması, divide and conquer mantığı ve bellek karmaşıklığı.",
            orderIndex: 1,
            difficulty: "Orta",
            learningObjectives: ["Merge sort böl ve yönet adımını takip etmek", "En iyi, en kötü ve ortalama durumları kıyaslamak"],
            masteryStatus: "mastered",
            masteryScore: 82,
            timeSpentMinutes: 60
          },
          {
            id: "algo-t2",
            moduleId: "algo-mod-1",
            courseId: "algorithms",
            title: "İkili Arama (Binary Search) ve Logaritmik Zaman",
            summary: "Sıralı dizilerde ikiye bölerek arama, O(log n) karmaşıklığı ve arama uzayı daraltma.",
            orderIndex: 2,
            difficulty: "Başlangıç",
            learningObjectives: ["İkili arama pointerlarını (low, mid, high) adım adım yürütmek"],
            masteryStatus: "mastered",
            masteryScore: 92,
            timeSpentMinutes: 40
          }
        ]
      }
    ]
  }
];
