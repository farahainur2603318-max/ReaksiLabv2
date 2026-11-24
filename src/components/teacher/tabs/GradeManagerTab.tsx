/**
 * components/teacher/tabs/GradeManagerTab.tsx
 * Tab 3: Input dan Manajemen Nilai (Grade Management)
 * Input & Edit Nilai Manual (Tugas, Kuis, Pretest, Posttest, Ujian),
 * Perhitungan Otomatis Nilai Akhir & Rata-rata, Pengaturan Bobot & KKM/KKTP,
 * Status Ketuntasan Realtime, dan Penyimpanan Persisten.
 */
import React, { useState, useMemo } from 'react';
import type { StudentItem, StudentGrade, GradingWeightConfig } from '../../../types';
import { calculateFinalScore } from '../../../services/teacherStorageService';

interface GradeManagerTabProps {
  students: StudentItem[];
  grades: StudentGrade[];
  config: GradingWeightConfig;
  onSaveGrade: (grade: StudentGrade) => void;
  onBulkSaveGrades: (grades: StudentGrade[]) => void;
  onSaveConfig: (config: GradingWeightConfig) => void;
}

export const GradeManagerTab: React.FC<GradeManagerTabProps> = ({
  students,
  grades,
  config,
  onSaveGrade,
  onBulkSaveGrades,
  onSaveConfig,
}) => {
  // Filter Kelas & Pencarian
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Local Editable Grades State (untuk edit langsung di tabel atau modal)
  const [localGrades, setLocalGrades] = useState<Record<string, StudentGrade>>(() => {
    const map: Record<string, StudentGrade> = {};
    grades.forEach((g) => {
      map[g.studentId] = { ...g };
    });
    // Pastikan semua siswa punya entri grade
    students.forEach((s) => {
      if (!map[s.id]) {
        map[s.id] = {
          studentId: s.id,
          tugas: 75,
          kuis: 75,
          pretest: 70,
          posttest: 75,
          ujian: 75,
          finalScore: 74.5,
          isPassed: false,
          notes: '',
        };
      }
    });
    return map;
  });

  // State Feedback Notifikasi
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State Modal Pengaturan Bobot & KKM
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<GradingWeightConfig>({ ...config });

  // State Modal Edit Tunggal Siswa
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [modalGradeData, setModalGradeData] = useState<{
    tugas: number;
    kuis: number;
    pretest: number;
    posttest: number;
    ujian: number;
    notes: string;
  }>({ tugas: 0, kuis: 0, pretest: 0, posttest: 0, ujian: 0, notes: '' });

  // Daftar Kelas Unik
  const classList = useMemo(() => {
    const set = new Set(students.map((s) => s.kelas).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [students]);

  // Siswa Terfilter
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClass === 'all' || s.kelas === selectedClass;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.nis.toLowerCase().includes(query) ||
        s.kelas.toLowerCase().includes(query);
      return matchClass && matchQuery;
    });
  }, [students, selectedClass, searchQuery]);

  // Statistik Cepat Halaman Nilai
  const stats = useMemo(() => {
    const targetGrades = filteredStudents.map((s) => {
      const g = localGrades[s.id];
      return g ? g.finalScore : 0;
    });
    const avg =
      targetGrades.length > 0
        ? Math.round((targetGrades.reduce((a, b) => a + b, 0) / targetGrades.length) * 10) / 10
        : 0;
    const passed = filteredStudents.filter((s) => {
      const g = localGrades[s.id];
      return g && g.isPassed;
    }).length;
    const passPercent = filteredStudents.length > 0 ? Math.round((passed / filteredStudents.length) * 100) : 0;

    return { avg, passed, passPercent, total: filteredStudents.length };
  }, [filteredStudents, localGrades]);

  // Handler Perubahan Nilai Inline
  const handleInlineChange = (studentId: string, field: 'tugas' | 'kuis' | 'pretest' | 'posttest' | 'ujian', rawVal: string) => {
    const val = Math.min(100, Math.max(0, Number(rawVal) || 0));
    setLocalGrades((prev) => {
      const current = prev[studentId] || {
        studentId,
        tugas: 0,
        kuis: 0,
        pretest: 0,
        posttest: 0,
        ujian: 0,
        finalScore: 0,
        isPassed: false,
      };

      const updatedRaw = {
        ...current,
        [field]: val,
      };

      const { finalScore, isPassed } = calculateFinalScore(updatedRaw, config);
      return {
        ...prev,
        [studentId]: {
          ...updatedRaw,
          finalScore,
          isPassed,
        },
      };
    });
  };

  // Simpan Satu Nilai Siswa
  const handleSaveSingleGrade = (studentId: string) => {
    const grade = localGrades[studentId];
    if (grade) {
      onSaveGrade(grade);
      showToast(`Nilai untuk siswa berhasil diperbarui dan disimpan ke database.`);
    }
  };

  // Simpan Seluruh Nilai di Layar (Bulk Save)
  const handleSaveAllDisplayedGrades = () => {
    const toSave: StudentGrade[] = [];
    filteredStudents.forEach((s) => {
      if (localGrades[s.id]) {
        toSave.push(localGrades[s.id]);
      }
    });
    onBulkSaveGrades(toSave);
    showToast(`Berhasil menyimpan nilai untuk ${toSave.length} peserta didik secara persisten!`);
  };

  // Buka Modal Edit Siswa
  const handleOpenEditModal = (student: StudentItem) => {
    const current = localGrades[student.id] || {
      studentId: student.id,
      tugas: 80,
      kuis: 80,
      pretest: 75,
      posttest: 80,
      ujian: 80,
      finalScore: 79.5,
      isPassed: true,
      notes: '',
    };
    setEditingStudentId(student.id);
    setModalGradeData({
      tugas: current.tugas,
      kuis: current.kuis,
      pretest: current.pretest,
      posttest: current.posttest,
      ujian: current.ujian,
      notes: current.notes || '',
    });
  };

  // Simpan Modal Edit Siswa
  const handleSaveModalGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentId) return;

    const { finalScore, isPassed } = calculateFinalScore(modalGradeData, config);
    const updatedGrade: StudentGrade = {
      studentId: editingStudentId,
      ...modalGradeData,
      finalScore,
      isPassed,
    };

    setLocalGrades((prev) => ({
      ...prev,
      [editingStudentId]: updatedGrade,
    }));

    onSaveGrade(updatedGrade);
    setEditingStudentId(null);
    showToast('Nilai peserta didik berhasil disimpan dan dihitung ulang.');
  };

  // Simpan Konfigurasi Bobot & KKM
  const handleSaveWeightConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = tempConfig.tugas + tempConfig.kuis + tempConfig.pretest + tempConfig.posttest + tempConfig.ujian;
    if (sum !== 100) {
      alert(`Total persentase bobot harus pas 100%. Saat ini berjumlah: ${sum}%. Harap sesuaikan kembali.`);
      return;
    }

    onSaveConfig(tempConfig);
    // Hitung ulang semua localGrades
    setLocalGrades((prev) => {
      const next: Record<string, StudentGrade> = {};
      Object.keys(prev).forEach((id) => {
        const item = prev[id];
        const { finalScore, isPassed } = calculateFinalScore(item, tempConfig);
        next[id] = { ...item, finalScore, isPassed };
      });
      return next;
    });

    setIsConfigModalOpen(false);
    showToast(`Konfigurasi bobot dan KKM (${tempConfig.kkm}) berhasil diterapkan!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="teacher-tab-content animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="teacher-toast-alert animate-fade-in" role="status">
          <span className="toast-icon">✅</span>
          <span>{toastMessage}</span>
          <button type="button" className="toast-close" onClick={() => setToastMessage(null)}>✕</button>
        </div>
      )}

      {/* Baris Atas: Pengaturan Bobot & KKM Ringkas */}
      <div className="grade-settings-strip">
        <div className="strip-left">
          <span className="strip-badge">BOBOT PENILAIAN KURIKULUM:</span>
          <div className="weight-chips-row">
            <span className="weight-chip">Tugas: <strong>{config.tugas}%</strong></span>
            <span className="weight-chip">Kuis: <strong>{config.kuis}%</strong></span>
            <span className="weight-chip">Pretest: <strong>{config.pretest}%</strong></span>
            <span className="weight-chip">Posttest: <strong>{config.posttest}%</strong></span>
            <span className="weight-chip">Ujian: <strong>{config.ujian}%</strong></span>
            <span className="weight-chip highlight">KKM/KKTP: <strong>{config.kkm}</strong></span>
          </div>
        </div>

        <div className="strip-right">
          <button
            type="button"
            className="btn-settings-pill"
            onClick={() => {
              setTempConfig({ ...config });
              setIsConfigModalOpen(true);
            }}
          >
            ⚙️ Atur Bobot & KKM
          </button>
        </div>
      </div>

      {/* Kontrol Filter & Tombol Simpan Masal */}
      <div className="tab-control-bar">
        <div className="control-bar-left">
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Cari siswa atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-select-wrapper">
            <label htmlFor="filter-grade-class" className="filter-label">Kelas:</label>
            <select
              id="filter-grade-class"
              className="filter-dropdown"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">Semua Kelas ({students.length})</option>
              {classList
                .filter((c) => c !== 'all')
                .map((c) => (
                  <option key={c} value={c}>
                    {c} ({students.filter((s) => s.kelas === c).length})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="control-bar-right">
          <div className="grade-quick-stats">
            <span className="stat-item">Rata-rata: <strong>{stats.avg}</strong></span>
            <span className="stat-item">Ketuntasan: <strong>{stats.passPercent}%</strong> ({stats.passed}/{stats.total})</span>
          </div>

          <button
            type="button"
            className="btn-primary-action success"
            onClick={handleSaveAllDisplayedGrades}
            title="Simpan seluruh perubahan nilai pada tabel ke database"
          >
            💾 Simpan Seluruh Nilai
          </button>
        </div>
      </div>

      {/* Tabel Input Nilai Komprehensif */}
      <div className="teacher-table-card">
        <div className="table-responsive">
          <table className="teacher-data-table grade-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }} className="text-center">No</th>
                <th style={{ width: '90px' }}>NIS</th>
                <th style={{ minWidth: '180px' }}>Nama Peserta Didik</th>
                <th style={{ width: '95px' }}>Kelas</th>
                <th style={{ width: '85px' }} className="text-center">Tugas ({config.tugas}%)</th>
                <th style={{ width: '85px' }} className="text-center">Kuis ({config.kuis}%)</th>
                <th style={{ width: '85px' }} className="text-center">Pre ({config.pretest}%)</th>
                <th style={{ width: '85px' }} className="text-center">Post ({config.posttest}%)</th>
                <th style={{ width: '85px' }} className="text-center">Ujian ({config.ujian}%)</th>
                <th style={{ width: '100px' }} className="text-center">Nilai Akhir</th>
                <th style={{ width: '120px' }} className="text-center">Status</th>
                <th style={{ width: '110px' }} className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => {
                const g = localGrades[student.id] || {
                  studentId: student.id,
                  tugas: 0,
                  kuis: 0,
                  pretest: 0,
                  posttest: 0,
                  ujian: 0,
                  finalScore: 0,
                  isPassed: false,
                };

                return (
                  <tr key={student.id}>
                    <td className="text-center text-muted">{idx + 1}</td>
                    <td>
                      <code className="code-badge">{student.nis || '-'}</code>
                    </td>
                    <td>
                      <strong className="student-name-strong">{student.name}</strong>
                    </td>
                    <td>
                      <span className="class-pill">{student.kelas}</span>
                    </td>

                    {/* Input Komponen Nilai Inline */}
                    <td className="text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="grade-inline-input"
                        value={g.tugas}
                        onChange={(e) => handleInlineChange(student.id, 'tugas', e.target.value)}
                        title="Nilai Tugas Mandiri & Terstruktur"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="grade-inline-input"
                        value={g.kuis}
                        onChange={(e) => handleInlineChange(student.id, 'kuis', e.target.value)}
                        title="Nilai Kuis Formatif Bab"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="grade-inline-input"
                        value={g.pretest}
                        onChange={(e) => handleInlineChange(student.id, 'pretest', e.target.value)}
                        title="Nilai Pretest Diagnostik"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="grade-inline-input"
                        value={g.posttest}
                        onChange={(e) => handleInlineChange(student.id, 'posttest', e.target.value)}
                        title="Nilai Posttest / LKPD Evaluasi Bab 6"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="grade-inline-input"
                        value={g.ujian}
                        onChange={(e) => handleInlineChange(student.id, 'ujian', e.target.value)}
                        title="Nilai Ujian Sumatif / Praktikum Lab Virtual"
                      />
                    </td>

                    {/* Nilai Akhir Terhitung Otomatis */}
                    <td className="text-center">
                      <span className={`final-score-pill ${g.isPassed ? 'passed' : 'failed'}`}>
                        {g.finalScore}
                      </span>
                    </td>

                    {/* Status Ketuntasan KKTP */}
                    <td className="text-center">
                      {g.isPassed ? (
                        <span className="status-badge passed">
                          <span className="status-dot"></span> TUNTAS
                        </span>
                      ) : (
                        <span className="status-badge failed">
                          <span className="status-dot"></span> REMEDIAL
                        </span>
                      )}
                    </td>

                    {/* Aksi Baris */}
                    <td className="text-center">
                      <div className="action-button-group">
                        <button
                          type="button"
                          className="btn-action edit"
                          onClick={() => handleOpenEditModal(student)}
                          title="Rincian & Catatan Nilai"
                        >
                          🔍
                        </button>
                        <button
                          type="button"
                          className="btn-action save-row"
                          onClick={() => handleSaveSingleGrade(student.id)}
                          title="Simpan baris ini"
                        >
                          💾
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PENGATURAN BOBOT & KKM / KKTP */}
      {isConfigModalOpen && (
        <div className="teacher-modal-backdrop" onClick={() => setIsConfigModalOpen(false)}>
          <div className="teacher-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-icon">⚙️</span>
                <div>
                  <h3 className="modal-title">Konfigurasi Bobot Penilaian & KKTP/KKM</h3>
                  <p className="modal-sub">Tentukan proporsi nilai akhir dan batas kriteria ketuntasan kimia kelas XI</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsConfigModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWeightConfig} className="modal-body form-grid">
              <div className="form-group">
                <label className="form-label required">Bobot Tugas Mandiri (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  required
                  value={tempConfig.tugas}
                  onChange={(e) => setTempConfig({ ...tempConfig, tugas: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Bobot Kuis Formatif (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  required
                  value={tempConfig.kuis}
                  onChange={(e) => setTempConfig({ ...tempConfig, kuis: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Bobot Pretest Diagnostik (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  required
                  value={tempConfig.pretest}
                  onChange={(e) => setTempConfig({ ...tempConfig, pretest: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Bobot Posttest Evaluasi (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  required
                  value={tempConfig.posttest}
                  onChange={(e) => setTempConfig({ ...tempConfig, posttest: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Bobot Ujian Sumatif / Praktikum (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  required
                  value={tempConfig.ujian}
                  onChange={(e) => setTempConfig({ ...tempConfig, ujian: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Batas KKM / KKTP Sekolah</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  className="form-control"
                  required
                  value={tempConfig.kkm}
                  onChange={(e) => setTempConfig({ ...tempConfig, kkm: Number(e.target.value) || 75 })}
                />
                <span className="form-hint">Siswa dengan nilai akhir &ge; KKM dinyatakan TUNTAS.</span>
              </div>

              {/* Kalkulasi Total Bobot Realtime */}
              <div className="form-group full-width">
                <div
                  className={`weight-sum-box ${
                    tempConfig.tugas + tempConfig.kuis + tempConfig.pretest + tempConfig.posttest + tempConfig.ujian === 100
                      ? 'valid'
                      : 'invalid'
                  }`}
                >
                  <span>Total Persentase Bobot:</span>
                  <strong>
                    {tempConfig.tugas + tempConfig.kuis + tempConfig.pretest + tempConfig.posttest + tempConfig.ujian}%
                  </strong>
                  {tempConfig.tugas + tempConfig.kuis + tempConfig.pretest + tempConfig.posttest + tempConfig.ujian !== 100 && (
                    <span className="weight-alert-note">(Wajib berjumlah 100%)</span>
                  )}
                </div>
              </div>

              <div className="modal-footer full-width">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsConfigModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-modal-submit">
                  Terapkan & Hitung Ulang Seluruh Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RINCIAN & CATATAN NILAI SISWA */}
      {editingStudentId && (
        <div className="teacher-modal-backdrop" onClick={() => setEditingStudentId(null)}>
          <div className="teacher-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-icon">📝</span>
                <div>
                  <h3 className="modal-title">
                    Detail & Catatan Perkembangan: {students.find((s) => s.id === editingStudentId)?.name}
                  </h3>
                  <p className="modal-sub">
                    {students.find((s) => s.id === editingStudentId)?.kelas} • NIS:{' '}
                    {students.find((s) => s.id === editingStudentId)?.nis}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setEditingStudentId(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalGrade} className="modal-body form-grid">
              <div className="form-group">
                <label className="form-label">Tugas ({config.tugas}%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  value={modalGradeData.tugas}
                  onChange={(e) => setModalGradeData({ ...modalGradeData, tugas: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kuis ({config.kuis}%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  value={modalGradeData.kuis}
                  onChange={(e) => setModalGradeData({ ...modalGradeData, kuis: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pretest ({config.pretest}%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  value={modalGradeData.pretest}
                  onChange={(e) => setModalGradeData({ ...modalGradeData, pretest: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Posttest Bab 6 ({config.posttest}%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  value={modalGradeData.posttest}
                  onChange={(e) => setModalGradeData({ ...modalGradeData, posttest: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Ujian Sumatif / Praktikum ({config.ujian}%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  value={modalGradeData.ujian}
                  onChange={(e) => setModalGradeData({ ...modalGradeData, ujian: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Catatan Perkembangan Ilmiah & Remedial</label>
                <textarea
                  className="form-control text-area-notes"
                  rows={3}
                  placeholder="Contoh: Menguasai faktor konsentrasi dan luas permukaan. Perlu latihan tambahan pada perhitungan orde reaksi bertingkat."
                  value={modalGradeData.notes}
                  onChange={(e) => setModalGradeData({ ...modalGradeData, notes: e.target.value })}
                ></textarea>
              </div>

              {/* Preview Nilai Akhir */}
              <div className="form-group full-width">
                <div className="calculated-preview-box">
                  <div className="calc-left">
                    <span>Estimasi Nilai Akhir:</span>
                    <strong className="calc-score">
                      {calculateFinalScore(modalGradeData, config).finalScore}
                    </strong>
                  </div>
                  <div className="calc-right">
                    <span>Status:</span>
                    <strong className={calculateFinalScore(modalGradeData, config).isPassed ? 'text-success' : 'text-danger'}>
                      {calculateFinalScore(modalGradeData, config).isPassed ? '✓ MEMENUHI KKM (TUNTAS)' : '✗ PERLU REMEDIAL'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer full-width">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setEditingStudentId(null)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-modal-submit">
                  Simpan Nilai Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
