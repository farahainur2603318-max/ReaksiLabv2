/**
 * components/chapters/Chapter1.tsx
 * Halaman Lengkap Bab 1: Mengenal Laju Reaksi
 * 
 * Sesuai PRD & Ketentuan Pembelajaran Kimia SMA Kelas XI:
 * 1. Empat Subbab Terstruktur:
 *    - 1.1 Fenomena Reaksi Kimia dalam Kehidupan Sehari-hari
 *    - 1.2 Pengertian dan Konsep Dasar Laju Reaksi
 *    - 1.3 Perubahan Konsentrasi Pereaksi dan Produk (Animasi & Kurva Grafis)
 *    - 1.4 Pengamatan dan Pengukuran Laju Reaksi (Metode Makroskopis Lab)
 * 2. Penjelasan konsep mendalam, analogi saintifik, dan contoh kehidupan nyata
 * 3. Animasi interaktif partikel pereaksi -> produk dan visualisasi grafik konsentrasi vs waktu
 * 4. Pertanyaan pemantik dan aktivitas interaktif di setiap subbab
 * 5. Rangkuman materi komprehensif dan Kuis Evaluasi 8 Soal dengan skor otomatis & pembahasan
 * 6. Tidak memasukkan materi Bab 2-4 (teori tumbukan, energi aktivasi, faktor laju, hukum laju & orde)
 */
import React, { useState, useEffect } from 'react';
import { MODULE_1_SECTIONS } from '../../data/modulesData';
import { LabFormulaBox } from '../LabFormulaBox';

interface Chapter1Props {
  onBackToHome: () => void;
  onNextChapter: () => void;
}

// ================= DATA AKTIVITAS INTERAKTIF SUBBAB 1.1 =================
interface PhenomenonCard {
  id: string;
  title: string;
  icon: string;
  duration: string;
  category: 'cepat' | 'sedang' | 'lambat';
  description: string;
  explanation: string;
}

const PHENOMENON_CARDS: PhenomenonCard[] = [
  {
    id: 'phenom-1',
    title: 'Letusan Kembang Api Malam Tahun Baru',
    icon: '🎆',
    duration: 'Sepersekian detik (milidetik)',
    category: 'cepat',
    description: 'Campuran bubuk mesiu dan garam stronsium/barium terbakar seketika menghasilkan kilatan cahaya dan bunyi dentuman.',
    explanation: 'Reaksi pembakaran bahan peledak kembang api bersifat sangat eksoterm dan memiliki energi kinetik awal yang melimpah, sehingga seluruh pereaksi habis bereaksi dalam hitungan fraksi detik.',
  },
  {
    id: 'phenom-2',
    title: 'Pelarutan Tablet Vitamin C Effervescent',
    icon: '🥤',
    duration: '30 – 60 detik',
    category: 'sedang',
    description: 'Asam sitrat dan natrium bikarbonat bereaksi dengan air menghasilkan desisan gelembung gas karbondioksida (CO₂).',
    explanation: 'Reaksi berlangsung teratur selama sekitar satu menit hingga seluruh padatan tablet larut dan pembentukan gelembung gas CO₂ berhenti sempurna.',
  },
  {
    id: 'phenom-3',
    title: 'Perkaratan Rel Kereta & Pagar Besi',
    icon: '🔩',
    duration: 'Berminggu-minggu hingga bertahun-tahun',
    category: 'lambat',
    description: 'Besi (Fe) bereaksi lambat dengan oksigen (O₂) dan uap air (H₂O) membentuk senyawa karat besi terhidrasi (Fe₂O₃·xH₂O).',
    explanation: 'Proses korosi elektrokimia pada besi memerlukan paparan bertahap terhadap uap air dan oksigen atmosferik, sehingga perubahan massa dan warnanya baru terlihat nyata setelah waktu yang lama.',
  },
  {
    id: 'phenom-4',
    title: 'Pembakaran Gas Metana (LPG) pada Kompor',
    icon: '🔥',
    duration: 'Seketika saat kontak pemantik (detik)',
    category: 'cepat',
    description: 'Gas hidrokarbon bereaksi spontan dengan oksigen membentuk nyala api biru, menghasilkan gas CO₂ dan uap air H₂O.',
    explanation: 'Pembakaran senyawa gas berlangsung sangat cepat karena molekul gas memiliki mobilitas tinggi dan kontak langsung dengan oksigen udara.',
  },
  {
    id: 'phenom-5',
    title: 'Fermentasi Adonan Roti dengan Ragi',
    icon: '🍞',
    duration: '1 – 2 jam',
    category: 'sedang',
    description: 'Enzim pada khamir ragi memecah glukosa menghasilkan gas CO₂ yang membuat rongga-rongga adonan roti mengembang.',
    explanation: 'Proses biokimia fermentasi memerlukan waktu adaptasi biologis sel ragi pada suhu hangat sehingga pembentukan gas terjadi secara bertahap dalam hitungan jam.',
  },
  {
    id: 'phenom-6',
    title: 'Pembentukan Minyak Bumi & Batu Bara',
    icon: '🛢️',
    duration: 'Jutaan tahun',
    category: 'lambat',
    description: 'Sisa jasad renik plankton dan tumbuhan purba tertimbun di bawah lapisan sedimen bumi mengalami dekomposisi anaerobik.',
    explanation: 'Dekomposisi bahan organik purba di bawah tekanan dan temperatur kerak bumi memerlukan skala waktu geologis ribuan hingga jutaan tahun untuk bertransformasi menjadi hidrokarbon minyak bumi.',
  },
];

// ================= DATA SOAL KUIS EVALUASI BAB 1 (8 SOAL) =================
interface ChapterQuizQuestion {
  id: number;
  question: string;
  options: { key: string; text: string }[];
  correctKey: string;
  explanation: string;
}

const CHAPTER_1_QUIZ: ChapterQuizQuestion[] = [
  {
    id: 1,
    question: 'Di antara fenomena kimia berikut, manakah yang tergolong reaksi kimia yang berlangsung paling cepat?',
    options: [
      { key: 'A', text: 'Perkaratan paku besi di daerah lembap pantai' },
      { key: 'B', text: 'Pembusukan buah apel yang telah teriris di udara terbuka' },
      { key: 'C', text: 'Ledakan kembang api saat dinyalakan dengan api' },
      { key: 'D', text: 'Fermentasi sari singkong menjadi tape manis' },
    ],
    correctKey: 'C',
    explanation: 'Pembakaran kembang api berlangsung dalam hitungan milidetik (sangat cepat), sedangkan perkaratan memerlukan waktu berbulan-bulan, pembusukan beberapa hari, dan fermentasi beberapa hari.',
  },
  {
    id: 2,
    question: 'Laju reaksi dinyatakan sebagai berkurangnya konsentrasi pereaksi atau bertambahnya konsentrasi produk per satuan waktu. Mengapa laju pengurangan pereaksi A diberi tanda minus dalam persamaan v_A = -Δ[A]/Δt?',
    options: [
      { key: 'A', text: 'Karena nilai kelajuan reaksi pada dasarnya selalu bernilai negatif' },
      { key: 'B', text: 'Untuk mengompensasi nilai perubahan Δ[A] yang bernilai negatif sehingga nilai laju reaksi tetap bernilai positif' },
      { key: 'C', text: 'Sebagai tanda bahwa reaksi berlangsung secara mundur ke arah reaktan' },
      { key: 'D', text: 'Karena pereaksi melepaskan kalor eksoterm ke lingkungan' },
    ],
    correctKey: 'B',
    explanation: 'Karena [A] akhir lebih kecil daripada [A] awal, maka Δ[A] = [A]t - [A]0 bernilai negatif. Tanda minus di depan rumus memastikan nilai laju reaksi (v) yang dihasilkan selalu bernilai positif.',
  },
  {
    id: 3,
    question: 'Dalam sebuah wadah 1 Liter, konsentrasi gas NO₂ mula-mula adalah 0,80 M. Setelah reaksi berlangsung selama 20 detik, konsentrasi NO₂ tersisa 0,20 M. Berapakah laju rata-rata berkurangnya gas NO₂?',
    options: [
      { key: 'A', text: '0,01 M/detik' },
      { key: 'B', text: '0,03 M/detik' },
      { key: 'C', text: '0,05 M/detik' },
      { key: 'D', text: '0,06 M/detik' },
    ],
    correctKey: 'B',
    explanation: 'Perubahan konsentrasi Δ[NO₂] = 0,20 M - 0,80 M = -0,60 M. Selang waktu Δt = 20 s. Maka v = -(-0,60 M) / 20 s = 0,03 M/detik.',
  },
  {
    id: 4,
    question: 'Diketahui persamaan reaksi: 2 A + 3 B → C + 4 D. Jika laju pembentukan zat C adalah 0,02 M/detik, berapakah laju berkurangnya zat B?',
    options: [
      { key: 'A', text: '0,01 M/detik' },
      { key: 'B', text: '0,02 M/detik' },
      { key: 'C', text: '0,06 M/detik' },
      { key: 'D', text: '0,08 M/detik' },
    ],
    correctKey: 'C',
    explanation: 'Perbandingan laju reaksi sama dengan perbandingan koefisien reaksi: v_B / v_C = koefisien B / koefisien C = 3 / 1. Maka v_B = 3 × v_C = 3 × 0,02 M/s = 0,06 M/detik.',
  },
  {
    id: 5,
    question: 'Bagaimanakah karakteristik bentuk kurva konsentrasi pereaksi terhadap waktu pada grafik laju reaksi?',
    options: [
      { key: 'A', text: 'Garis lurus mendatar horizontal dari awal hingga akhir' },
      { key: 'B', text: 'Garis melengkung naik dari titik nol menuju nilai maksimum' },
      { key: 'C', text: 'Kurva melengkung turun: curam di awal reaksi, kemudian semakin melandai seiring bertambahnya waktu' },
      { key: 'D', text: 'Kurva zig-zag berfluktuasi naik dan turun' },
    ],
    correctKey: 'C',
    explanation: 'Di awal reaksi, pereaksi melimpah sehingga laju reaksi tinggi (kemiringan kurva curam). Seiring waktu, pereaksi berkurang sehingga reaksi melambat dan kurva melandai hingga mendatar saat pereaksi habis.',
  },
  {
    id: 6,
    question: 'Pada percobaan reaksi antara pita magnesium dengan larutan asam klorida: Mg(s) + 2 HCl(aq) → MgCl₂(aq) + H₂(g), metode pengamatan makroskopis manakah yang paling akurat dan mudah dilakukan di laboratorium?',
    options: [
      { key: 'A', text: 'Mengukur pertambahan volume gas hidrogen yang ditampung dalam buret gas (gas syringe) per satuan waktu' },
      { key: 'B', text: 'Menghitung perubahan warna larutan MgCl₂ menggunakan kertas lakmus' },
      { key: 'C', text: 'Mengukur penurunan titik beku larutan setiap menit' },
      { key: 'D', text: 'Menghitung jumlah gelembung dengan mata telanjang tanpa alat ukur' },
    ],
    correctKey: 'A',
    explanation: 'Reaksi ini menghasilkan gas hidrogen (H₂). Penampungan gas H₂ menggunakan buret gas atau silinder ukur terbalik memungkinkan pengukuran volume gas (ΔV) secara kuantitatif per satuan waktu (Δt).',
  },
  {
    id: 7,
    question: 'Pada reaksi penguraian: 2 N₂O₅(g) → 4 NO₂(g) + O₂(g), manakah hubungan kesetaraan laju reaksi yang BENAR sesuai stoikiometri?',
    options: [
      { key: 'A', text: 'v_(N₂O₅) = v_(NO₂) = v_(O₂)' },
      { key: 'B', text: 'v_(NO₂) = 4 × v_(O₂)' },
      { key: 'C', text: 'v_(N₂O₅) = 2 × v_(NO₂)' },
      { key: 'D', text: 'v_(O₂) = 4 × v_(NO₂)' },
    ],
    correctKey: 'B',
    explanation: 'Perbandingan laju sama dengan koefisien: v_(N₂O₅)/2 = v_(NO₂)/4 = v_(O₂)/1. Dari hubungan v_(NO₂)/4 = v_(O₂)/1, diperoleh v_(NO₂) = 4 × v_(O₂).',
  },
  {
    id: 8,
    question: 'Pada eksperimen reaksi natrium tiosulfat dengan asam klorida yang menghasilkan endapan belerang kuning: Na₂S₂O₃(aq) + 2 HCl(aq) → 2 NaCl(aq) + SO₂(g) + S(s)↓ + H₂O(l), laju reaksi dinyatakan berbanding terbalik dengan waktu reaksi (v ∝ 1/t). Mengapa demikian?',
    options: [
      { key: 'A', text: 'Karena waktu reaksi bernilai negatif di dalam larutan asam' },
      { key: 'B', text: 'Karena semakin cepat reaksi berlangsung (waktu t semakin kecil), maka laju reaksi semakin besar' },
      { key: 'C', text: 'Karena belerang yang terbentuk larut kembali seiring berjalannya waktu' },
      { key: 'D', text: 'Karena massa endapan belerang selalu berkurang setiap detik' },
    ],
    correctKey: 'B',
    explanation: 'Laju berbanding terbalik dengan waktu: jika suatu reaksi selesai dalam waktu singkat (t kecil, misalnya 10 detik), berarti reaksinya cepat (laju besar). Sebaliknya jika butuh waktu lama (t besar, misalnya 100 detik), reaksinya lambat.',
  },
];

export const Chapter1: React.FC<Chapter1Props> = ({ onBackToHome, onNextChapter }) => {
  // Subbab aktif (1.1, 1.2, 1.3, 1.4)
  const [activeSectionId, setActiveSectionId] = useState<string>('sec-1-1');

  // ================= STATE INTERAKTIF SUBBAB 1.1 =================
  const [sorterSelections, setSorterSelections] = useState<Record<string, 'cepat' | 'sedang' | 'lambat'>>({});
  const [sorterSubmitted, setSorterSubmitted] = useState<boolean>(false);

  // ================= STATE INTERAKTIF SUBBAB 1.2 =================
  const [calcInitialConc, setCalcInitialConc] = useState<number>(1.0);
  const [calcFinalConc, setCalcFinalConc] = useState<number>(0.4);
  const [calcDeltaTime, setCalcDeltaTime] = useState<number>(20);

  // ================= STATE INTERAKTIF SUBBAB 1.3 =================
  const [animTime, setAnimTime] = useState<number>(0);
  const [isAnimRunning, setIsAnimRunning] = useState<boolean>(false);
  const maxAnimTime = 30; // 30 detik skala simulasi

  // Kalkulator Stoikiometri
  const [selectedStoichReaction, setSelectedStoichReaction] = useState<string>('amonia');
  const [inputRateVal, setInputRateVal] = useState<number>(0.06);

  // ================= STATE INTERAKTIF SUBBAB 1.4 =================
  const [selectedApparatus, setSelectedApparatus] = useState<'gas' | 'massa' | 'kekeruhan'>('gas');

  // ================= STATE KUIS EVALUASI BAB 1 =================
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const activeSection = MODULE_1_SECTIONS.find((sec) => sec.id === activeSectionId) || MODULE_1_SECTIONS[0];

  // Efek Timer Animasi Subbab 1.3
  useEffect(() => {
    let timer: number | null = null;
    if (isAnimRunning) {
      timer = window.setInterval(() => {
        setAnimTime((prev) => {
          if (prev >= maxAnimTime) {
            setIsAnimRunning(false);
            return maxAnimTime;
          }
          return Math.round((prev + 0.5) * 10) / 10;
        });
      }, 100);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAnimRunning]);

  // Perhitungan Laju Interaktif Subbab 1.2
  const deltaConc = Math.round((calcFinalConc - calcInitialConc) * 1000) / 1000;
  const calculatedRate = calcDeltaTime > 0 ? Math.round((-deltaConc / calcDeltaTime) * 10000) / 10000 : 0;

  // Nilai Fraksi Partikel Subbab 1.3 (Model eksponensial reaksi orde 1 semu)
  // [R](t) = 1.0 * e^(-0.08 * t), [P](t) = 1.0 - [R](t)
  const reactantConc = Math.round(1.0 * Math.exp(-0.08 * animTime) * 100) / 100;
  const productConc = Math.round((1.0 - reactantConc) * 100) / 100;
  const totalParticleCount = 40;
  const reactantParticlesCount = Math.round(totalParticleCount * reactantConc);
  const productParticlesCount = totalParticleCount - reactantParticlesCount;

  // Handler Card Sorter Subbab 1.1
  const handleSelectSorter = (cardId: string, category: 'cepat' | 'sedang' | 'lambat') => {
    if (sorterSubmitted) return;
    setSorterSelections((prev) => ({ ...prev, [cardId]: category }));
  };

  const handleResetSorter = () => {
    setSorterSelections({});
    setSorterSubmitted(false);
  };

  const sorterScore = PHENOMENON_CARDS.reduce((acc, card) => {
    return acc + (sorterSelections[card.id] === card.category ? 1 : 0);
  }, 0);

  // Handler Kuis Evaluasi
  const handleSelectQuizAnswer = (qId: number, key: string) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: key }));
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const quizCorrectCount = CHAPTER_1_QUIZ.reduce((acc, q) => {
    return acc + (quizAnswers[q.id] === q.correctKey ? 1 : 0);
  }, 0);
  const quizScore = Math.round((quizCorrectCount / CHAPTER_1_QUIZ.length) * 100);

  return (
    <div className="module-page-container animate-fade-in">
      {/* 1. Bilah Breadcrumb & Navigasi Atas */}
      <div className="module-top-bar">
        <button
          type="button"
          className="btn-back-link"
          onClick={onBackToHome}
          aria-label="Kembali ke Beranda"
        >
          ← Kembali ke Beranda & Peta Modul
        </button>
        <span className="breadcrumb-current">
          Beranda / <strong>Bab 1: Mengenal Laju Reaksi</strong>
        </span>
      </div>

      <section className="labsheet-container" aria-labelledby="chapter1-title">
        {/* 2. Header Lembar Kerja Siswa Bergaya Catatan Laboratorium Modern */}
        <div className="labsheet-header">
          <div className="labsheet-meta">
            <span className="labsheet-code">LKPD-XI-01 • MODUL PEMBELAJARAN INTRODUKSI</span>
            <span className="labsheet-topic">KIMIA SMA / MA KELAS XI</span>
          </div>
          <h1 id="chapter1-title" className="labsheet-title">
            Bab 1: Mengenal Laju Reaksi
          </h1>
          <p className="labsheet-lead">
            Pondasi konseptual mengenai hakikat kecepatan perubahan kimia: memahami fenomena cepat versus lambat,
            merumuskan laju perubahan konsentrasi molaritas per satuan waktu, menelaah grafik konsentrasi terhadap waktu,
            serta mengeksplorasi metode pengukuran makroskopis di laboratorium.
          </p>

          <div className="labsheet-info-strip">
            <div className="strip-item">
              <span className="strip-label">Fokus Materi:</span>
              <span className="strip-value">Definisi, Molaritas, Kurva [Zat] vs Waktu, & Pengukuran Lab</span>
            </div>
            <div className="strip-item">
              <span className="strip-label">Tingkat Representasi:</span>
              <span className="strip-value">Makroskopis & Simbolik</span>
            </div>
            <div className="strip-item">
              <span className="strip-label">Cakupan Bab:</span>
              <span className="strip-value value-ready">✓ 4 Subbab Lengkap & Terstruktur</span>
            </div>
          </div>
        </div>

        {/* 3. Tab Navigasi 4 Subbab Utama */}
        <div className="chapter-subnav-wrapper">
          <div className="chapter-subnav-header">
            <span className="subnav-label">PILIH TAHAPAN SUBBAB BELAJAR:</span>
            <span className="subnav-indicator">Subbab Aktif: {activeSection.code}</span>
          </div>

          <div className="chapter-subnav-grid" role="tablist" aria-label="Daftar Subbab Bab 1">
            {MODULE_1_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                role="tab"
                aria-selected={activeSectionId === sec.id}
                className={`chapter-subnav-card ${activeSectionId === sec.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveSectionId(sec.id);
                  // Gulir halus ke konten subbab
                  const el = document.getElementById('subbab-content-anchor');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <div className="subnav-card-top">
                  <span className="subnav-badge">{sec.code}</span>
                  <span className="subnav-category">{sec.category}</span>
                </div>
                <h3 className="subnav-card-title">{sec.title}</h3>
                <p className="subnav-card-sub">{sec.subtitle}</p>
              </button>
            ))}
          </div>
        </div>

        <div id="subbab-content-anchor" style={{ scrollMarginTop: '80px' }}></div>

        {/* =========================================================================
            SUBBAB 1.1: FENOMENA REAKSI KIMIA DALAM KEHIDUPAN SEHARI-HARI
            ========================================================================= */}
        {activeSectionId === 'sec-1-1' && (
          <div className="subbab-section-container animate-fade-in">
            {/* Pertanyaan Pemantik */}
            <div className="spark-question-card">
              <div className="spark-header">
                <span className="spark-badge">PERTANYAAN PEMANTIK</span>
                <span className="spark-tag">Refleksi Pengamatan Awal</span>
              </div>
              <h2 className="spark-title">
                Mengapa Kembang Api Meledak Seketika, Sedangkan Pagar Besi Berkarat Berbulan-bulan?
              </h2>
              <p className="spark-desc">
                Saat malam perayaan tahun baru, bubuk mesiu dalam kembang api terbakar dan meledak hanya dalam hitungan milidetik.
                Di sisi lain, pagar besi di halaman rumah membutuhkan waktu berminggu-minggu hingga bertahun-tahun untuk berubah menjadi karat kecokelatan.
                Keduanya sama-sama merupakan reaksi kimia. <strong>Lantas, apa yang membedakan kecepatan perubahan zat-zat tersebut di alam semesta?</strong>
              </p>
            </div>

            {/* Uraian Materi Konsep Ilmiah */}
            <div className="concept-explanation-card">
              <div className="concept-card-top">
                <span className="concept-tag">KONSEP ILMIAH</span>
                <h3 className="concept-title">Keberagaman Laju Reaksi di Sekitar Kita</h3>
              </div>

              <p className="concept-paragraph">
                Reaksi kimia adalah proses di mana satu atau lebih zat pereaksi (reaktan) berubah menjadi zat baru (produk).
                Namun, waktu yang dibutuhkan untuk menyelesaikan perubahan tersebut memiliki rentang yang luar biasa luas:
              </p>

              <div className="speed-category-grid">
                <div className="speed-card fast">
                  <div className="speed-icon">⚡</div>
                  <h4 className="speed-title">Reaksi Sangat Cepat</h4>
                  <span className="speed-duration">Fraksi Detik (Milidetik) s.d. Detik</span>
                  <p className="speed-desc">
                    Terjadi seketika saat pereaksi bercampur.
                    Contoh: Ledakan kembang api, nyala korek gas elpiji, dan reaksi penetralan asam-basa kuat (HCl + NaOH).
                  </p>
                </div>

                <div className="speed-card medium">
                  <div className="speed-icon">⏱️</div>
                  <h4 className="speed-title">Reaksi Sedang</h4>
                  <span className="speed-duration">Hitungan Detik s.d. Jam</span>
                  <p className="speed-desc">
                    Perubahan zat dapat diamati secara nyaman dalam rentang menit.
                    Contoh: Pelarutan tablet vitamin C effervescent dalam air (30–60 detik), pembakaran kayu bakar, dan fermentasi adonan roti.
                  </p>
                </div>

                <div className="speed-card slow">
                  <div className="speed-icon">⏳</div>
                  <h4 className="speed-title">Reaksi Sangat Lambat</h4>
                  <span className="speed-duration">Bulan s.d. Jutaan Tahun</span>
                  <p className="speed-desc">
                    Perubahan berlangsung sangat lambat dan membutuhkan pengamatan berkala.
                    Contoh: Perkaratan besi pada jembatan dan kapal, pelapukan kimia batuan kapur, serta pembentukan minyak bumi purba.
                  </p>
                </div>
              </div>

              <div className="scientific-note-box" style={{ marginTop: '1.25rem' }}>
                <div className="note-icon" aria-hidden="true">💡</div>
                <div>
                  <strong>Kesimpulan Awal Kimiawan:</strong>
                  <p>
                    Reaksi kimia tidak hanya berbicara tentang <em>apa</em> hasil akhirnya (produk), tetapi juga <em>seberapa cepat</em> zat tersebut bereaksi.
                    Ukuran kelajuan inilah yang kita pelajari sebagai <strong>Laju Reaksi (Reaction Rate)</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Aktivitas Interaktif 1.1: Reaction Speed Card Sorter */}
            <div className="interactive-activity-box">
              <div className="activity-box-header">
                <div className="activity-badge-group">
                  <span className="activity-pill">AKTIVITAS INTERAKTIF 1.1</span>
                  <span className="activity-type">Klasifikasi Fenomena Nyata</span>
                </div>
                <h3 className="activity-title">Uji Klasifikasi: Cepat, Sedang, atau Lambat?</h3>
                <p className="activity-desc">
                  Kelompokkan keenam peristiwa kimia di bawah ini ke dalam kategori kelajuan reaksi yang tepat:
                  <strong> Sangat Cepat</strong>, <strong>Sedang</strong>, atau <strong>Sangat Lambat</strong>.
                </p>
              </div>

              <div className="sorter-cards-grid">
                {PHENOMENON_CARDS.map((card) => {
                  const currentSelection = sorterSelections[card.id];
                  const isCorrect = currentSelection === card.category;

                  return (
                    <div
                      key={card.id}
                      className={`sorter-item-card ${
                        sorterSubmitted ? (isCorrect ? 'is-correct' : 'is-wrong') : ''
                      }`}
                    >
                      <div className="sorter-card-top">
                        <span className="sorter-icon">{card.icon}</span>
                        <div>
                          <strong className="sorter-name">{card.title}</strong>
                          <span className="sorter-dur">{card.duration}</span>
                        </div>
                      </div>

                      <p className="sorter-desc">{card.description}</p>

                      <div className="sorter-btn-group">
                        <button
                          type="button"
                          className={`btn-sort-opt ${currentSelection === 'cepat' ? 'selected' : ''}`}
                          onClick={() => handleSelectSorter(card.id, 'cepat')}
                          disabled={sorterSubmitted}
                        >
                          ⚡ Cepat
                        </button>
                        <button
                          type="button"
                          className={`btn-sort-opt ${currentSelection === 'sedang' ? 'selected' : ''}`}
                          onClick={() => handleSelectSorter(card.id, 'sedang')}
                          disabled={sorterSubmitted}
                        >
                          ⏱️ Sedang
                        </button>
                        <button
                          type="button"
                          className={`btn-sort-opt ${currentSelection === 'lambat' ? 'selected' : ''}`}
                          onClick={() => handleSelectSorter(card.id, 'lambat')}
                          disabled={sorterSubmitted}
                        >
                          ⏳ Lambat
                        </button>
                      </div>

                      {sorterSubmitted && (
                        <div className={`sorter-feedback-pill ${isCorrect ? 'pass' : 'fail'}`}>
                          {isCorrect ? '✅ Tepat Sekali' : `❌ Seharusnya: ${card.category.toUpperCase()}`}
                          <p className="sorter-exp-text">{card.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="sorter-action-footer">
                {!sorterSubmitted ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setSorterSubmitted(true)}
                    disabled={Object.keys(sorterSelections).length < PHENOMENON_CARDS.length}
                  >
                    {Object.keys(sorterSelections).length < PHENOMENON_CARDS.length
                      ? `Pilih Kategori Semua Kartu (${Object.keys(sorterSelections).length}/${PHENOMENON_CARDS.length})`
                      : 'Periksa Hasil Klasifikasi Saya'}
                  </button>
                ) : (
                  <div className="sorter-score-summary">
                    <div className="sorter-score-text">
                      <strong>Skor Klasifikasi: {sorterScore} dari {PHENOMENON_CARDS.length} Benar</strong>
                      <p>
                        {sorterScore === 6
                          ? 'Luar biasa! Pemahaman intuitif Anda mengenai spektrum waktu reaksi kimia sangat tajam.'
                          : 'Bagus! Cermati penjelasan di atas untuk memahami perbedaan durasi reaksi di alam.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleResetSorter}
                    >
                      Ulangi Klasifikasi
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SUBBAB 1.2: PENGERTIAN DAN KONSEP DASAR LAJU REAKSI
            ========================================================================= */}
        {activeSectionId === 'sec-1-2' && (
          <div className="subbab-section-container animate-fade-in">
            {/* Pertanyaan Pemantik */}
            <div className="spark-question-card">
              <div className="spark-header">
                <span className="spark-badge">PERTANYAAN PEMANTIK</span>
                <span className="spark-tag">Analogi Fisika ke Kimia</span>
              </div>
              <h2 className="spark-title">
                Jika Laju Mobil Adalah Jarak per Jam, Apa yang Berubah dalam Laju Reaksi Kimia?
              </h2>
              <p className="spark-desc">
                Dalam ilmu Fisika, kelajuan mobil diukur dari seberapa jauh jarak berpindah dalam selang waktu tertentu (v = Δs/Δt, misalnya 60 km/jam).
                Dalam reaksi kimia di wadah tertutup, cairan tidak berpindah ke kota lain. <strong>Besaran apa yang berubah terhadap waktu untuk menyatakan seberapa cepat reaksi terjadi?</strong>
              </p>
            </div>

            {/* Ruang Rumus Utama */}
            <LabFormulaBox />

            {/* Penjelasan Konsep Matematis */}
            <div className="concept-explanation-card">
              <div className="concept-card-top">
                <span className="concept-tag">DEFINISI & OPERATOR MATEMATIS</span>
                <h3 className="concept-title">Makna Ilmiah Molaritas dan Tanda Minus/Plus</h3>
              </div>

              <div className="concept-columns-two">
                <div className="concept-col-text">
                  <h4>1. Besaran Konsentrasi Molaritas (M)</h4>
                  <p>
                    Dalam larutan atau gas, kepekatan partikel dinyatakan dengan <strong>Molaritas (M)</strong>, yaitu jumlah mol zat terlarut dalam 1 liter larutan:
                  </p>
                  <div className="mini-formula-pill">M = mol / Liter = n / V</div>
                  <p>
                    Satuan laju reaksi standar adalah <strong>Molar per detik (M/s atau M·s⁻¹ atau mol·L⁻¹·s⁻¹)</strong>.
                  </p>
                </div>

                <div className="concept-col-text">
                  <h4>2. Mengapa Laju Pereaksi Menggunakan Tanda Minus (−)?</h4>
                  <p>
                    Perubahan konsentrasi pereaksi selalu bernilai negatif karena pereaksi berkurang:
                  </p>
                  <div className="mini-formula-pill">Δ[R] = [R]akhir − [R]awal &lt; 0</div>
                  <p>
                    Agar nilai kelajuan <em>(v)</em> yang dihasilkan tetap bernilai <strong>positif</strong> (karena di alam kelajuan tidak bernilai negatif), rumus diberi tanda minus penyeimbang: <code>v = −(Δ[R]/Δt)</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Aktivitas Interaktif 1.2: Kalkulator Analog Laju Reaksi */}
            <div className="interactive-activity-box">
              <div className="activity-box-header">
                <div className="activity-badge-group">
                  <span className="activity-pill">AKTIVITAS INTERAKTIF 1.2</span>
                  <span className="activity-type">Simulator Perhitungan Mandiri</span>
                </div>
                <h3 className="activity-title">Kalkulator Pembuktian Rumus Laju Reaksi</h3>
                <p className="activity-desc">
                  Ubah nilai konsentrasi awal, konsentrasi akhir pereaksi A, dan selang waktu reaksi untuk melihat bagaimana tanda minus menghasilkan nilai laju yang positif:
                </p>
              </div>

              <div className="calc-sim-grid">
                <div className="calc-controls-col">
                  <div className="calc-control-group">
                    <label className="calc-label">
                      Konsentrasi Mula-mula [A]₀:
                      <strong className="calc-val-display">{calcInitialConc} M</strong>
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={calcInitialConc}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setCalcInitialConc(val);
                        if (val <= calcFinalConc) setCalcFinalConc(Math.max(0.1, val - 0.2));
                      }}
                      className="calc-range-slider"
                    />
                  </div>

                  <div className="calc-control-group">
                    <label className="calc-label">
                      Konsentrasi Sisa [A]ₜ (Harus &lt; [A]₀):
                      <strong className="calc-val-display">{calcFinalConc} M</strong>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max={calcInitialConc - 0.1}
                      step="0.05"
                      value={calcFinalConc}
                      onChange={(e) => setCalcFinalConc(parseFloat(e.target.value))}
                      className="calc-range-slider"
                    />
                  </div>

                  <div className="calc-control-group">
                    <label className="calc-label">
                      Selang Waktu Reaksi (Δt):
                      <strong className="calc-val-display">{calcDeltaTime} detik</strong>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={calcDeltaTime}
                      onChange={(e) => setCalcDeltaTime(parseInt(e.target.value))}
                      className="calc-range-slider"
                    />
                  </div>
                </div>

                <div className="calc-result-col">
                  <div className="calc-card-result">
                    <span className="res-tag">HASIL LANGKAH PERHITUNGAN:</span>

                    <div className="step-row">
                      <span className="step-num">1</span>
                      <div className="step-body">
                        <strong>Perubahan Konsentrasi (Δ[A]):</strong>
                        <code>Δ[A] = [A]ₜ − [A]₀ = {calcFinalConc} M − {calcInitialConc} M = {deltaConc} M</code>
                        <span className="step-note">(Bernilai negatif karena zat pereaksi berkurang)</span>
                      </div>
                    </div>

                    <div className="step-row">
                      <span className="step-num">2</span>
                      <div className="step-body">
                        <strong>Substitusi Rumus Laju (v_A):</strong>
                        <code>v_A = −(Δ[A] / Δt) = −({deltaConc} M / {calcDeltaTime} s)</code>
                      </div>
                    </div>

                    <div className="step-final-box">
                      <span className="final-label">Nilai Laju Reaksi (v_A):</span>
                      <span className="final-value">{calculatedRate} M/detik</span>
                    </div>

                    <p className="final-meaning-text">
                      💡 <strong>Arti Fisis:</strong> Dalam setiap 1 detik, konsentrasi pereaksi A berkurang sebanyak <strong>{calculatedRate} mol</strong> di dalam setiap 1 liter larutan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SUBBAB 1.3: PERUBAHAN KONSENTRASI PEREAKSI DAN PRODUK
            ========================================================================= */}
        {activeSectionId === 'sec-1-3' && (
          <div className="subbab-section-container animate-fade-in">
            {/* Pertanyaan Pemantik */}
            <div className="spark-question-card">
              <div className="spark-header">
                <span className="spark-badge">PERTANYAAN PEMANTIK</span>
                <span className="spark-tag">Dinamika Perubahan Zat</span>
              </div>
              <h2 className="spark-title">
                Pada Reaksi N₂ + 3H₂ → 2NH₃, Apakah Semua Zat Berubah dengan Kecepatan yang Sama?
              </h2>
              <p className="spark-desc">
                Ketika 1 molekul nitrogen bereaksi, dibutuhkan tepat 3 molekul hidrogen untuk menghasilkan 2 molekul amonia.
                <strong> Apakah gas hidrogen berkurang tiga kali lebih cepat daripada gas nitrogen? Bagaimana bentuk kurva konsentrasi mereka jika digambarkan terhadap waktu?</strong>
              </p>
            </div>

            {/* Pemaparan Konsep Stoikiometri Laju & Kurva */}
            <div className="concept-explanation-card">
              <div className="concept-card-top">
                <span className="concept-tag">HUKUM PERBANDINGAN LAJU</span>
                <h3 className="concept-title">Keterkaitan Koefisien Reaksi dan Laju Pengurangan/Pertambahan</h3>
              </div>

              <p className="concept-paragraph">
                Untuk reaksi umum berkesetimbangan stoikiometri:
              </p>
              <div className="equation-highlight-box">
                a A + b B → c C + d D
              </div>
              <p className="concept-paragraph">
                Perbandingan laju berkurangnya pereaksi dan bertambahnya produk sebanding dengan perbandingan koefisien reaksinya masing-masing:
              </p>
              <div className="ratio-formula-box">
                v = − 1/a (Δ[A]/Δt) = − 1/b (Δ[B]/Δt) = + 1/c (Δ[C]/Δt) = + 1/d (Δ[D]/Δt)
              </div>
              <div className="ratio-summary-tag">
                Maka berlaku perbandingan: <strong>v_A : v_B : v_C : v_D = a : b : c : d</strong>
              </div>
            </div>

            {/* Animasi Interaktif: Partikel Pereaksi -> Produk + Kurva Grafis Sinkron */}
            <div className="interactive-activity-box">
              <div className="activity-box-header">
                <div className="activity-badge-group">
                  <span className="activity-pill">SIMULASI ANIMASI INTERAKTIF</span>
                  <span className="activity-type">Representasi Partikel &amp; Grafik Kurva</span>
                </div>
                <h3 className="activity-title">Transformasi Partikel Reaktan Menjadi Produk &amp; Kurva [Zat] vs Waktu</h3>
                <p className="activity-desc">
                  Tekan tombol <strong>Play (▶)</strong> atau geser slider waktu untuk mengamati bagaimana partikel pereaksi A (merah)
                  berangsur-angsur bertransformasi menjadi produk B (hijau), dan bagaimana grafik kurvanya terbentuk secara sinkron:
                </p>
              </div>

              {/* Kontrol Waktu Animasi */}
              <div className="anim-control-bar">
                <div className="anim-btn-group">
                  <button
                    type="button"
                    className={`btn-anim-play ${isAnimRunning ? 'pause' : 'play'}`}
                    onClick={() => setIsAnimRunning(!isAnimRunning)}
                  >
                    {isAnimRunning ? '⏸ Jeda Animasi' : '▶ Jalankan Reaksi'}
                  </button>
                  <button
                    type="button"
                    className="btn-anim-reset"
                    onClick={() => {
                      setIsAnimRunning(false);
                      setAnimTime(0);
                    }}
                  >
                    🔄 Mulai Dari Awal (t = 0)
                  </button>
                </div>

                <div className="anim-slider-group">
                  <span className="time-display-badge">Waktu: <strong>{animTime} detik</strong> / {maxAnimTime}s</span>
                  <input
                    type="range"
                    min="0"
                    max={maxAnimTime}
                    step="0.5"
                    value={animTime}
                    onChange={(e) => {
                      setIsAnimRunning(false);
                      setAnimTime(parseFloat(e.target.value));
                    }}
                    className="time-scrubber"
                  />
                </div>
              </div>

              {/* Tampilan Dua Kolom: Bejana Partikel & Kurva Grafik */}
              <div className="anim-dual-display">
                {/* Kolom 1: Bejana Visual Partikel */}
                <div className="chamber-visual-card">
                  <div className="chamber-header">
                    <span className="chamber-label">BEJANA REAKSI TERTUTUP (Tingkat Partikel)</span>
                    <span className="particle-count-pill">
                      🔴 A: {reactantParticlesCount} | 🟢 B: {productParticlesCount}
                    </span>
                  </div>

                  {/* Wadah Partikel SVG */}
                  <div className="particles-canvas-wrap">
                    <svg viewBox="0 0 320 220" className="particles-svg">
                      <rect x="10" y="10" width="300" height="200" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                      
                      {/* Grid Lembar Lab Halus */}
                      <defs>
                        <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect x="10" y="10" width="300" height="200" rx="12" fill="url(#gridPattern)" />

                      {/* Partikel Reaktan (Merah) */}
                      {Array.from({ length: reactantParticlesCount }).map((_, i) => {
                        const seedX = ((i * 37 + 13) % 270) + 25;
                        const seedY = ((i * 53 + 29) % 170) + 25;
                        return (
                          <circle
                            key={`r-${i}`}
                            cx={seedX}
                            cy={seedY}
                            r="6"
                            fill="#ef4444"
                            stroke="#fca5a5"
                            strokeWidth="1.5"
                            className="particle-bubble"
                          />
                        );
                      })}

                      {/* Partikel Produk (Hijau) */}
                      {Array.from({ length: productParticlesCount }).map((_, j) => {
                        const seedX = ((j * 43 + 31) % 270) + 25;
                        const seedY = ((j * 61 + 17) % 170) + 25;
                        return (
                          <circle
                            key={`p-${j}`}
                            cx={seedX}
                            cy={seedY}
                            r="7"
                            fill="#10b981"
                            stroke="#86efac"
                            strokeWidth="1.5"
                            className="particle-bubble pulse-appear"
                          />
                        );
                      })}
                    </svg>
                  </div>

                  <div className="chamber-legend">
                    <span className="legend-item"><span className="dot red"></span> Pereaksi A ([A] = {reactantConc} M)</span>
                    <span className="legend-item"><span className="dot green"></span> Produk B ([B] = {productConc} M)</span>
                  </div>
                </div>

                {/* Kolom 2: Grafik Kurva Konsentrasi vs Waktu */}
                <div className="graph-visual-card">
                  <div className="graph-header">
                    <span className="graph-label">GRAFIK KONSENTRASI VS WAKTU [Zat] terhadap t</span>
                    <span className="status-label">{animTime === 0 ? 'Kondisi Awal' : animTime >= 28 ? 'Reaksi Hampir Selesai' : 'Sedang Berlangsung'}</span>
                  </div>

                  <div className="graph-svg-wrap">
                    <svg viewBox="0 0 340 220" className="curve-graph-svg">
                      {/* Sumbu X dan Y */}
                      <line x1="45" y1="20" x2="45" y2="180" stroke="#64748b" strokeWidth="2" />
                      <line x1="45" y1="180" x2="320" y2="180" stroke="#64748b" strokeWidth="2" />

                      {/* Label Sumbu */}
                      <text x="15" y="25" fill="#94a3b8" fontSize="10" fontWeight="bold">Konsentrasi (M)</text>
                      <text x="270" y="200" fill="#94a3b8" fontSize="10" fontWeight="bold">Waktu t (s)</text>

                      {/* Angka Sumbu Y */}
                      <text x="32" y="35" fill="#64748b" fontSize="9">1.0 M</text>
                      <text x="32" y="105" fill="#64748b" fontSize="9">0.5 M</text>
                      <text x="32" y="180" fill="#64748b" fontSize="9">0.0</text>

                      {/* Angka Sumbu X */}
                      <text x="45" y="195" fill="#64748b" fontSize="9">0</text>
                      <text x="135" y="195" fill="#64748b" fontSize="9">10s</text>
                      <text x="225" y="195" fill="#64748b" fontSize="9">20s</text>
                      <text x="305" y="195" fill="#64748b" fontSize="9">30s</text>

                      {/* Garis Kurva Reaktan (Merah Menurun) */}
                      {/* y: 1.0M -> 30px, 0.0M -> 180px, span = 150px. x: 0s -> 45px, 30s -> 315px */}
                      <path
                        d="M 45 30 Q 120 130, 315 168"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                        strokeDasharray="none"
                      />

                      {/* Garis Kurva Produk (Hijau Menaik) */}
                      <path
                        d="M 45 180 Q 120 80, 315 42"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="none"
                      />

                      {/* Titik Koordinat Posisi Waktu Saat Ini */}
                      {(() => {
                        const posX = 45 + (animTime / maxAnimTime) * 270;
                        const posY_Reactant = 180 - (reactantConc * 150);
                        const posY_Product = 180 - (productConc * 150);

                        return (
                          <>
                            {/* Garis Vertikal Penunjuk Waktu */}
                            <line x1={posX} y1="20" x2={posX} y2="180" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />

                            {/* Titik Reaktan */}
                            <circle cx={posX} cy={posY_Reactant} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />

                            {/* Titik Produk */}
                            <circle cx={posX} cy={posY_Product} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  <div className="graph-insights">
                    <div className="insight-bullet">
                      <strong className="text-danger">🔴 Kurva Pereaksi:</strong> Curam di awal (laju tinggi), kemudian melandai karena partikel pereaksi makin sedikit.
                    </div>
                    <div className="insight-bullet">
                      <strong className="text-success">🟢 Kurva Produk:</strong> Naik cepat dari nol, melandai, dan mendatar sempurna saat pereaksi habis total.
                    </div>
                  </div>
                </div>
              </div>

              {/* Kalkulator Stoikiometri Interaktif */}
              <div className="stoich-calc-panel">
                <h4 className="stoich-title">🔢 Uji Hubungan Stoikiometri Perbandingan Laju</h4>
                <p className="stoich-sub">
                  Pilih persamaan reaksi kimia dan masukkan laju salah satu zat untuk melihat laju zat lainnya dihitung secara otomatis:
                </p>

                <div className="stoich-reaction-picker">
                  <button
                    type="button"
                    className={`btn-reaction-pick ${selectedStoichReaction === 'amonia' ? 'active' : ''}`}
                    onClick={() => { setSelectedStoichReaction('amonia'); setInputRateVal(0.06); }}
                  >
                    1. Sintesis Amonia: N₂ + 3H₂ → 2NH₃
                  </button>
                  <button
                    type="button"
                    className={`btn-reaction-pick ${selectedStoichReaction === 'dinitrogen' ? 'active' : ''}`}
                    onClick={() => { setSelectedStoichReaction('dinitrogen'); setInputRateVal(0.08); }}
                  >
                    2. Penguraian: 2N₂O₅ → 4NO₂ + O₂
                  </button>
                  <button
                    type="button"
                    className={`btn-reaction-pick ${selectedStoichReaction === 'belerang' ? 'active' : ''}`}
                    onClick={() => { setSelectedStoichReaction('belerang'); setInputRateVal(0.04); }}
                  >
                    3. Oksidasi: 2SO₂ + O₂ → 2SO₃
                  </button>
                </div>

                <div className="stoich-results-card">
                  {selectedStoichReaction === 'amonia' && (
                    <div className="stoich-detail-grid">
                      <div className="stoich-input-box">
                        <label>Laju Berkurangnya N₂ (v_N₂):</label>
                        <div className="input-with-unit">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={inputRateVal}
                            onChange={(e) => setInputRateVal(parseFloat(e.target.value) || 0.01)}
                            className="input-rate"
                          />
                          <span>M/s</span>
                        </div>
                      </div>

                      <div className="stoich-calc-outputs">
                        <div className="stoich-out-row">
                          <span>Laju Berkurangnya H₂ (v_H₂):</span>
                          <strong>{(inputRateVal * 3).toFixed(3)} M/s</strong>
                          <span className="ratio-badge">3 × v_N₂ (karena koefisien 3)</span>
                        </div>
                        <div className="stoich-out-row">
                          <span>Laju Bertambahnya NH₃ (v_NH₃):</span>
                          <strong className="text-success">{(inputRateVal * 2).toFixed(3)} M/s</strong>
                          <span className="ratio-badge">2 × v_N₂ (karena koefisien 2)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedStoichReaction === 'dinitrogen' && (
                    <div className="stoich-detail-grid">
                      <div className="stoich-input-box">
                        <label>Laju Berkurangnya N₂O₅ (v_N₂O₅):</label>
                        <div className="input-with-unit">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={inputRateVal}
                            onChange={(e) => setInputRateVal(parseFloat(e.target.value) || 0.01)}
                            className="input-rate"
                          />
                          <span>M/s</span>
                        </div>
                      </div>

                      <div className="stoich-calc-outputs">
                        <div className="stoich-out-row">
                          <span>Laju Pembentukan NO₂ (v_NO₂):</span>
                          <strong className="text-success">{(inputRateVal * 2).toFixed(3)} M/s</strong>
                          <span className="ratio-badge">(4/2) × v_N₂O₅ = 2 × v_N₂O₅</span>
                        </div>
                        <div className="stoich-out-row">
                          <span>Laju Pembentukan O₂ (v_O₂):</span>
                          <strong className="text-success">{(inputRateVal * 0.5).toFixed(3)} M/s</strong>
                          <span className="ratio-badge">(1/2) × v_N₂O₅ = 0.5 × v_N₂O₅</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedStoichReaction === 'belerang' && (
                    <div className="stoich-detail-grid">
                      <div className="stoich-input-box">
                        <label>Laju Berkurangnya SO₂ (v_SO₂):</label>
                        <div className="input-with-unit">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={inputRateVal}
                            onChange={(e) => setInputRateVal(parseFloat(e.target.value) || 0.01)}
                            className="input-rate"
                          />
                          <span>M/s</span>
                        </div>
                      </div>

                      <div className="stoich-calc-outputs">
                        <div className="stoich-out-row">
                          <span>Laju Berkurangnya O₂ (v_O₂):</span>
                          <strong>{(inputRateVal * 0.5).toFixed(3)} M/s</strong>
                          <span className="ratio-badge">(1/2) × v_SO₂</span>
                        </div>
                        <div className="stoich-out-row">
                          <span>Laju Pembentukan SO₃ (v_SO₃):</span>
                          <strong className="text-success">{(inputRateVal * 1.0).toFixed(3)} M/s</strong>
                          <span className="ratio-badge">Sama persis (koefisien sama = 2)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SUBBAB 1.4: PENGAMATAN DAN PENGUKURAN LAJU REAKSI
            ========================================================================= */}
        {activeSectionId === 'sec-1-4' && (
          <div className="subbab-section-container animate-fade-in">
            {/* Pertanyaan Pemantik */}
            <div className="spark-question-card">
              <div className="spark-header">
                <span className="spark-badge">PERTANYAAN PEMANTIK</span>
                <span className="spark-tag">Metodologi Eksperimen Lab</span>
              </div>
              <h2 className="spark-title">
                Molekul Tidak Dapat Dilihat Mata Telanjang, Bagaimana Cara Kita Mengukur Laju Reaksi di Lab?
              </h2>
              <p className="spark-desc">
                Partikel zat berukuran submikroskopis dan bergerak dengan kecepatan sangat tinggi.
                Kita tidak bisa menggunakan penggaris untuk mengukur laju partikel.
                <strong> Bagaimana para kimiawan menggunakan panca indra dan alat ukur makroskopis laboratorium untuk merekam laju reaksi secara akurat?</strong>
              </p>
            </div>

            {/* Pemaparan Konsep 4 Metode Makroskopis */}
            <div className="concept-explanation-card">
              <div className="concept-card-top">
                <span className="concept-tag">METODE LABORATORIUM</span>
                <h3 className="concept-title">4 Cara Pengamatan Makroskopis di Laboratorium Kimia</h3>
              </div>

              <div className="apparatus-methods-grid">
                <div className="method-box">
                  <div className="method-icon">🧪</div>
                  <h4>1. Pengukuran Volume Gas</h4>
                  <p>Digunakan untuk reaksi yang menghasilkan produk berfasa gas.</p>
                  <div className="method-rxn">Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)↑</div>
                  <span className="method-formula">v = ΔV_gas / Δt (mL/detik)</span>
                </div>

                <div className="method-box">
                  <div className="method-icon">⚖️</div>
                  <h4>2. Pengurangan Massa Sistem</h4>
                  <p>Untuk reaksi wadah terbuka yang melepaskan gas berat (seperti CO₂).</p>
                  <div className="method-rxn">CaCO₃(s) + 2HCl(aq) → CaCl₂ + H₂O + CO₂(g)↑</div>
                  <span className="method-formula">v = Δm_massa / Δt (gram/detik)</span>
                </div>

                <div className="method-box">
                  <div className="method-icon">✖️</div>
                  <h4>3. Waktu Kekeruhan Endapan</h4>
                  <p>Mengukur waktu hingga tanda silang hitam tertutup endapan.</p>
                  <div className="method-rxn">Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl + SO₂ + S(s)↓ + H₂O</div>
                  <span className="method-formula">v ∝ 1/waktu (s⁻¹)</span>
                </div>

                <div className="method-box">
                  <div className="method-icon">🌈</div>
                  <h4>4. Perubahan Warna / Tekanan</h4>
                  <p>Mengukur perubahan intensitas serapan warna (spektrofotometri) atau tekanan gas manometer.</p>
                  <div className="method-rxn">2NO₂(g) [Cokelat] ⇌ N₂O₄(g) [Tak Berwarna]</div>
                  <span className="method-formula">v = ΔAbsorbansi / Δt</span>
                </div>
              </div>
            </div>

            {/* Aktivitas Interaktif 1.4: Virtual Lab Apparatus Explorer */}
            <div className="interactive-activity-box">
              <div className="activity-box-header">
                <div className="activity-badge-group">
                  <span className="activity-pill">EKSPLORASI ALAT LABORATORIUM</span>
                  <span className="activity-type">Simulasi Alat Ukur Makroskopis</span>
                </div>
                <h3 className="activity-title">Pilih Alat Ukur &amp; Analisis Cara Kerja Laboratorium</h3>
                <p className="activity-desc">
                  Klik salah satu dari 3 instrumen di bawah ini untuk melihat rangkaian alat, data pengamatan simulasi, dan rumus perhitungannya:
                </p>
              </div>

              {/* Selector Tab Alat */}
              <div className="apparatus-selector-tabs">
                <button
                  type="button"
                  className={`btn-app-tab ${selectedApparatus === 'gas' ? 'active' : ''}`}
                  onClick={() => setSelectedApparatus('gas')}
                >
                  <span className="tab-icon">🧪</span>
                  <span>Buret Gas (Gas Syringe)</span>
                </button>

                <button
                  type="button"
                  className={`btn-app-tab ${selectedApparatus === 'massa' ? 'active' : ''}`}
                  onClick={() => setSelectedApparatus('massa')}
                >
                  <span className="tab-icon">⚖️</span>
                  <span>Neraca Pengurangan Massa</span>
                </button>

                <button
                  type="button"
                  className={`btn-app-tab ${selectedApparatus === 'kekeruhan' ? 'active' : ''}`}
                  onClick={() => setSelectedApparatus('kekeruhan')}
                >
                  <span className="tab-icon">✖️</span>
                  <span>Uji Kekeruhan Tanda Silang</span>
                </button>
              </div>

              {/* Detail Alat yang Dipilih */}
              <div className="apparatus-detail-card">
                {selectedApparatus === 'gas' && (
                  <div className="app-content-layout">
                    <div className="app-info-col">
                      <span className="app-tag">METODE 1: PENAMPUNGAN GAS</span>
                      <h4 className="app-title">Buret Gas (Gas Syringe / Eudiometer)</h4>
                      <p className="app-description">
                        Pita magnesium ($Mg$) dimasukkan ke dalam labu erlenmeyer yang berisi asam klorida ($HCl$).
                        Labu segera ditutup dengan sumbat karet berselang yang terhubung ke buret gas berskala.
                        Gas hidrogen ($H_2$) yang dihasilkan akan mendorong piston buret gas ke kanan.
                      </p>

                      <div className="app-data-box">
                        <strong>Simulasi Data Pengamatan:</strong>
                        <div className="data-table-mini">
                          <div className="row-header"><span>Waktu (t)</span><span>Volume Gas H₂</span><span>Laju Interval (ΔV/Δt)</span></div>
                          <div className="row-data"><span>0 detik</span><span>0 mL</span><span>-</span></div>
                          <div className="row-data"><span>10 detik</span><span>25 mL</span><span>2,5 mL/s</span></div>
                          <div className="row-data"><span>20 detik</span><span>42 mL</span><span>1,7 mL/s</span></div>
                          <div className="row-data"><span>30 detik</span><span>50 mL</span><span>0,8 mL/s</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="app-schematic-col">
                      <div className="schematic-card">
                        <span className="schematic-title">Skema Rangkaian Alat:</span>
                        <div className="schematic-svg-wrap">
                          <svg viewBox="0 0 280 180" className="schematic-svg">
                            {/* Erlenmeyer */}
                            <path d="M 50 140 L 90 140 L 78 80 L 78 60 L 62 60 L 62 80 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                            {/* Larutan asam */}
                            <path d="M 54 135 L 86 135 L 75 95 L 65 95 Z" fill="#38bdf8" opacity="0.6" />
                            {/* Pita Mg */}
                            <rect x="67" y="125" width="6" height="8" fill="#94a3b8" />
                            {/* Gelembung H2 */}
                            <circle cx="68" cy="115" r="2" fill="#ffffff" />
                            <circle cx="72" cy="105" r="2.5" fill="#ffffff" />
                            <circle cx="70" cy="85" r="2" fill="#ffffff" />
                            {/* Sumbat Karet */}
                            <rect x="60" y="52" width="20" height="9" rx="2" fill="#475569" />
                            {/* Selang Penghubung */}
                            <path d="M 70 52 L 70 35 L 140 35 L 140 85 L 155 85" fill="none" stroke="#64748b" strokeWidth="3" />
                            {/* Gas Syringe (Buret Gas) */}
                            <rect x="155" y="70" width="100" height="30" rx="3" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                            {/* Skala Buret */}
                            <line x1="175" y1="70" x2="175" y2="78" stroke="#64748b" strokeWidth="1.5" />
                            <line x1="195" y1="70" x2="195" y2="78" stroke="#64748b" strokeWidth="1.5" />
                            <line x1="215" y1="70" x2="215" y2="78" stroke="#64748b" strokeWidth="1.5" />
                            <line x1="235" y1="70" x2="235" y2="78" stroke="#64748b" strokeWidth="1.5" />
                            {/* Piston yang Terdorong Gas */}
                            <rect x="220" y="72" width="12" height="26" fill="#38bdf8" />
                            <line x1="232" y1="85" x2="270" y2="85" stroke="#0284c7" strokeWidth="4" />
                            {/* Gas H2 di dalam buret */}
                            <rect x="157" y="72" width="63" height="26" fill="#e0f2fe" opacity="0.7" />
                            <text x="170" y="88" fill="#0369a1" fontSize="9" fontWeight="bold">Gas H₂</text>
                          </svg>
                        </div>
                        <span className="schematic-note">✓ Piston bergerak ke kanan seiring bertambahnya volume gas H₂.</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedApparatus === 'massa' && (
                  <div className="app-content-layout">
                    <div className="app-info-col">
                      <span className="app-tag">METODE 2: PENGURANGAN MASSA SISTEM</span>
                      <h4 className="app-title">Neraca Analitik Digital (Mass Loss)</h4>
                      <p className="app-description">
                        Bongkahan pualam kalsium karbonat ($CaCO_3$) direaksikan dengan asam klorida ($HCl$) dalam labu di atas neraca digital.
                        Mulut labu disumbat kapas longgar agar uap asam tidak keluar, namun gas $CO_2$ yang terbentuk dapat terbang bebas ke udara.
                        Berkurangnya massa sistem per satuan waktu menunjukkan laju reaksi.
                      </p>

                      <div className="app-data-box">
                        <strong>Simulasi Data Pengamatan:</strong>
                        <div className="data-table-mini">
                          <div className="row-header"><span>Waktu (t)</span><span>Massa Terbaca</span><span>Massa CO₂ Lepas (Δm)</span></div>
                          <div className="row-data"><span>0 detik</span><span>150,00 gram</span><span>0,00 g</span></div>
                          <div className="row-data"><span>30 detik</span><span>149,45 gram</span><span>0,55 g</span></div>
                          <div className="row-data"><span>60 detik</span><span>149,15 gram</span><span>0,85 g</span></div>
                          <div className="row-data"><span>90 detik</span><span>149,02 gram</span><span>0,98 g</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="app-schematic-col">
                      <div className="schematic-card">
                        <span className="schematic-title">Skema Rangkaian Alat:</span>
                        <div className="schematic-svg-wrap">
                          <svg viewBox="0 0 280 180" className="schematic-svg">
                            {/* Neraca Digital */}
                            <rect x="60" y="125" width="160" height="40" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                            {/* Layar Tampilan Neraca */}
                            <rect x="100" y="137" width="80" height="18" rx="2" fill="#0f172a" stroke="#38bdf8" />
                            <text x="110" y="150" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">149.45 g</text>

                            {/* Labu Erlenmeyer di atas neraca */}
                            <path d="M 110 125 L 170 125 L 150 65 L 150 45 L 130 45 L 130 65 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                            {/* Larutan HCl */}
                            <path d="M 115 120 L 165 120 L 148 78 L 132 78 Z" fill="#bae6fd" opacity="0.6" />
                            {/* Butiran CaCO3 */}
                            <circle cx="132" cy="115" r="4" fill="#64748b" />
                            <circle cx="140" cy="117" r="3.5" fill="#64748b" />
                            <circle cx="148" cy="115" r="4.5" fill="#64748b" />

                            {/* Sumbat Kapas Longgar */}
                            <ellipse cx="140" cy="45" rx="11" ry="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />

                            {/* Panah Gas CO2 Terbang Keluar */}
                            <path d="M 140 35 L 140 15 M 135 22 L 140 15 L 145 22" fill="none" stroke="#ef4444" strokeWidth="2" />
                            <text x="150" y="24" fill="#ef4444" fontSize="10" fontWeight="bold">CO₂↑ lepas</text>
                          </svg>
                        </div>
                        <span className="schematic-note">✓ Massa berkurang sebanding dengan jumlah gas CO₂ yang lepas ke atmosfer.</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedApparatus === 'kekeruhan' && (
                  <div className="app-content-layout">
                    <div className="app-info-col">
                      <span className="app-tag">METODE 3: PEMBENTUKAN ENDAPAN KEKERUHAN</span>
                      <h4 className="app-title">Uji Kekeruhan Tanda Silang (Disappearing Cross)</h4>
                      <p className="app-description">
                        Larutan natrium tiosulfat ($Na_2S_2O_3$) dicampur dengan asam klorida ($HCl$) dalam gelas kimia yang diletakkan di atas kertas bertanda silang hitam ($X$).
                        Reaksi menghasilkan endapan belerang padat ($S$) berupa suspensi koloid kuning keputihan.
                        Stopwatch dinyalakan bersamaan, dan dicatat waktu ($t$) saat tanda silang hitam tidak lagi terlihat dari atas tabung.
                      </p>

                      <div className="app-data-box">
                        <strong>Korelasi Laju dan Waktu Reaksi:</strong>
                        <div className="mini-formula-pill" style={{ margin: '8px 0' }}>
                          Laju Reaksi (v) berbanding terbalik dengan Waktu (v ∝ 1 / t)
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                          Jika tanda silang hilang dalam waktu 15 detik, reaksinya 4 kali lebih cepat dibanding jika tanda silang hilang dalam waktu 60 detik.
                        </p>
                      </div>
                    </div>

                    <div className="app-schematic-col">
                      <div className="schematic-card">
                        <span className="schematic-title">Skema Pengamatan dari Atas:</span>
                        <div className="schematic-svg-wrap">
                          <svg viewBox="0 0 280 180" className="schematic-svg">
                            {/* Kertas Putih Alas */}
                            <rect x="40" y="30" width="90" height="90" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
                            {/* Tanda Silang Terlihat Jelas di t=0 */}
                            <line x1="55" y1="45" x2="115" y2="105" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                            <line x1="115" y1="45" x2="55" y2="105" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                            <text x="45" y="138" fill="#0f172a" fontSize="10" fontWeight="bold">t = 0s (Jernih)</text>
                            <text x="45" y="152" fill="#64748b" fontSize="8.5">Tanda X terlihat jelas</text>

                            {/* Panah Reaksi Berjalan */}
                            <path d="M 140 75 L 165 75 M 158 70 L 165 75 L 158 80" fill="none" stroke="#2563eb" strokeWidth="2.5" />

                            {/* Kertas & Larutan Keruh di t=akhir */}
                            <rect x="175" y="30" width="90" height="90" rx="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" opacity="0.9" />
                            {/* Tanda Silang Tertutup Endapan Belerang */}
                            <line x1="190" y1="45" x2="250" y2="105" stroke="#ca8a04" strokeWidth="6" strokeLinecap="round" opacity="0.15" />
                            <line x1="250" y1="45" x2="190" y2="105" stroke="#ca8a04" strokeWidth="6" strokeLinecap="round" opacity="0.15" />
                            <text x="180" y="138" fill="#ca8a04" fontSize="10" fontWeight="bold">t = selesai (Keruh)</text>
                            <text x="180" y="152" fill="#64748b" fontSize="8.5">Tanda X tertutup endapan S</text>
                          </svg>
                        </div>
                        <span className="schematic-note">✓ Partikel belerang menghamburkan cahaya sehingga tanda X terhalang sempurna.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. RANGKUMAN KOMPREHENSIF MATERI BAB 1
            ========================================================================= */}
        <div className="labsheet-section">
          <div className="section-title-wrap">
            <span className="content-category-tag" style={{ background: '#e0f2fe', color: '#0369a1' }}>SINTESIS PONDASI</span>
            <h2 className="section-title">Rangkuman Inti Bab 1: Mengenal Laju Reaksi</h2>
            <p className="section-subtitle">
              Empat pilar konsep fundamental yang wajib dikuasai sebelum melanjutkan ke Bab 2 (Teori Tumbukan):
            </p>
          </div>

          <div className="summary-cards-grid">
            <div className="summary-card-pill">
              <div className="pill-icon">🌍</div>
              <div className="pill-body">
                <strong>1. Spektrum Waktu Reaksi:</strong>
                <p>Reaksi kimia memiliki kecepatan beragam: dari ledakan kembang api (milidetik), pelarutan effervescent (detik), hingga perkaratan besi (bulan/tahun).</p>
              </div>
            </div>

            <div className="summary-card-pill">
              <div className="pill-icon">📐</div>
              <div className="pill-body">
                <strong>2. Definisi Molaritas &amp; Waktu:</strong>
                <p>Laju reaksi adalah laju berkurangnya pereaksi per satuan waktu <code>v = −Δ[R]/Δt</code> atau laju bertambahnya produk <code>v = +Δ[P]/Δt</code> dengan satuan standar <strong>M/detik</strong>.</p>
              </div>
            </div>

            <div className="summary-card-pill">
              <div className="pill-icon">📈</div>
              <div className="pill-body">
                <strong>3. Karakteristik Kurva &amp; Stoikiometri:</strong>
                <p>Kurva pereaksi selalu menurun dan kurva produk selalu menaik. Pada reaksi <code>aA + bB → cC</code>, perbandingan laju setara dengan koefisien: <code>v_A : v_B : v_C = a : b : c</code>.</p>
              </div>
            </div>

            <div className="summary-card-pill">
              <div className="pill-icon">🔬</div>
              <div className="pill-body">
                <strong>4. Pengukuran Makroskopis:</strong>
                <p>Karena molekul tak terlihat, laju diukur dari perubahan makroskopis: volume gas ($H_2$), pengurangan massa ($CO_2$), atau waktu kekeruhan endapan ($v \propto 1/t$).</p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. KUIS EVALUASI FORMATIF BAB 1 (8 SOAL INTERAKTIF)
            ========================================================================= */}
        <div className="labsheet-section">
          <div className="quiz-box-container">
            <div className="quiz-box-header">
              <div>
                <span className="virtual-badge">EVALUASI FORMATIF BAB 1</span>
                <h2 className="quiz-box-title">Uji Pemahaman Konsep: Mengenal Laju Reaksi</h2>
              </div>
              <span className="privacy-badge">🎯 Standar KKTP / KKM: 75 Poin</span>
            </div>

            <p className="quiz-intro-text">
              Jawablah <strong>8 butir soal pilihan ganda</strong> di bawah ini untuk mengukur pemahaman konsep dasar laju reaksi Anda.
              Setelah menekan tombol <strong>"Periksa Jawaban &amp; Tampilkan Pembahasan"</strong>, sistem akan menghitung skor otomatis Anda serta menyajikan ulasan ilmiah langkah demi langkah.
            </p>

            <div className="questions-list">
              {CHAPTER_1_QUIZ.map((q, idx) => (
                <div key={q.id} className="quiz-item-card">
                  <div className="quiz-item-top">
                    <span className="question-number">Soal {idx + 1} dari {CHAPTER_1_QUIZ.length}</span>
                    <span className="topic-badge">Konsep Bab 1</span>
                  </div>

                  <p className="question-text">{q.question}</p>

                  <div className="options-stack">
                    {q.options.map((opt) => {
                      const isSelected = quizAnswers[q.id] === opt.key;
                      let optionClass = 'quiz-opt-btn';
                      if (isSelected) optionClass += ' selected';
                      if (quizSubmitted) {
                        if (opt.key === q.correctKey) optionClass += ' correct';
                        else if (isSelected && opt.key !== q.correctKey) optionClass += ' incorrect';
                      }

                      return (
                        <button
                          key={opt.key}
                          type="button"
                          className={optionClass}
                          onClick={() => handleSelectQuizAnswer(q.id, opt.key)}
                          disabled={quizSubmitted}
                        >
                          <span className="opt-key">{opt.key}.</span>
                          <span className="opt-text">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="answer-explanation-card">
                      <div className="explanation-header">
                        {quizAnswers[q.id] === q.correctKey ? (
                          <span className="exp-badge exp-pass">✅ Jawaban Tepat (+12.5 Poin)</span>
                        ) : (
                          <span className="exp-badge exp-review">ℹ️ Jawaban Keliru (Kunci: {q.correctKey})</span>
                        )}
                      </div>
                      <p className="exp-text"><strong>Pembahasan Ilmiah:</strong> {q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tombol Aksi Kuis & Banner Skor */}
            <div className="quiz-actions-bar">
              {!quizSubmitted ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < CHAPTER_1_QUIZ.length}
                >
                  {Object.keys(quizAnswers).length < CHAPTER_1_QUIZ.length
                    ? `Selesaikan Seluruh Soal (${Object.keys(quizAnswers).length}/${CHAPTER_1_QUIZ.length} Terjawab)`
                    : 'Periksa Jawaban & Tampilkan Pembahasan'}
                </button>
              ) : (
                <div className="quiz-results-banner">
                  <div className="score-summary">
                    <span className="score-number">{quizCorrectCount} / {CHAPTER_1_QUIZ.length}</span>
                    <div className="score-text">
                      <strong>Capaian Skor Bab 1: {quizScore}% {quizScore >= 75 ? '🎉 (TUNTAS)' : '📚 (REMEDIAL)'}</strong>
                      <p>
                        {quizScore >= 75
                          ? 'Selamat! Anda telah memahami konsep dasar laju reaksi dengan sangat baik dan siap melanjutkan ke Bab 2.'
                          : 'Terus semangat! Pelajari kembali pembahasan di atas pada nomor-nomor yang masih keliru untuk memperkuat pemahaman.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleResetQuiz}
                  >
                    Ulangi Kuis Bab 1
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 6. Navigasi Bawah Antar Bab */}
        <div className="module-bottom-nav">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBackToHome}
          >
            ← Kembali ke Beranda
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onNextChapter}
          >
            Lanjut ke Bab 2: Teori Tumbukan &amp; Energi Aktivasi →
          </button>
        </div>
      </section>
    </div>
  );
};
