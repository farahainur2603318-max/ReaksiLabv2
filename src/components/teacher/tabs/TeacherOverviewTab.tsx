/**
 * components/teacher/tabs/TeacherOverviewTab.tsx
 * Tab 1: Ringkasan Dashboard Guru (Overview)
 * Menyajikan statistik utama, grafik distribusi ketuntasan, aktivitas terbaru, dan aksi cepat.
 */
import React from 'react';
import type { StudentItem, StudentGrade, QuestionItem, StudentSubmission, TeacherActivity, GradingWeightConfig } from '../../../types';

interface TeacherOverviewTabProps {
  students: StudentItem[];
  grades: StudentGrade[];
  questions: QuestionItem[];
  submissions: StudentSubmission[];
  activities: TeacherActivity[];
  config: GradingWeightConfig;
  onNavigateTab: (tabId: string) => void;
}

export const TeacherOverviewTab: React.FC<TeacherOverviewTabProps> = ({
  students,
  grades,
  questions,
  submissions,
  activities,
  config,
  onNavigateTab,
}) => {
  // Hitung jumlah kelas unik
  const uniqueClasses = Array.from(new Set(students.map((s) => s.kelas))).filter(Boolean);

  // Hitung rata-rata nilai akhir
  const allFinalScores = grades.map((g) => g.finalScore);
  const avgScore =
    allFinalScores.length > 0
      ? Math.round((allFinalScores.reduce((acc, val) => acc + val, 0) / allFinalScores.length) * 10) / 10
      : 0;

  // Hitung ketuntasan
  const passedStudents = grades.filter((g) => g.isPassed).length;
  const passRate = grades.length > 0 ? Math.round((passedStudents / grades.length) * 100) : 0;

  // Hitung soal aktif / total
  const publishedQuestions = questions.filter((q) => q.isPublished).length;

  return (
    <div className="teacher-tab-content animate-fade-in">
      {/* Banner Selamat Datang */}
      <div className="teacher-welcome-banner">
        <div className="banner-text">
          <span className="banner-tag">PANEL GURU REAKSILAB XI</span>
          <h2 className="banner-title">Pusat Kendali Pembelajaran & Evaluasi Kimia</h2>
          <p className="banner-desc">
            Kelola data peserta didik kelas XI, atur bobot penilaian KKTP/KKM, perbarui butir soal evaluasi laju reaksi secara dinamis, dan unduh data siap olah SPSS/Jamovi.
          </p>
        </div>
        <div className="banner-quick-actions">
          <button
            type="button"
            className="btn-banner-action primary"
            onClick={() => onNavigateTab('grades')}
          >
            ✏️ Input Nilai Siswa
          </button>
          <button
            type="button"
            className="btn-banner-action secondary"
            onClick={() => onNavigateTab('questions')}
          >
            ➕ Tambah Soal Baru
          </button>
          <button
            type="button"
            className="btn-banner-action tertiary"
            onClick={() => onNavigateTab('export')}
          >
            📥 Ekspor Data (Excel/SPSS)
          </button>
        </div>
      </div>

      {/* Grid 4 Kartu Metrik Utama */}
      <div className="teacher-metric-grid">
        <div className="metric-card card-blue" onClick={() => onNavigateTab('students')} role="button" tabIndex={0}>
          <div className="metric-icon-wrap">👥</div>
          <div className="metric-body">
            <span className="metric-label">Total Peserta Didik</span>
            <div className="metric-value-row">
              <span className="metric-number">{students.length}</span>
              <span className="metric-unit">Siswa</span>
            </div>
            <span className="metric-hint">Terbagi dalam {uniqueClasses.length} rombel kelas XI</span>
          </div>
        </div>

        <div className="metric-card card-cyan" onClick={() => onNavigateTab('grades')} role="button" tabIndex={0}>
          <div className="metric-icon-wrap">📊</div>
          <div className="metric-body">
            <span className="metric-label">Rata-Rata Nilai Akhir</span>
            <div className="metric-value-row">
              <span className="metric-number">{avgScore}</span>
              <span className="metric-unit">/ 100</span>
            </div>
            <span className="metric-hint">Target KKTP: {config.kkm} (Bobot 5 Komponen)</span>
          </div>
        </div>

        <div className="metric-card card-green" onClick={() => onNavigateTab('grades')} role="button" tabIndex={0}>
          <div className="metric-icon-wrap">🎯</div>
          <div className="metric-body">
            <span className="metric-label">Ketuntasan Klasikal</span>
            <div className="metric-value-row">
              <span className="metric-number">{passRate}%</span>
              <span className="metric-unit">Tuntas</span>
            </div>
            <span className="metric-hint">{passedStudents} dari {grades.length} siswa telah melampaui KKM</span>
          </div>
        </div>

        <div className="metric-card card-purple" onClick={() => onNavigateTab('questions')} role="button" tabIndex={0}>
          <div className="metric-icon-wrap">📝</div>
          <div className="metric-body">
            <span className="metric-label">Bank Soal Evaluasi</span>
            <div className="metric-value-row">
              <span className="metric-number">{publishedQuestions}</span>
              <span className="metric-unit">Aktif ({questions.length} Total)</span>
            </div>
            <span className="metric-hint">{submissions.length} submisi LKPD Bab 6 terekam otomatis</span>
          </div>
        </div>
      </div>

      {/* Baris Dua Kolom: Rangkuman Kelas & Aktivitas Terbaru */}
      <div className="teacher-overview-columns">
        {/* Kolom Kiri: Rangkuman per Kelas & Status Penilaian */}
        <div className="overview-col-card">
          <div className="col-card-header">
            <div>
              <h3 className="col-card-title">🏫 Rangkuman Capaian per Kelas</h3>
              <p className="col-card-sub">Statistik rata-rata nilai dan persentase ketuntasan per rombongan belajar</p>
            </div>
            <button
              type="button"
              className="btn-card-more"
              onClick={() => onNavigateTab('grades')}
            >
              Kelola Nilai →
            </button>
          </div>

          <div className="class-summary-list">
            {uniqueClasses.map((cls) => {
              const classStudents = students.filter((s) => s.kelas === cls);
              const classStudentIds = new Set(classStudents.map((s) => s.id));
              const classGrades = grades.filter((g) => classStudentIds.has(g.studentId));
              const classAvg =
                classGrades.length > 0
                  ? Math.round((classGrades.reduce((a, b) => a + b.finalScore, 0) / classGrades.length) * 10) / 10
                  : 0;
              const classPassed = classGrades.filter((g) => g.isPassed).length;
              const classPassPercent = classGrades.length > 0 ? Math.round((classPassed / classGrades.length) * 100) : 0;

              return (
                <div key={cls} className="class-summary-item">
                  <div className="class-item-top">
                    <span className="class-name-badge">{cls}</span>
                    <span className="class-student-count">{classStudents.length} Peserta Didik</span>
                  </div>

                  <div className="class-progress-bar-wrap">
                    <div className="class-progress-info">
                      <span>Ketuntasan Klasikal</span>
                      <strong>{classPassPercent}% ({classPassed}/{classGrades.length} Siswa)</strong>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${classPassPercent}%`,
                          backgroundColor: classPassPercent >= 75 ? '#10b981' : '#f59e0b',
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="class-score-footer">
                    <div className="footer-metric">
                      <span className="f-label">Rata-rata Kelas:</span>
                      <strong className="f-val">{classAvg}</strong>
                    </div>
                    <div className="footer-metric">
                      <span className="f-label">Target KKM:</span>
                      <span className="f-val">{config.kkm}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kolom Kanan: Log Aktivitas Pembelajaran Terbaru */}
        <div className="overview-col-card">
          <div className="col-card-header">
            <div>
              <h3 className="col-card-title">⏱️ Aktivitas Pembelajaran Terbaru</h3>
              <p className="col-card-sub">Riwayat pengerjaan siswa, pembaruan soal, dan nilai</p>
            </div>
            <button
              type="button"
              className="btn-card-more"
              onClick={() => onNavigateTab('evaluation')}
            >
              Lihat Submisi →
            </button>
          </div>

          <div className="activity-stream-list">
            {activities.slice(0, 6).map((act) => {
              let badgeColor = 'bg-blue';
              let icon = '📌';
              if (act.type === 'eval') {
                badgeColor = 'bg-green';
                icon = '📝';
              } else if (act.type === 'grade') {
                badgeColor = 'bg-amber';
                icon = '💯';
              } else if (act.type === 'question') {
                badgeColor = 'bg-purple';
                icon = '🧪';
              } else if (act.type === 'student') {
                badgeColor = 'bg-cyan';
                icon = '👤';
              }

              return (
                <div key={act.id} className="activity-stream-item">
                  <div className={`act-icon-bubble ${badgeColor}`}>{icon}</div>
                  <div className="act-details">
                    <div className="act-head">
                      <strong className="act-title">{act.title}</strong>
                      <span className="act-time">{act.timestamp}</span>
                    </div>
                    <p className="act-desc">{act.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
