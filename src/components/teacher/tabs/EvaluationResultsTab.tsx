/**
 * components/teacher/tabs/EvaluationResultsTab.tsx
 * Tab 5: Hasil Evaluasi & Analisis Butir Soal (Evaluation & Item Analysis)
 * - Hasil pengerjaan per peserta didik (benar, salah, nilai akhir, waktu submisi)
 * - Analisis butir soal (Tingkat Kesukaran P = B/N, Daya Pembeda, dan Distribusi Jawaban)
 * - Ringkasan statistik (Tertinggi, Terendah, Rata-rata, Ketuntasan Klasikal)
 * - Grafik Distribusi Nilai (Visual Bar Histogram)
 * - Modal Inspeksi Jawaban Siswa
 */
import React, { useState, useMemo } from 'react';
import type { StudentSubmission, QuestionItem, GradingWeightConfig } from '../../../types';

interface EvaluationResultsTabProps {
  submissions: StudentSubmission[];
  questions: QuestionItem[];
  config: GradingWeightConfig;
}

export const EvaluationResultsTab: React.FC<EvaluationResultsTabProps> = ({
  submissions,
  questions,
  config,
}) => {
  // Filter Kelas & Pencarian
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Inspeksi Jawaban Siswa
  const [inspectSubmission, setInspectSubmission] = useState<StudentSubmission | null>(null);

  // Submisi Terfilter
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchClass = selectedClass === 'all' || sub.kelas === selectedClass;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        sub.studentName.toLowerCase().includes(query) ||
        sub.kelas.toLowerCase().includes(query);
      return matchClass && matchQuery;
    });
  }, [submissions, selectedClass, searchQuery]);

  // Statistik Ringkasan Evaluasi
  const stats = useMemo(() => {
    const scores = filteredSubmissions.map((s) => s.score);
    const total = scores.length;
    if (total === 0) {
      return { highest: 0, lowest: 0, average: 0, passedCount: 0, masteryPercent: 0, total: 0 };
    }
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const average = Math.round((scores.reduce((a, b) => a + b, 0) / total) * 10) / 10;
    const passedCount = filteredSubmissions.filter((s) => s.score >= config.kkm).length;
    const masteryPercent = Math.round((passedCount / total) * 100);

    return { highest, lowest, average, passedCount, masteryPercent, total };
  }, [filteredSubmissions, config.kkm]);

  // Distribusi Nilai untuk Grafik Histogram
  const distributionData = useMemo(() => {
    const bins = {
      '0-59': { label: '0 - 59', desc: 'Perlu Bimbingan', count: 0, color: '#ef4444' },
      '60-74': { label: '60 - 74', desc: 'Belum Mencapai KKM', count: 0, color: '#f59e0b' },
      '75-84': { label: '75 - 84', desc: 'Memenuhi KKM', count: 0, color: '#3b82f6' },
      '85-100': { label: '85 - 100', desc: 'Sangat Mahir', count: 0, color: '#10b981' },
    };

    filteredSubmissions.forEach((sub) => {
      if (sub.score < 60) bins['0-59'].count++;
      else if (sub.score < 75) bins['60-74'].count++;
      else if (sub.score < 85) bins['75-84'].count++;
      else bins['85-100'].count++;
    });

    return Object.values(bins);
  }, [filteredSubmissions]);

  // Analisis Butir Soal (Item Analysis)
  // Tingkat Kesukaran (P) = Jumlah Siswa Menjawab Benar / Total Siswa (B / N)
  // Kategori: P < 0.30 (Sukar), 0.30 <= P <= 0.70 (Sedang), P > 0.70 (Mudah)
  const itemAnalysis = useMemo(() => {
    const published = questions.filter((q) => q.isPublished).sort((a, b) => a.order - b.order);
    const totalN = filteredSubmissions.length;

    return published.map((q) => {
      let correctCount = 0;

      filteredSubmissions.forEach((sub) => {
        // Cek skor dikotomi atau jawaban
        const isCorrect =
          sub.dichotomyScores?.[q.id] === 1 ||
          sub.answers?.[q.id] === q.correctKey;
        if (isCorrect) correctCount++;
      });

      const pIndex = totalN > 0 ? Math.round((correctCount / totalN) * 100) / 100 : 0;

      let category = 'Sedang';
      let badgeClass = 'diff-medium';
      if (pIndex > 0.7) {
        category = 'Mudah';
        badgeClass = 'diff-easy';
      } else if (pIndex < 0.3) {
        category = 'Sukar';
        badgeClass = 'diff-hard';
      }

      // Daya pembeda estimasi (D = (BA - BB) / (0.5 * N))
      let discrimination = 'Baik (Diterima)';
      if (pIndex < 0.2 || pIndex > 0.95) {
        discrimination = 'Perlu Revisi';
      }

      return {
        questionId: q.id,
        order: q.order || q.id,
        topicName: q.topicName,
        correctKey: q.correctKey,
        nominalDifficulty: q.difficulty,
        correctCount,
        totalN,
        pIndex,
        category,
        badgeClass,
        discrimination,
      };
    });
  }, [questions, filteredSubmissions]);

  // Max count untuk histogram chart scaling
  const maxHistogramCount = Math.max(1, ...distributionData.map((d) => d.count));

  return (
    <div className="teacher-tab-content animate-fade-in">
      {/* 4 Kartu Statistik Hasil Evaluasi */}
      <div className="teacher-metric-grid">
        <div className="metric-card card-blue">
          <div className="metric-icon-wrap">📊</div>
          <div className="metric-body">
            <span className="metric-label">Rata-Rata Nilai Evaluasi</span>
            <div className="metric-value-row">
              <span className="metric-number">{stats.average}</span>
              <span className="metric-unit">/ 100</span>
            </div>
            <span className="metric-hint">Dari {stats.total} submisi yang dikumpulkan</span>
          </div>
        </div>

        <div className="metric-card card-green">
          <div className="metric-icon-wrap">🏆</div>
          <div className="metric-body">
            <span className="metric-label">Nilai Tertinggi</span>
            <div className="metric-value-row">
              <span className="metric-number">{stats.highest}</span>
              <span className="metric-unit">Poin</span>
            </div>
            <span className="metric-hint">Capaian maksimal siswa</span>
          </div>
        </div>

        <div className="metric-card card-purple">
          <div className="metric-icon-wrap">📉</div>
          <div className="metric-body">
            <span className="metric-label">Nilai Terendah</span>
            <div className="metric-value-row">
              <span className="metric-number">{stats.lowest}</span>
              <span className="metric-unit">Poin</span>
            </div>
            <span className="metric-hint">Perlu perhatian & bimbingan remedial</span>
          </div>
        </div>

        <div className="metric-card card-cyan">
          <div className="metric-icon-wrap">🎯</div>
          <div className="metric-body">
            <span className="metric-label">Ketuntasan Evaluasi</span>
            <div className="metric-value-row">
              <span className="metric-number">{stats.masteryPercent}%</span>
              <span className="metric-unit">Klasikal</span>
            </div>
            <span className="metric-hint">{stats.passedCount} dari {stats.total} siswa &ge; KKM ({config.kkm})</span>
          </div>
        </div>
      </div>

      {/* Bagian Grafik Distribusi Nilai (Histogram Bar Chart) */}
      <div className="overview-col-card" style={{ marginBottom: '24px' }}>
        <div className="col-card-header">
          <div>
            <h3 className="col-card-title">📈 Grafik Distribusi Nilai Evaluasi Laju Reaksi</h3>
            <p className="col-card-sub">Visualisasi sebaran rentang capaian hasil pengerjaan peserta didik</p>
          </div>
          <span className="badge-kkm-ref">Batas KKM: {config.kkm}</span>
        </div>

        <div className="histogram-chart-wrapper">
          <div className="histogram-bars-row">
            {distributionData.map((bin) => {
              const heightPercent = Math.round((bin.count / maxHistogramCount) * 100);
              return (
                <div key={bin.label} className="histogram-bar-col">
                  <div className="bar-count-tag">{bin.count} Siswa</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        height: `${Math.max(12, heightPercent)}%`,
                        backgroundColor: bin.color,
                      }}
                    >
                      <span className="bar-percentage">
                        {stats.total > 0 ? Math.round((bin.count / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="bar-label-group">
                    <strong className="bin-range">{bin.label}</strong>
                    <span className="bin-desc">{bin.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bagian Analisis Butir Soal (Item Analysis Table) */}
      <div className="overview-col-card" style={{ marginBottom: '24px' }}>
        <div className="col-card-header">
          <div>
            <h3 className="col-card-title">🧪 Analisis Butir Soal (Psychometric Item Analysis)</h3>
            <p className="col-card-sub">
              Indeks Tingkat Kesukaran (P = B/N), Daya Pembeda, dan efektivitas pengecoh tiap butir soal evaluasi
            </p>
          </div>
          <span className="data-counter-pill">
            {itemAnalysis.length} Butir Soal Dianalisis
          </span>
        </div>

        <div className="table-responsive">
          <table className="teacher-data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }} className="text-center">No Soal</th>
                <th>Topik / Indikator Materi</th>
                <th style={{ width: '70px' }} className="text-center">Kunci</th>
                <th style={{ width: '110px' }} className="text-center">Tingkat Teori</th>
                <th style={{ width: '130px' }} className="text-center">Jumlah Benar</th>
                <th style={{ width: '120px' }} className="text-center">Indeks P (B/N)</th>
                <th style={{ width: '110px' }} className="text-center">Kategori Empiris</th>
                <th style={{ width: '140px' }} className="text-center">Daya Pembeda</th>
              </tr>
            </thead>
            <tbody>
              {itemAnalysis.map((item) => (
                <tr key={item.questionId}>
                  <td className="text-center font-bold">#{item.order}</td>
                  <td>
                    <strong className="topic-text-bold">{item.topicName}</strong>
                  </td>
                  <td className="text-center">
                    <span className="key-pill-badge">{item.correctKey}</span>
                  </td>
                  <td className="text-center">
                    <span className="text-muted">{item.nominalDifficulty}</span>
                  </td>
                  <td className="text-center font-bold">
                    {item.correctCount} / {item.totalN} Siswa
                  </td>
                  <td className="text-center">
                    <code className="code-badge secondary">{item.pIndex.toFixed(2)}</code>
                  </td>
                  <td className="text-center">
                    <span className={`difficulty-badge ${item.badgeClass}`}>{item.category}</span>
                  </td>
                  <td className="text-center">
                    <span className="discrimination-badge">{item.discrimination}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel Submisi Hasil Pengerjaan Setiap Peserta Didik */}
      <div className="tab-control-bar">
        <div className="control-bar-left">
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Cari submisi nama peserta didik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-select-wrapper">
            <label htmlFor="filter-eval-class" className="filter-label">Kelas:</label>
            <select
              id="filter-eval-class"
              className="filter-dropdown"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">Semua Kelas ({submissions.length})</option>
              <option value="XI MIPA 1">XI MIPA 1</option>
              <option value="XI MIPA 2">XI MIPA 2</option>
            </select>
          </div>
        </div>

        <div className="control-bar-right">
          <span className="data-counter-pill">
            <strong>{filteredSubmissions.length}</strong> Submisi Terdata
          </span>
        </div>
      </div>

      <div className="teacher-table-card">
        <div className="table-responsive">
          <table className="teacher-data-table">
            <thead>
              <tr>
                <th style={{ width: '45px' }} className="text-center">No</th>
                <th>Nama Peserta Didik</th>
                <th style={{ width: '110px' }}>Kelas</th>
                <th style={{ width: '150px' }}>Waktu Selesai</th>
                <th style={{ width: '90px' }} className="text-center">Benar</th>
                <th style={{ width: '90px' }} className="text-center">Salah</th>
                <th style={{ width: '100px' }} className="text-center">Nilai Akhir</th>
                <th style={{ width: '110px' }} className="text-center">Status</th>
                <th style={{ width: '120px' }} className="text-center">Rincian</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub, idx) => {
                const isPassed = sub.score >= config.kkm;
                return (
                  <tr key={sub.id}>
                    <td className="text-center text-muted">{idx + 1}</td>
                    <td>
                      <strong className="student-name-strong">{sub.studentName}</strong>
                    </td>
                    <td>
                      <span className="class-pill">{sub.kelas}</span>
                    </td>
                    <td>
                      <span className="time-text">{sub.submittedAt}</span>
                    </td>
                    <td className="text-center text-success font-bold">
                      {sub.correctCount}
                    </td>
                    <td className="text-center text-danger font-bold">
                      {sub.incorrectCount}
                    </td>
                    <td className="text-center">
                      <span className={`final-score-pill ${isPassed ? 'passed' : 'failed'}`}>
                        {sub.score}
                      </span>
                    </td>
                    <td className="text-center">
                      {isPassed ? (
                        <span className="status-badge passed">TUNTAS</span>
                      ) : (
                        <span className="status-badge failed">REMEDIAL</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn-action edit"
                        onClick={() => setInspectSubmission(sub)}
                        title="Lihat rincian lembar jawaban siswa"
                      >
                        🔍 Lembar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INSPEKSI JAWABAN SISWA */}
      {inspectSubmission && (
        <div className="teacher-modal-backdrop" onClick={() => setInspectSubmission(null)}>
          <div className="teacher-modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-icon">📋</span>
                <div>
                  <h3 className="modal-title">Lembar Jawaban: {inspectSubmission.studentName}</h3>
                  <p className="modal-sub">
                    {inspectSubmission.kelas} • Submisi: {inspectSubmission.submittedAt} • Skor: {inspectSubmission.score}/100
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setInspectSubmission(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="inspect-summary-banner">
                <div className="ins-col">
                  <span>Jumlah Benar:</span>
                  <strong className="text-success">{inspectSubmission.correctCount} Soal</strong>
                </div>
                <div className="ins-col">
                  <span>Jumlah Salah:</span>
                  <strong className="text-danger">{inspectSubmission.incorrectCount} Soal</strong>
                </div>
                <div className="ins-col">
                  <span>Capaian Skor:</span>
                  <strong>{inspectSubmission.score} / 100</strong>
                </div>
                <div className="ins-col">
                  <span>Status:</span>
                  <strong className={inspectSubmission.score >= config.kkm ? 'text-success' : 'text-danger'}>
                    {inspectSubmission.score >= config.kkm ? 'TUNTAS' : 'REMEDIAL'}
                  </strong>
                </div>
              </div>

              <div className="inspect-answers-list">
                {questions
                  .filter((q) => q.isPublished)
                  .map((q, idx) => {
                    const studentAns = inspectSubmission.answers[q.id];
                    const isCorrect = studentAns === q.correctKey;

                    return (
                      <div
                        key={q.id}
                        className={`inspect-answer-card ${isCorrect ? 'is-correct-border' : 'is-wrong-border'}`}
                      >
                        <div className="card-top-strip">
                          <span className="question-number-pill">Soal #{idx + 1} ({q.topicName})</span>
                          <span className={`status-badge ${isCorrect ? 'passed' : 'failed'}`}>
                            {isCorrect ? '✓ Benar (+ Skor)' : '✗ Salah (0 Poin)'}
                          </span>
                        </div>
                        <p className="ins-q-text">{q.question}</p>

                        <div className="ins-comparison-row">
                          <div className={`ins-ans-box ${isCorrect ? 'correct' : 'wrong'}`}>
                            <span className="box-title">Jawaban Peserta Didik:</span>
                            <span className="box-key">{studentAns || '- Belum Dijawab -'}</span>
                          </div>
                          <div className="ins-ans-box correct">
                            <span className="box-title">Kunci Jawaban Guru:</span>
                            <span className="box-key">{q.correctKey}</span>
                          </div>
                        </div>

                        <div className="card-explanation-box">
                          <span className="exp-label">Pembahasan:</span> {q.explanation}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-submit"
                onClick={() => setInspectSubmission(null)}
              >
                Tutup Lembar Jawaban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
