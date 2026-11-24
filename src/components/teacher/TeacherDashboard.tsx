/**
 * components/teacher/TeacherDashboard.tsx
 * Komponen Utama Panel Guru (Teacher Dashboard) ReaksiLab XI.
 * Menyediakan sidebar responsif, header dengan breadcrumb dan profil guru,
 * kontrol hak akses (RBAC), serta mengoordinasikan 6 sub-modul utama:
 * 1. Dashboard (Overview)
 * 2. Data Peserta Didik (Student Management)
 * 3. Input & Manajemen Nilai (Grade Management)
 * 4. Manajemen Bank Soal (Question Bank CRUD)
 * 5. Hasil Evaluasi & Analisis Butir Soal (Item Analysis)
 * 6. Ekspor & Impor Data (Excel, CSV, SPSS/Jamovi, PDF)
 */
import React, { useState } from 'react';
import type { UserProfile, StudentItem, StudentGrade, QuestionItem, GradingWeightConfig } from '../../types';
import { teacherStorageService } from '../../services/teacherStorageService';
import { TeacherOverviewTab } from './tabs/TeacherOverviewTab';
import { StudentManagerTab } from './tabs/StudentManagerTab';
import { GradeManagerTab } from './tabs/GradeManagerTab';
import { QuestionManagerTab } from './tabs/QuestionManagerTab';
import { EvaluationResultsTab } from './tabs/EvaluationResultsTab';
import { DataExportImportTab } from './tabs/DataExportImportTab';

interface TeacherDashboardProps {
  currentUser: UserProfile | null;
  onBackToHome: () => void;
  onSwitchToTeacherRole: () => void;
}

type TabType = 'overview' | 'students' | 'grades' | 'questions' | 'evaluation' | 'export';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  onBackToHome,
  onSwitchToTeacherRole,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data State dari teacherStorageService
  const [students, setStudents] = useState<StudentItem[]>(() => teacherStorageService.getStudents());
  const [grades, setGrades] = useState<StudentGrade[]>(() => teacherStorageService.getGrades());
  const [config, setConfig] = useState<GradingWeightConfig>(() => teacherStorageService.getGradingConfig());
  const [questions, setQuestions] = useState<QuestionItem[]>(() => teacherStorageService.getQuestions());
  const [submissions, setSubmissions] = useState(() => teacherStorageService.getSubmissions());
  const [activities, setActivities] = useState(() => teacherStorageService.getActivities());

  // Sinkronisasi data ulang jika dipanggil
  const refreshData = () => {
    setStudents(teacherStorageService.getStudents());
    setGrades(teacherStorageService.getGrades());
    setConfig(teacherStorageService.getGradingConfig());
    setQuestions(teacherStorageService.getQuestions());
    setSubmissions(teacherStorageService.getSubmissions());
    setActivities(teacherStorageService.getActivities());
  };

  // Handlers untuk Siswa
  const handleSaveStudent = (student: StudentItem) => {
    const updated = teacherStorageService.saveStudent(student);
    setStudents(updated);
    refreshData();
  };

  const handleDeleteStudent = (studentId: string) => {
    const updated = teacherStorageService.deleteStudent(studentId);
    setStudents(updated);
    refreshData();
  };

  const handleImportStudents = (newStudents: StudentItem[]) => {
    const updated = teacherStorageService.importStudents(newStudents);
    setStudents(updated);
    refreshData();
  };

  // Handlers untuk Nilai
  const handleSaveGrade = (grade: StudentGrade) => {
    const updated = teacherStorageService.saveGrade(grade);
    setGrades(updated);
    refreshData();
  };

  const handleBulkSaveGrades = (newGrades: StudentGrade[]) => {
    const updated = teacherStorageService.bulkSaveGrades(newGrades);
    setGrades(updated);
    refreshData();
  };

  const handleSaveConfig = (newConfig: GradingWeightConfig) => {
    const updated = teacherStorageService.saveGradingConfig(newConfig);
    setConfig(updated);
    refreshData();
  };

  // Handlers untuk Soal
  const handleSaveQuestion = (question: QuestionItem) => {
    const updated = teacherStorageService.saveQuestion(question);
    setQuestions(updated);
    refreshData();
  };

  const handleDeleteQuestion = (questionId: number) => {
    const updated = teacherStorageService.deleteQuestion(questionId);
    setQuestions(updated);
    refreshData();
  };

  const handleTogglePublish = (questionId: number) => {
    const updated = teacherStorageService.togglePublishQuestion(questionId);
    setQuestions(updated);
    refreshData();
  };

  // Reset Data Demo
  const handleResetDemoData = () => {
    if (window.confirm('Kembalikan seluruh data siswa, nilai, bank soal, dan hasil evaluasi ke setelan awal pabrik (demo data)?')) {
      teacherStorageService.resetToDefault();
      refreshData();
    }
  };

  // ================= ROLE-BASED ACCESS CONTROL (RBAC) GATE =================
  const isTeacher = currentUser?.role === 'guru';

  if (!isTeacher) {
    return (
      <div className="teacher-access-gate-container animate-fade-in">
        <div className="gate-card">
          <div className="gate-icon-bubble">👨‍🏫</div>
          <span className="gate-badge">HAK AKSES KHUSUS GURU</span>
          <h2 className="gate-title">Panel Guru ReaksiLab XI</h2>
          <p className="gate-desc">
            Halaman ini merupakan pusat manajemen terpadu bagi Guru Mata Pelajaran Kimia untuk mengelola data peserta didik, penilaian berkala, kurasi bank soal LKPD Bab 6, analisis butir soal psikometrik, dan ekspor data ke SPSS/Jamovi.
          </p>

          <div className="gate-status-box">
            <span>Status Akun Anda Saat Ini:</span>
            <strong>
              {currentUser ? `${currentUser.name} (Role: ${currentUser.role.toUpperCase()})` : 'Penjelajah Tamu (Belum Masuk)'}
            </strong>
          </div>

          <div className="gate-actions-row">
            <button
              type="button"
              className="btn-gate-switch"
              onClick={onSwitchToTeacherRole}
            >
              🚀 Masuk / Beralih ke Akun Guru Pengampu
            </button>
            <button
              type="button"
              className="btn-gate-back"
              onClick={onBackToHome}
            >
              ← Kembali ke Beranda Siswa
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Label Tab Aktif untuk Breadcrumb
  const tabTitles: Record<TabType, string> = {
    overview: 'Ringkasan Dashboard',
    students: 'Data Peserta Didik',
    grades: 'Input & Manajemen Nilai',
    questions: 'Manajemen Bank Soal',
    evaluation: 'Hasil Evaluasi & Analisis',
    export: 'Ekspor & Impor Data',
  };

  return (
    <div className="teacher-dashboard-layout">
      {/* SIDEBAR NAVIGASI PANEL GURU */}
      <aside className={`teacher-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-block">
          <div className="sidebar-brand-top">
            <span className="sidebar-logo">⚗️</span>
            <div>
              <h3 className="sidebar-title">ReaksiLab<span className="xi-tag">XI</span></h3>
              <span className="sidebar-role-badge">PANEL GURU</span>
            </div>
          </div>
          <p className="sidebar-sub">Sistem Manajemen Evaluasi & Laboratorium Kimia</p>
        </div>

        {/* Menu Navigasi Sidebar */}
        <nav className="sidebar-nav-menu" role="navigation">
          <button
            type="button"
            className={`nav-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('overview');
              setIsMobileSidebarOpen(false);
            }}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Ringkasan Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-menu-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('students');
              setIsMobileSidebarOpen(false);
            }}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Data Peserta Didik</span>
            <span className="nav-count-badge">{students.length}</span>
          </button>

          <button
            type="button"
            className={`nav-menu-item ${activeTab === 'grades' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('grades');
              setIsMobileSidebarOpen(false);
            }}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-text">Input & Rekap Nilai</span>
          </button>

          <button
            type="button"
            className={`nav-menu-item ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('questions');
              setIsMobileSidebarOpen(false);
            }}
          >
            <span className="nav-icon">❓</span>
            <span className="nav-text">Manajemen Bank Soal</span>
            <span className="nav-count-badge purple">{questions.filter((q) => q.isPublished).length}</span>
          </button>

          <button
            type="button"
            className={`nav-menu-item ${activeTab === 'evaluation' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('evaluation');
              setIsMobileSidebarOpen(false);
            }}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-text">Hasil Evaluasi & Butir Soal</span>
          </button>

          <button
            type="button"
            className={`nav-menu-item ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('export');
              setIsMobileSidebarOpen(false);
            }}
          >
            <span className="nav-icon">💾</span>
            <span className="nav-text">Ekspor & Impor Data</span>
          </button>
        </nav>

        {/* Footer Sidebar: Profil Guru & Reset */}
        <div className="sidebar-footer">
          <div className="teacher-profile-card">
            <span className="teacher-avatar">👩‍🏫</span>
            <div className="teacher-info">
              <strong className="teacher-name">{currentUser?.name || 'Guru Kimia'}</strong>
              <span className="teacher-email">{currentUser?.email || 'guru@reaksilab.id'}</span>
            </div>
          </div>

          <div className="sidebar-action-buttons">
            <button
              type="button"
              className="btn-sidebar-reset"
              onClick={handleResetDemoData}
              title="Kembalikan data ke setelan demo awal"
            >
              🔄 Reset Data Demo
            </button>
            <button
              type="button"
              className="btn-sidebar-home"
              onClick={onBackToHome}
              title="Kembali ke Beranda Belajar Siswa"
            >
              ← Kembali ke Beranda
            </button>
          </div>
        </div>
      </aside>

      {/* OVERLAY UNTUK MOBILE */}
      {isMobileSidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* KONTEN UTAMA DASHBOARD */}
      <div className="teacher-main-wrapper">
        {/* Top Navbar Panel Guru */}
        <header className="teacher-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="btn-mobile-menu-toggle"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              aria-label="Buka Menu Sidebar"
            >
              ☰
            </button>
            <div className="teacher-breadcrumbs">
              <span className="crumb-root">ReaksiLab XI</span>
              <span className="crumb-separator">/</span>
              <span className="crumb-parent">Panel Guru</span>
              <span className="crumb-separator">/</span>
              <strong className="crumb-active">{tabTitles[activeTab]}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="kkm-pill-nav">
              <span>KKM Aktif:</span>
              <strong>{config.kkm}</strong>
            </div>
            <button
              type="button"
              className="btn-topbar-return"
              onClick={onBackToHome}
            >
              🏠 Halaman Siswa
            </button>
          </div>
        </header>

        {/* Render Tab Konten Aktif */}
        <div className="teacher-content-container">
          {activeTab === 'overview' && (
            <TeacherOverviewTab
              students={students}
              grades={grades}
              questions={questions}
              submissions={submissions}
              activities={activities}
              config={config}
              onNavigateTab={(tab) => setActiveTab(tab as TabType)}
            />
          )}

          {activeTab === 'students' && (
            <StudentManagerTab
              students={students}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'grades' && (
            <GradeManagerTab
              students={students}
              grades={grades}
              config={config}
              onSaveGrade={handleSaveGrade}
              onBulkSaveGrades={handleBulkSaveGrades}
              onSaveConfig={handleSaveConfig}
            />
          )}

          {activeTab === 'questions' && (
            <QuestionManagerTab
              questions={questions}
              onSaveQuestion={handleSaveQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onTogglePublish={handleTogglePublish}
            />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationResultsTab
              submissions={submissions}
              questions={questions}
              config={config}
            />
          )}

          {activeTab === 'export' && (
            <DataExportImportTab
              students={students}
              grades={grades}
              submissions={submissions}
              questions={questions}
              config={config}
              onImportStudents={handleImportStudents}
              onBulkSaveGrades={handleBulkSaveGrades}
            />
          )}
        </div>
      </div>
    </div>
  );
};
