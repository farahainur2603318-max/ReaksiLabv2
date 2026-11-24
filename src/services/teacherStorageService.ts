/**
 * services/teacherStorageService.ts
 * Layanan penyimpanan persisten untuk Panel Guru ReaksiLab XI.
 * Menyimpan data siswa, nilai, bank soal, hasil evaluasi, dan konfigurasi bobot.
 * Mendukung sinkronisasi localStorage dan seed data awal komprehensif.
 */
import type {
  StudentItem,
  StudentGrade,
  GradingWeightConfig,
  QuestionItem,
  StudentSubmission,
  TeacherActivity,
} from '../types';

// Default KKM & Bobot Penilaian (Kurikulum Merdeka / SMA XI Kimia)
export const DEFAULT_GRADING_CONFIG: GradingWeightConfig = {
  tugas: 20,    // 20%
  kuis: 15,     // 15%
  pretest: 10,  // 10%
  posttest: 25, // 25%
  ujian: 30,    // 30%
  kkm: 75,      // Batas KKTP / KKM Kimia Kelas XI
};

// Data Awal Siswa (XI MIPA 1 & XI MIPA 2)
const INITIAL_STUDENTS: StudentItem[] = [
  { id: 'std-001', nis: '22101', nisn: '0061234501', name: 'Ahmad Faiz Pratama', kelas: 'XI MIPA 1', gender: 'L', email: 'ahmad.faiz@siswa.reaksilab.id' },
  { id: 'std-002', nis: '22102', nisn: '0061234502', name: 'Annisa Rahmawati Putri', kelas: 'XI MIPA 1', gender: 'P', email: 'annisa.rp@siswa.reaksilab.id' },
  { id: 'std-003', nis: '22103', nisn: '0061234503', name: 'Bagas Aditya Nugraha', kelas: 'XI MIPA 1', gender: 'L', email: 'bagas.an@siswa.reaksilab.id' },
  { id: 'std-004', nis: '22104', nisn: '0061234504', name: 'Clarissa Aurelia Dewani', kelas: 'XI MIPA 1', gender: 'P', email: 'clarissa.ad@siswa.reaksilab.id' },
  { id: 'std-005', nis: '22105', nisn: '0061234505', name: 'Dimas Satria Wibowo', kelas: 'XI MIPA 1', gender: 'L', email: 'dimas.sw@siswa.reaksilab.id' },
  { id: 'std-006', nis: '22106', nisn: '0061234506', name: 'Fadhilah Nurul Izzah', kelas: 'XI MIPA 1', gender: 'P', email: 'fadhilah.ni@siswa.reaksilab.id' },
  { id: 'std-007', nis: '22201', nisn: '0061234601', name: 'Gibran Rakabuming Arya', kelas: 'XI MIPA 2', gender: 'L', email: 'gibran.ra@siswa.reaksilab.id' },
  { id: 'std-008', nis: '22202', nisn: '0061234602', name: 'Hana Safitri Maharani', kelas: 'XI MIPA 2', gender: 'P', email: 'hana.sm@siswa.reaksilab.id' },
  { id: 'std-009', nis: '22203', nisn: '0061234603', name: 'Irfan Maulana Yusuf', kelas: 'XI MIPA 2', gender: 'L', email: 'irfan.my@siswa.reaksilab.id' },
  { id: 'std-010', nis: '22204', nisn: '0061234604', name: 'Keisha Amanda Salsabila', kelas: 'XI MIPA 2', gender: 'P', email: 'keisha.as@siswa.reaksilab.id' },
  { id: 'std-011', nis: '22205', nisn: '0061234605', name: 'M. Rizky Ramadhan', kelas: 'XI MIPA 2', gender: 'L', email: 'rizky.ramadhan@siswa.reaksilab.id' },
  { id: 'std-012', nis: '22206', nisn: '0061234606', name: 'Nabila Zahra Syahira', kelas: 'XI MIPA 2', gender: 'P', email: 'nabila.zs@siswa.reaksilab.id' },
];

// Helper kalkulasi nilai akhir
export const calculateFinalScore = (
  g: { tugas: number; kuis: number; pretest: number; posttest: number; ujian: number },
  cfg: GradingWeightConfig
): { finalScore: number; isPassed: boolean } => {
  const totalWeight = cfg.tugas + cfg.kuis + cfg.pretest + cfg.posttest + cfg.ujian;
  const safeTotalWeight = totalWeight > 0 ? totalWeight : 100;
  
  const rawScore = (
    g.tugas * cfg.tugas +
    g.kuis * cfg.kuis +
    g.pretest * cfg.pretest +
    g.posttest * cfg.posttest +
    g.ujian * cfg.ujian
  ) / safeTotalWeight;

  const finalScore = Math.round(rawScore * 10) / 10;
  const isPassed = finalScore >= cfg.kkm;
  return { finalScore, isPassed };
};

// Data Awal Nilai Siswa
const INITIAL_GRADES: StudentGrade[] = [
  { studentId: 'std-001', tugas: 88, kuis: 85, pretest: 70, posttest: 90, ujian: 87, finalScore: 85.8, isPassed: true, notes: 'Sangat aktif pada simulasi faktor suhu.' },
  { studentId: 'std-002', tugas: 95, kuis: 92, pretest: 80, posttest: 96, ujian: 94, finalScore: 92.6, isPassed: true, notes: 'Penguasaan konsep dan analisis grafik prima.' },
  { studentId: 'std-003', tugas: 78, kuis: 72, pretest: 60, posttest: 75, ujian: 74, finalScore: 73.1, isPassed: false, notes: 'Perlu bimbingan lanjutan pada orde reaksi Bab 4.' },
  { studentId: 'std-004', tugas: 90, kuis: 88, pretest: 75, posttest: 92, ujian: 90, finalScore: 88.7, isPassed: true, notes: 'Mampu merancang diagram laju dengan baik.' },
  { studentId: 'std-005', tugas: 72, kuis: 70, pretest: 55, posttest: 74, ujian: 70, finalScore: 69.8, isPassed: false, notes: 'Perlu remedial konsep teori tumbukan.' },
  { studentId: 'std-006', tugas: 86, kuis: 84, pretest: 70, posttest: 88, ujian: 85, finalScore: 84.1, isPassed: true, notes: 'Pemahaman materi cukup stabil.' },
  { studentId: 'std-007', tugas: 82, kuis: 80, pretest: 65, posttest: 85, ujian: 84, finalScore: 81.3, isPassed: true, notes: 'Baik dalam praktikum lab virtual.' },
  { studentId: 'std-008', tugas: 92, kuis: 90, pretest: 78, posttest: 94, ujian: 92, finalScore: 90.6, isPassed: true, notes: 'Konsisten di atas KKM.' },
  { studentId: 'std-009', tugas: 75, kuis: 70, pretest: 60, posttest: 78, ujian: 76, finalScore: 73.5, isPassed: false, notes: 'Memerlukan latihan soal grafik laju.' },
  { studentId: 'std-010', tugas: 90, kuis: 94, pretest: 82, posttest: 95, ujian: 91, finalScore: 91.5, isPassed: true, notes: 'Kemampuan analisis matematis luar biasa.' },
  { studentId: 'std-011', tugas: 80, kuis: 76, pretest: 65, posttest: 82, ujian: 80, finalScore: 78.5, isPassed: true, notes: 'Tuntas pada seluruh indikator laju reaksi.' },
  { studentId: 'std-012', tugas: 85, kuis: 82, pretest: 72, posttest: 86, ujian: 88, finalScore: 84.9, isPassed: true, notes: 'Aktif bertanya dan diskusi.' },
];

// Data Awal Bank Soal Evaluasi (Termasuk 5 soal dari Chapter 6 + 3 soal pengayaan)
const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    order: 1,
    topicRef: 'bab1',
    topicName: 'Bab 1: Definisi Laju Reaksi',
    difficulty: 'Sedang',
    scoreWeight: 10,
    isPublished: true,
    question: 'Mengapa laju berkurangnya pereaksi A diberi tanda negatif dalam persamaan matematis v = -Δ[A]/Δt?',
    options: [
      { key: 'A', text: 'Karena nilai kelajuan reaksi selalu bernilai negatif di alam semesta.' },
      { key: 'B', text: 'Untuk mengompensasi nilai perubahan Δ[A] yang bernilai negatif sehingga nilai laju reaksi tetap positif.' },
      { key: 'C', text: 'Karena reaksi kimia berlangsung secara mundur ke arah reaktan.' },
      { key: 'D', text: 'Tanda minus menunjukkan reaksi melepaskan energi panas eksoterm.' },
      { key: 'E', text: 'Sebagai tanda bahwa konsentrasi reaktan bertambah secara bertahap seiring berjalannya waktu.' },
    ],
    correctKey: 'B',
    explanation: 'Karena [A] akhir lebih kecil dari [A] awal, maka selisih Δ[A] bernilai negatif. Tanda minus di depan rumus memastikan nilai laju reaksi (v) yang dihasilkan selalu bernilai positif.',
  },
  {
    id: 2,
    order: 2,
    topicRef: 'bab2',
    topicName: 'Bab 2: Teori Tumbukan',
    difficulty: 'Mudah',
    scoreWeight: 10,
    isPublished: true,
    question: 'Dua syarat fundamental apakah yang wajib dipenuhi secara serentak agar suatu tumbukan partikel dapat menghasilkan reaksi kimia (tumbukan efektif)?',
    options: [
      { key: 'A', text: 'Jumlah partikel berjumlah genap dan wadah bertekanan mutlak 1 atm.' },
      { key: 'B', text: 'Orientasi tumbukan yang tepat dan energi kinetik partikel sama atau melampaui energi aktivasi (E ≥ Ea).' },
      { key: 'C', text: 'Warna larutan yang kontras dan suhu sistem harus di atas 100°C.' },
      { key: 'D', text: 'Keberadaan medan magnet luar dan volume pelarut yang melimpah.' },
      { key: 'E', text: 'Semua partikel harus berbentuk bola sempurna dan bergerak dengan kecepatan identik.' },
    ],
    correctKey: 'B',
    explanation: 'Tumbukan efektif membutuhkan orientasi ruang yang sesuai agar ikatan baru dapat tersambung, serta energi kinetik minimum (Ea) untuk memutuskan ikatan kimia yang lama.',
  },
  {
    id: 3,
    order: 3,
    topicRef: 'bab3',
    topicName: 'Bab 3: Faktor Suhu',
    difficulty: 'Sedang',
    scoreWeight: 15,
    isPublished: true,
    question: 'Alasan ilmiah mendasar mengapa peningkatan suhu menaikkan laju reaksi secara signifikan adalah:',
    options: [
      { key: 'A', text: 'Menaikkan fraksi (persentase) partikel yang memiliki energi sama atau melampaui energi aktivasi (E ≥ Ea).' },
      { key: 'B', text: 'Menurunkan nilai energi aktivasi reaksi menjadi nol.' },
      { key: 'C', text: 'Mengubah reaksi eksoterm menjadi reaksi endoterm seketika.' },
      { key: 'D', text: 'Mengurangi frekuensi tumbukan antar partikel reaktan.' },
      { key: 'E', text: 'Membuat molekul reaktan terurai menjadi atom-atom bebas tanpa memerlukan energi.' },
    ],
    correctKey: 'A',
    explanation: 'Peningkatan suhu meningkatkan energi kinetik rata-rata molekul. Sesuai kurva distribusi Boltzmann, fraksi partikel dengan energi E ≥ Ea bertambah secara eksponensial.',
  },
  {
    id: 4,
    order: 4,
    topicRef: 'bab3',
    topicName: 'Bab 3: Peran Katalis',
    difficulty: 'Mudah',
    scoreWeight: 15,
    isPublished: true,
    question: 'Pernyataan manakah yang BENAR mengenai mekanisme kerja katalis dalam mempercepat laju sistem reaksi kimia?',
    options: [
      { key: 'A', text: 'Katalis menambah jumlah kalor reaksi (ΔH) sehingga energi total sistem menjadi berlipat ganda.' },
      { key: 'B', text: 'Katalis menyediakan rute mekanisme reaksi alternatif dengan energi aktivasi (Ea) yang lebih rendah.' },
      { key: 'C', text: 'Katalis habis terkonsumsi dan menjadi produk sampingan di akhir reaksi.' },
      { key: 'D', text: 'Katalis mengubah tetapan kesetimbangan ke arah pembentukan produk secara sepihak.' },
      { key: 'E', text: 'Katalis hanya bekerja pada fasa gas dan tidak berfungsi pada fasa cair atau padat.' },
    ],
    correctKey: 'B',
    explanation: 'Katalis mempermudah terbentuknya kompleks teraktivasi dengan energi aktivasi yang lebih rendah tanpa mengubah selisih entalpi (ΔH) reaktan dan produk.',
  },
  {
    id: 5,
    order: 5,
    topicRef: 'bab4',
    topicName: 'Bab 4: Orde Reaksi & Hukum Laju',
    difficulty: 'Sukar',
    scoreWeight: 20,
    isPublished: true,
    question: 'Jika suatu reaksi memiliki persamaan hukum laju v = k [X]², berapakah kelipatan laju reaksinya jika konsentrasi X diperbesar menjadi 3 kali semula?',
    options: [
      { key: 'A', text: 'Laju reaksi meningkat menjadi 3 kali semula.' },
      { key: 'B', text: 'Laju reaksi meningkat menjadi 6 kali semula.' },
      { key: 'C', text: 'Laju reaksi melonjak menjadi 9 kali semula (3² = 9).' },
      { key: 'D', text: 'Laju reaksi tidak berubah karena orde 2 independen terhadap konsentrasi.' },
      { key: 'E', text: 'Laju reaksi melambat sepertiga kali semula.' },
    ],
    correctKey: 'C',
    explanation: 'Pada reaksi orde 2 (pangkat 2), jika konsentrasi dilipatgandakan sebesar n kali, laju reaksinya akan meningkat sebesar n² kali. Maka untuk 3 kali lipat, laju naik 3² = 9 kali lipat.',
  },
  {
    id: 6,
    order: 6,
    topicRef: 'bab3',
    topicName: 'Bab 3: Luas Permukaan Sentuh',
    difficulty: 'Mudah',
    scoreWeight: 10,
    isPublished: true,
    question: 'Serbuk kalsium karbonat (CaCO₃) bereaksi lebih cepat dengan HCl dibanding bongkahan CaCO₃ dengan massa yang sama karena:',
    options: [
      { key: 'A', text: 'Serbuk memiliki energi aktivasi yang lebih rendah.' },
      { key: 'B', text: 'Serbuk memiliki luas permukaan bidang sentuh yang jauh lebih besar sehingga frekuensi tumbukan meningkat.' },
      { key: 'C', text: 'Serbuk menghasilkan kalor reaksi yang lebih besar.' },
      { key: 'D', text: 'Bongkahan CaCO₃ tidak larut dalam asam.' },
      { key: 'E', text: 'Serbuk bertindak sebagai katalis homogen.' },
    ],
    correctKey: 'B',
    explanation: 'Semakin halus ukuran partikel padatan, semakin luas bidang sentuh yang terpapar langsung terhadap partikel asam, sehingga peluang terjadinya tumbukan antar partikel meningkat drastis.',
  },
  {
    id: 7,
    order: 7,
    topicRef: 'bab4',
    topicName: 'Bab 4: Penentuan Orde dari Data Eksperimen',
    difficulty: 'Sukar',
    scoreWeight: 20,
    isPublished: false,
    question: 'Pada reaksi P + Q -> R, ketika [P] tetap dan [Q] dinaikkan 2 kali, laju tetap. Ketika [P] dinaikkan 2 kali dan [Q] tetap, laju naik 4 kali. Persamaan lajunya adalah:',
    options: [
      { key: 'A', text: 'v = k [P][Q]' },
      { key: 'B', text: 'v = k [P]²' },
      { key: 'C', text: 'v = k [Q]²' },
      { key: 'D', text: 'v = k [P]²[Q]' },
      { key: 'E', text: 'v = k [P][Q]²' },
    ],
    correctKey: 'B',
    explanation: 'Karena perubahan [Q] tidak mengubah laju, maka orde terhadap Q adalah 0. Karena 2^m = 4, maka orde terhadap P adalah 2. Persamaan laju adalah v = k [P]² [Q]⁰ = k [P]².',
  },
];

// Data Awal Submisi Hasil Evaluasi Siswa (Untuk Analisis Butir Soal & SPSS/Jamovi)
const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-001',
    studentId: 'std-001',
    studentName: 'Ahmad Faiz Pratama',
    kelas: 'XI MIPA 1',
    submittedAt: '2026-11-15 08:30',
    answers: { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'C', 6: 'B' },
    score: 100,
    correctCount: 6,
    incorrectCount: 0,
    totalQuestions: 6,
    dichotomyScores: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
    timeSpentSeconds: 420,
  },
  {
    id: 'sub-002',
    studentId: 'std-002',
    studentName: 'Annisa Rahmawati Putri',
    kelas: 'XI MIPA 1',
    submittedAt: '2026-11-15 08:35',
    answers: { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'C', 6: 'B' },
    score: 100,
    correctCount: 6,
    incorrectCount: 0,
    totalQuestions: 6,
    dichotomyScores: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
    timeSpentSeconds: 380,
  },
  {
    id: 'sub-003',
    studentId: 'std-003',
    studentName: 'Bagas Aditya Nugraha',
    kelas: 'XI MIPA 1',
    submittedAt: '2026-11-15 08:42',
    answers: { 1: 'B', 2: 'B', 3: 'B', 4: 'B', 5: 'A', 6: 'B' },
    score: 67,
    correctCount: 4,
    incorrectCount: 2,
    totalQuestions: 6,
    dichotomyScores: { 1: 1, 2: 1, 3: 0, 4: 1, 5: 0, 6: 1 },
    timeSpentSeconds: 510,
  },
  {
    id: 'sub-004',
    studentId: 'std-004',
    studentName: 'Clarissa Aurelia Dewani',
    kelas: 'XI MIPA 1',
    submittedAt: '2026-11-15 08:38',
    answers: { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'C', 6: 'B' },
    score: 100,
    correctCount: 6,
    incorrectCount: 0,
    totalQuestions: 6,
    dichotomyScores: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
    timeSpentSeconds: 440,
  },
  {
    id: 'sub-005',
    studentId: 'std-005',
    studentName: 'Dimas Satria Wibowo',
    kelas: 'XI MIPA 1',
    submittedAt: '2026-11-15 08:50',
    answers: { 1: 'A', 2: 'B', 3: 'A', 4: 'A', 5: 'B', 6: 'B' },
    score: 50,
    correctCount: 3,
    incorrectCount: 3,
    totalQuestions: 6,
    dichotomyScores: { 1: 0, 2: 1, 3: 1, 4: 0, 5: 0, 6: 1 },
    timeSpentSeconds: 600,
  },
  {
    id: 'sub-006',
    studentId: 'std-006',
    studentName: 'Fadhilah Nurul Izzah',
    kelas: 'XI MIPA 1',
    submittedAt: '2026-11-15 08:44',
    answers: { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'B', 6: 'B' },
    score: 83,
    correctCount: 5,
    incorrectCount: 1,
    totalQuestions: 6,
    dichotomyScores: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 0, 6: 1 },
    timeSpentSeconds: 480,
  },
  {
    id: 'sub-007',
    studentId: 'std-007',
    studentName: 'Gibran Rakabuming Arya',
    kelas: 'XI MIPA 2',
    submittedAt: '2026-11-16 10:15',
    answers: { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'C', 6: 'B' },
    score: 100,
    correctCount: 6,
    incorrectCount: 0,
    totalQuestions: 6,
    dichotomyScores: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
    timeSpentSeconds: 410,
  },
  {
    id: 'sub-008',
    studentId: 'std-008',
    studentName: 'Hana Safitri Maharani',
    kelas: 'XI MIPA 2',
    submittedAt: '2026-11-16 10:18',
    answers: { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'C', 6: 'B' },
    score: 100,
    correctCount: 6,
    incorrectCount: 0,
    totalQuestions: 6,
    dichotomyScores: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
    timeSpentSeconds: 395,
  },
  {
    id: 'sub-009',
    studentId: 'std-009',
    studentName: 'Irfan Maulana Yusuf',
    kelas: 'XI MIPA 2',
    submittedAt: '2026-11-16 10:25',
    answers: { 1: 'B', 2: 'A', 3: 'A', 4: 'B', 5: 'A', 6: 'B' },
    score: 67,
    correctCount: 4,
    incorrectCount: 2,
    totalQuestions: 6,
    dichotomyScores: { 1: 1, 2: 0, 3: 1, 4: 1, 5: 0, 6: 1 },
    timeSpentSeconds: 530,
  },
  {
    id: 'sub-010',
    studentId: 'std-010',
    studentName: 'Keisha Amanda Salsabila',
    kelas: 'XI MIPA 2',
    submittedAt: '2026-11-16 10:20',
    answers: { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'C', 6: 'B' },
    score: 100,
    correctCount: 6,
    incorrectCount: 0,
    totalQuestions: 6,
    dichotomyScores: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
    timeSpentSeconds: 370,
  },
];

// Data Awal Aktivitas Pembelajaran Guru
const INITIAL_ACTIVITIES: TeacherActivity[] = [
  {
    id: 'act-001',
    timestamp: '2026-11-16 10:30',
    title: 'Evaluasi Bab 6 Dikirimkan',
    description: 'Keisha Amanda Salsabila (XI MIPA 2) menyelesaikan evaluasi komprehensif dengan skor sempurna 100.',
    type: 'eval',
  },
  {
    id: 'act-002',
    timestamp: '2026-11-16 09:15',
    title: 'Pembaruan Bank Soal',
    description: 'Guru mempublikasikan butir soal nomor 6 (Luas Permukaan Sentuh) ke halaman siswa.',
    type: 'question',
  },
  {
    id: 'act-003',
    timestamp: '2026-11-15 14:00',
    title: 'Sinkronisasi Nilai Harian',
    description: 'Nilai tugas praktikum lab virtual kelas XI MIPA 1 berhasil disimpan ke sistem.',
    type: 'grade',
  },
  {
    id: 'act-004',
    timestamp: '2026-11-14 11:20',
    title: 'Pendaftaran Siswa Baru',
    description: 'Data 12 peserta didik kelas XI MIPA 1 & 2 telah tersinkronisasi dalam database.',
    type: 'student',
  },
];

// LocalStorage Keys
const KEYS = {
  STUDENTS: 'reaksilab_students_v1',
  GRADES: 'reaksilab_grades_v1',
  CONFIG: 'reaksilab_grading_config_v1',
  QUESTIONS: 'reaksilab_questions_v1',
  SUBMISSIONS: 'reaksilab_submissions_v1',
  ACTIVITIES: 'reaksilab_teacher_activities_v1',
};

// Safe JSON Parse helper
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

/**
 * Service Utama TeacherStorageService
 */
export const teacherStorageService = {
  // ================= 1. SISWA (STUDENTS) =================
  getStudents(): StudentItem[] {
    return safeGet<StudentItem[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  saveStudent(student: StudentItem): StudentItem[] {
    const students = this.getStudents();
    const existingIndex = students.findIndex((s) => s.id === student.id);
    let updated: StudentItem[];
    if (existingIndex >= 0) {
      updated = [...students];
      updated[existingIndex] = student;
    } else {
      updated = [student, ...students];
    }
    safeSet(KEYS.STUDENTS, updated);
    this.addActivity(
      existingIndex >= 0 ? 'Pembaruan Data Siswa' : 'Penambahan Siswa Baru',
      `${student.name} (${student.kelas}) berhasil disimpan.`,
      'student'
    );
    return updated;
  },

  deleteStudent(studentId: string): StudentItem[] {
    const students = this.getStudents();
    const target = students.find((s) => s.id === studentId);
    const updated = students.filter((s) => s.id !== studentId);
    safeSet(KEYS.STUDENTS, updated);

    // Hapus juga nilai terkait
    const grades = this.getGrades().filter((g) => g.studentId !== studentId);
    safeSet(KEYS.GRADES, grades);

    if (target) {
      this.addActivity('Penghapusan Siswa', `Data peserta didik ${target.name} (${target.kelas}) telah dihapus.`, 'student');
    }
    return updated;
  },

  importStudents(newStudents: StudentItem[]): StudentItem[] {
    const current = this.getStudents();
    const map = new Map<string, StudentItem>();
    current.forEach((s) => map.set(s.id, s));
    newStudents.forEach((s) => {
      // Gunakan ID atau NIS sebagai key
      const key = s.id || `std-${s.nis || Math.random().toString(36).substr(2, 6)}`;
      map.set(key, { ...s, id: key });
    });
    const updated = Array.from(map.values());
    safeSet(KEYS.STUDENTS, updated);
    this.addActivity('Impor Data Siswa', `Berhasil mengimpor ${newStudents.length} peserta didik ke dalam sistem.`, 'student');
    return updated;
  },

  // ================= 2. NILAI (GRADES) =================
  getGrades(): StudentGrade[] {
    return safeGet<StudentGrade[]>(KEYS.GRADES, INITIAL_GRADES);
  },

  getGradingConfig(): GradingWeightConfig {
    return safeGet<GradingWeightConfig>(KEYS.CONFIG, DEFAULT_GRADING_CONFIG);
  },

  saveGradingConfig(config: GradingWeightConfig): GradingWeightConfig {
    safeSet(KEYS.CONFIG, config);
    // Recalculate all grades based on new weights and KKM
    const grades = this.getGrades();
    const recalculated = grades.map((g) => {
      const { finalScore, isPassed } = calculateFinalScore(g, config);
      return { ...g, finalScore, isPassed };
    });
    safeSet(KEYS.GRADES, recalculated);
    this.addActivity(
      'Pembaruan Bobot & KKM',
      `Bobot nilai dan batas KKM (${config.kkm}) diperbarui. Seluruh nilai akhir peserta didik dihitung ulang secara otomatis.`,
      'grade'
    );
    return config;
  },

  saveGrade(grade: StudentGrade): StudentGrade[] {
    const config = this.getGradingConfig();
    const { finalScore, isPassed } = calculateFinalScore(grade, config);
    const completedGrade: StudentGrade = {
      ...grade,
      finalScore,
      isPassed,
      updatedAt: new Date().toISOString(),
    };

    const grades = this.getGrades();
    const idx = grades.findIndex((g) => g.studentId === grade.studentId);
    let updated: StudentGrade[];
    if (idx >= 0) {
      updated = [...grades];
      updated[idx] = completedGrade;
    } else {
      updated = [...grades, completedGrade];
    }
    safeSet(KEYS.GRADES, updated);

    const student = this.getStudents().find((s) => s.id === grade.studentId);
    this.addActivity(
      'Penyimpanan Nilai',
      `Nilai untuk ${student?.name || grade.studentId} diperbarui: Nilai Akhir ${finalScore} (${isPassed ? 'TUNTAS' : 'BELUM TUNTAS'}).`,
      'grade'
    );
    return updated;
  },

  bulkSaveGrades(newGrades: StudentGrade[]): StudentGrade[] {
    const config = this.getGradingConfig();
    const map = new Map<string, StudentGrade>();
    this.getGrades().forEach((g) => map.set(g.studentId, g));
    newGrades.forEach((g) => {
      const { finalScore, isPassed } = calculateFinalScore(g, config);
      map.set(g.studentId, { ...g, finalScore, isPassed, updatedAt: new Date().toISOString() });
    });
    const updated = Array.from(map.values());
    safeSet(KEYS.GRADES, updated);
    this.addActivity('Penyimpanan Nilai Massal', `Berhasil memperbarui nilai untuk ${newGrades.length} peserta didik.`, 'grade');
    return updated;
  },

  // ================= 3. SOAL EVALUASI (QUESTIONS) =================
  getQuestions(): QuestionItem[] {
    return safeGet<QuestionItem[]>(KEYS.QUESTIONS, INITIAL_QUESTIONS);
  },

  getPublishedQuestions(): QuestionItem[] {
    const all = this.getQuestions();
    return all.filter((q) => q.isPublished).sort((a, b) => a.order - b.order);
  },

  saveQuestion(question: QuestionItem): QuestionItem[] {
    const questions = this.getQuestions();
    const existingIndex = questions.findIndex((q) => q.id === question.id);
    let updated: QuestionItem[];
    if (existingIndex >= 0) {
      updated = [...questions];
      updated[existingIndex] = question;
    } else {
      const maxId = questions.reduce((max, q) => Math.max(max, q.id), 0);
      const newQuestion = { ...question, id: maxId + 1 };
      updated = [...questions, newQuestion];
    }
    // Urutkan berdasarkan urutan (order)
    updated.sort((a, b) => a.order - b.order);
    safeSet(KEYS.QUESTIONS, updated);
    this.addActivity(
      existingIndex >= 0 ? 'Pembaruan Butir Soal' : 'Penambahan Soal Baru',
      `Soal #${question.id} (${question.topicName}) ${question.isPublished ? 'dipublikasikan ke siswa' : 'disimpan sebagai draft'}.`,
      'question'
    );
    return updated;
  },

  deleteQuestion(questionId: number): QuestionItem[] {
    const questions = this.getQuestions();
    const updated = questions.filter((q) => q.id !== questionId);
    safeSet(KEYS.QUESTIONS, updated);
    this.addActivity('Penghapusan Soal', `Butir soal #${questionId} berhasil dihapus dari bank evaluasi.`, 'question');
    return updated;
  },

  togglePublishQuestion(questionId: number): QuestionItem[] {
    const questions = this.getQuestions();
    const updated = questions.map((q) => {
      if (q.id === questionId) {
        return { ...q, isPublished: !q.isPublished };
      }
      return q;
    });
    safeSet(KEYS.QUESTIONS, updated);
    const target = updated.find((q) => q.id === questionId);
    if (target) {
      this.addActivity(
        'Perubahan Status Soal',
        `Soal #${questionId} sekarang berstatus: ${target.isPublished ? 'PUBLIK (Aktif di Halaman Siswa)' : 'DRAFT (Tersembunyi)'}.`,
        'question'
      );
    }
    return updated;
  },

  // ================= 4. HASIL SUBMISI EVALUASI (EVALUATION SUBMISSIONS) =================
  getSubmissions(): StudentSubmission[] {
    return safeGet<StudentSubmission[]>(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  },

  recordSubmission(data: {
    studentId?: string;
    studentName: string;
    kelas: string;
    answers: Record<number, string>;
    publishedQuestions: QuestionItem[];
    timeSpentSeconds?: number;
  }): StudentSubmission {
    let correctCount = 0;
    const dichotomyScores: Record<number, number> = {};

    data.publishedQuestions.forEach((q) => {
      const isCorrect = data.answers[q.id] === q.correctKey;
      if (isCorrect) correctCount++;
      dichotomyScores[q.id] = isCorrect ? 1 : 0;
    });

    const totalQuestions = data.publishedQuestions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const incorrectCount = totalQuestions - correctCount;

    const newSubmission: StudentSubmission = {
      id: `sub-${Date.now().toString(36)}`,
      studentId: data.studentId || `std-gen-${Math.random().toString(36).substr(2, 5)}`,
      studentName: data.studentName,
      kelas: data.kelas,
      submittedAt: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
      answers: data.answers,
      score,
      correctCount,
      incorrectCount,
      totalQuestions,
      dichotomyScores,
      timeSpentSeconds: data.timeSpentSeconds,
    };

    const currentSubmissions = this.getSubmissions();
    const updated = [newSubmission, ...currentSubmissions];
    safeSet(KEYS.SUBMISSIONS, updated);

    // Sinkronkan ke nilai kuis/posttest siswa jika studentId cocok
    if (data.studentId) {
      const grades = this.getGrades();
      const existingGrade = grades.find((g) => g.studentId === data.studentId);
      if (existingGrade) {
        this.saveGrade({
          ...existingGrade,
          posttest: score,
          notes: `Posttest Bab 6: ${score}/100 (${correctCount}/${totalQuestions} benar)`,
        });
      }
    }

    this.addActivity(
      'Submisi Evaluasi Baru',
      `${data.studentName} (${data.kelas}) mengumpulkan evaluasi Bab 6 dengan skor ${score}/100.`,
      'eval'
    );

    return newSubmission;
  },

  // ================= 5. AKTIVITAS GURU (TEACHER ACTIVITIES) =================
  getActivities(): TeacherActivity[] {
    return safeGet<TeacherActivity[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },

  addActivity(title: string, description: string, type: TeacherActivity['type']): TeacherActivity {
    const newAct: TeacherActivity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
      title,
      description,
      type,
    };
    const current = this.getActivities();
    const updated = [newAct, ...current.slice(0, 49)]; // Batasi 50 riwayat aktivitas
    safeSet(KEYS.ACTIVITIES, updated);
    return newAct;
  },

  // ================= 6. RESET DATA KE DEFAULT =================
  resetToDefault(): void {
    safeSet(KEYS.STUDENTS, INITIAL_STUDENTS);
    safeSet(KEYS.GRADES, INITIAL_GRADES);
    safeSet(KEYS.CONFIG, DEFAULT_GRADING_CONFIG);
    safeSet(KEYS.QUESTIONS, INITIAL_QUESTIONS);
    safeSet(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    safeSet(KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },
};
