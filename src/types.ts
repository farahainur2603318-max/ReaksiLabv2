/**
 * types.ts
 * Definisi tipe data untuk aplikasi ReaksiLab XI.
 * Mendukung navigasi terpisah untuk Beranda dan seluruh 6 Bab Pembelajaran.
 */

// Tipe tampilan halaman (Auth/Login Gerbang Awal, Beranda, Peta 6 Modul, Lab Virtual, 6 Bab Pembelajaran, dan Panel Guru)
export type ViewMode = 'auth' | 'home' | 'roadmap' | 'virtuallab' | 'bab1' | 'bab2' | 'bab3' | 'bab4' | 'bab5' | 'bab6' | 'teacherdashboard';

// Tipe profil pengguna (Siswa, Guru, atau Mode Tamu)
export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  role: 'siswa' | 'guru' | 'tamu';
  avatar?: string;
  photoURL?: string;
  isLoggedIn: boolean;
  loginMethod?: 'google' | 'email' | 'guest';
}

// Tipe data untuk sub-bagian belajar di dalam Modul
export interface LearningSection {
  id: string;
  code: string; // Contoh: '1.1', '2.2', dst.
  title: string;
  subtitle: string;
  category: 'Fenomena' | 'Konsep & Rumus' | 'Analisis Grafik' | 'Eksperimen' | 'Simulasi Partikel' | 'Proyek STEM';
  summary: string;
  keyPoints: string[];
  scientificNote: string;
}

// Tipe data untuk Kartu Modul Pembelajaran
export interface ModuleItem {
  id: number;
  viewKey: ViewMode;
  chapter: string; // 'Bab 1', 'Bab 2', dst.
  chapterNumber: string; // '01', '02', dst.
  title: string;
  subtitle: string;
  description: string;
  isAvailable: boolean; // Seluruh 6 bab berstatus true (open access)
  badgeText: string;
  topicTag: string;
  sectionsCount: number;
  icon: string;
  accentColor?: string;
  phaseLabel?: string; // Tahapan belajar, e.g. 'Tahap 1: Pondasi Konsep'
  activities?: string[]; // Daftar 3-4 aktivitas belajar spesifik
}

// ================= TIPE DATA PANEL GURU (TEACHER DASHBOARD) =================

// Data Peserta Didik
export interface StudentItem {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  kelas: string; // e.g. 'XI MIPA 1', 'XI MIPA 2'
  gender?: 'L' | 'P';
  email?: string;
  phone?: string;
  createdAt?: string;
}

// Konfigurasi Bobot Penilaian dan KKM / KKTP
export interface GradingWeightConfig {
  tugas: number; // e.g. 20 (%)
  kuis: number; // e.g. 15 (%)
  pretest: number; // e.g. 10 (%)
  posttest: number; // e.g. 25 (%)
  ujian: number; // e.g. 30 (%)
  kkm: number; // e.g. 75
}

// Data Nilai Peserta Didik
export interface StudentGrade {
  studentId: string;
  tugas: number;
  kuis: number;
  pretest: number;
  posttest: number;
  ujian: number;
  finalScore: number;
  isPassed: boolean;
  notes?: string;
  updatedAt?: string;
}

// Pilihan Jawaban Soal
export interface QuestionOption {
  key: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  text: string;
}

// Butir Soal Evaluasi
export interface QuestionItem {
  id: number;
  order: number;
  question: string;
  options: QuestionOption[];
  correctKey: string;
  explanation: string;
  topicRef: 'bab1' | 'bab2' | 'bab3' | 'bab4' | 'bab5' | 'bab6' | 'umum';
  topicName: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sukar';
  scoreWeight: number; // e.g. 10 atau 20 poin
  imageUrl?: string;
  isPublished: boolean;
}

// Hasil Pengerjaan / Submit Evaluasi Siswa
export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  kelas: string;
  submittedAt: string;
  answers: Record<number, string>; // { [questionId]: 'A' | 'B' | 'C' ... }
  score: number; // Skala 0 - 100
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  dichotomyScores: Record<number, number>; // { [questionId]: 1 (benar) atau 0 (salah) }
  timeSpentSeconds?: number;
}

// Log Aktivitas Guru
export interface TeacherActivity {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'student' | 'grade' | 'question' | 'eval' | 'system';
}
