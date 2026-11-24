/**
 * components/chapters/Chapter6.tsx
 * Halaman Lengkap Bab 6: Evaluasi Akhir Komprehensif & Refleksi Belajar
 */
import React, { useState } from 'react';
import { MODULE_6_SECTIONS } from '../../data/modulesData';
import { teacherStorageService } from '../../services/teacherStorageService';
import type { QuestionItem, UserProfile } from '../../types';

interface Chapter6Props {
  onBackToHome: () => void;
  onPrevChapter: () => void;
  onJumpChapter: (chapterKey: 'bab1' | 'bab2' | 'bab3' | 'bab4' | 'bab5') => void;
  currentUser?: UserProfile | null;
}

export const Chapter6: React.FC<Chapter6Props> = ({ onBackToHome, onPrevChapter, onJumpChapter, currentUser }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('sec-6-2');

  // Muat butir soal aktif dari teacherStorageService (sinkronisasi langsung dengan Panel Guru)
  const [questions] = useState<QuestionItem[]>(() => {
    const published = teacherStorageService.getPublishedQuestions();
    return published.length > 0 ? published : [];
  });

  // State kuis formatif
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  const activeSection = MODULE_6_SECTIONS.find((sec) => sec.id === activeSectionId) || MODULE_6_SECTIONS[1];

  const handleSelectAnswer = (qId: number, choiceKey: string) => {
    if (submitted) return; // Kunci pilihan setelah dikirim
    setAnswers((prev) => ({ ...prev, [qId]: choiceKey }));
  };

  const handleResetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setSubmissionFeedback(null);
  };

  // Hitung jumlah jawaban benar
  const correctCount = questions.reduce((acc, q) => {
    return acc + (answers[q.id] === q.correctKey ? 1 : 0);
  }, 0);

  const totalQuestions = questions.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Penanganan Kirim Jawaban & Simpan ke Hasil Evaluasi Guru
  const handleSubmitQuiz = () => {
    setSubmitted(true);

    try {
      const studentName = currentUser?.name || 'Siswa Mandiri (Kelas XI)';
      const studentClass = 'XI MIPA 1';
      teacherStorageService.recordSubmission({
        studentId: currentUser?.uid,
        studentName,
        kelas: studentClass,
        answers,
        publishedQuestions: questions,
      });
      setSubmissionFeedback('Hasil pengerjaan Anda telah tersimpan dan terekam pada Panel Guru.');
    } catch (err) {
      console.error('Error recording submission:', err);
    }
  };

  return (
    <div className="module-page-container">
      {/* Bilah Breadcrumb & Navigasi Kembali */}
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
          Beranda / <strong>Bab 6: Evaluasi Akhir & Refleksi</strong>
        </span>
      </div>

      <section className="labsheet-container" aria-labelledby="chapter6-title">
        {/* Header Lembar Kerja */}
        <div className="labsheet-header">
          <div className="labsheet-meta">
            <span className="labsheet-code">LKPD-XI-06 • EVALUASI KOMPREHENSIF</span>
            <span className="labsheet-topic">KIMIA SMA KELAS XI</span>
          </div>
          <h1 id="chapter6-title" className="labsheet-title">
            Bab 6: Evaluasi Akhir & Refleksi Belajar
          </h1>
          <p className="labsheet-lead">
            Menyatukan ketiga level representasi kimia (Makroskopis, Submikroskopis, dan Simbolik),
            menguji pemahaman konseptual lintas bab, dan memetakan capaian pembelajaran kimia Anda.
          </p>

          <div className="labsheet-info-strip">
            <div className="strip-item">
              <span className="strip-label">Cakupan:</span>
              <span className="strip-value">Sintesis Bab 1 s.d. Bab 5</span>
            </div>
            <div className="strip-item">
              <span className="strip-label">Bentuk:</span>
              <span className="strip-value">Evaluasi Mandiri & Umpan Balik Ilmiah</span>
            </div>
            <div className="strip-item">
              <span className="strip-label">Akses:</span>
              <span className="strip-value value-ready">✓ Terbuka Penuh (Open Access)</span>
            </div>
          </div>
        </div>

        {/* Kuis Evaluasi Formatif Komprehensif */}
        <div className="labsheet-section">
          <div className="quiz-box-container">
            <div className="quiz-box-header">
              <div>
                <span className="virtual-badge">EVALUASI MANDIRI SISWA</span>
                <h2 className="quiz-box-title">Uji Pemahaman Konseptual Kimia Laju Reaksi</h2>
              </div>
              <span className="privacy-badge">🔒 Tanpa Pengumpulan Identitas Siswa</span>
            </div>

            <p className="quiz-intro-text">
              Jawablah {totalQuestions} pertanyaan pemahaman konsep di bawah ini. Setelah Anda menekan tombol <strong>"Periksa Jawaban Saya"</strong>, sistem akan menampilkan skor capaian, pembahasan ilmiah lengkap, serta mencatat hasil belajar secara otomatis ke Panel Guru.
            </p>

            {/* Daftar Pertanyaan */}
            <div className="questions-list">
              {questions.map((q, idx) => (
                <div key={q.id} className="quiz-item-card">
                  <div className="quiz-item-top">
                    <span className="question-number">Soal {idx + 1} dari {totalQuestions}</span>
                    <span className="topic-badge">{q.topicName}</span>
                    <span className="difficulty-badge-mini">{q.difficulty}</span>
                  </div>

                  {q.imageUrl && (
                    <div className="quiz-question-illustration">
                      <img src={q.imageUrl} alt="Ilustrasi Soal Kimia" />
                    </div>
                  )}

                  <p className="question-text">{q.question}</p>

                  <div className="options-stack">
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt.key;
                      let optionClass = 'quiz-opt-btn';
                      if (isSelected) optionClass += ' selected';
                      if (submitted) {
                        if (opt.key === q.correctKey) optionClass += ' correct';
                        else if (isSelected && opt.key !== q.correctKey) optionClass += ' incorrect';
                      }

                      return (
                        <button
                          key={opt.key}
                          type="button"
                          className={optionClass}
                          onClick={() => handleSelectAnswer(q.id, opt.key)}
                          disabled={submitted}
                        >
                          <span className="opt-key">{opt.key}.</span>
                          <span className="opt-text">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className="answer-explanation-card">
                      <div className="explanation-header">
                        {answers[q.id] === q.correctKey ? (
                          <span className="exp-badge exp-pass">✅ Jawaban Tepat</span>
                        ) : (
                          <span className="exp-badge exp-review">ℹ️ Perlu Ditinjau Ulang</span>
                        )}
                        {(q.topicRef === 'bab1' || q.topicRef === 'bab2' || q.topicRef === 'bab3' || q.topicRef === 'bab4' || q.topicRef === 'bab5') && (
                          <button
                            type="button"
                            className="btn-jump-topic"
                            onClick={() => onJumpChapter(q.topicRef as any)}
                          >
                            Pelajari Kembali di {q.topicName} →
                          </button>
                        )}
                      </div>
                      <p className="exp-text"><strong>Pembahasan Konsep:</strong> {q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tombol Periksa Jawaban */}
            <div className="quiz-actions-bar">
              {!submitted ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitQuiz}
                  disabled={totalQuestions === 0 || Object.keys(answers).length < totalQuestions}
                >
                  {Object.keys(answers).length < totalQuestions
                    ? `Selesaikan Seluruh Soal (${Object.keys(answers).length}/${totalQuestions} Terjawab)`
                    : 'Periksa Jawaban & Rekam ke Panel Guru'}
                </button>
              ) : (
                <div className="quiz-results-banner">
                  <div className="score-summary">
                    <span className="score-number">{correctCount} / {totalQuestions}</span>
                    <div className="score-text">
                      <strong>Capaian Skor Akhir: {scorePercent}%</strong>
                      <p>
                        {scorePercent >= 75
                          ? 'Sempurna! Anda telah melampaui KKM dan menguasai konsep dasar laju reaksi dengan sangat baik.'
                          : 'Bagus sekali! Tinjau tombol "Pelajari Kembali" pada nomor soal yang keliru untuk mematangkan konsep remedial.'}
                      </p>
                      {submissionFeedback && (
                        <span className="submission-sync-badge">✓ {submissionFeedback}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleResetQuiz}
                  >
                    Ulangi Evaluasi Mandiri
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kartu Sub-Bagian Belajar Bab 6 */}
        <div className="labsheet-section">
          <div className="section-title-wrap">
            <h2 className="section-title">Kartu Refleksi Belajar &amp; Keterpaduan Sains</h2>
            <p className="section-subtitle">
              Pilih konsep di bawah ini untuk melihat keterpaduan kompetensi kimia SMA:
            </p>
          </div>

          <div className="section-tabs" role="tablist" aria-label="Daftar Bagian Belajar Bab 6">
            {MODULE_6_SECTIONS.map((section) => (
              <button
                key={section.id}
                role="tab"
                aria-selected={activeSectionId === section.id}
                className={`section-tab-btn ${activeSectionId === section.id ? 'active' : ''}`}
                onClick={() => setActiveSectionId(section.id)}
              >
                <span className="tab-code">{section.code}</span>
                <span className="tab-title">{section.title}</span>
              </button>
            ))}
          </div>

          <div className="section-content-card">
            <div className="content-card-header">
              <div>
                <span className="content-category-tag">{activeSection.category}</span>
                <h3 className="content-title">{activeSection.title}</h3>
                <p className="content-subtitle">{activeSection.subtitle}</p>
              </div>
              <span className="content-code-pill">{activeSection.code}</span>
            </div>

            <p className="content-summary">{activeSection.summary}</p>

            <div className="content-points-box">
              <div className="points-header">Poin Penting Penyelidikan:</div>
              <ul className="points-list">
                {activeSection.keyPoints.map((point, idx) => (
                  <li key={idx} className="point-item">
                    <span className="point-bullet" aria-hidden="true">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="scientific-note-box">
              <div className="note-icon" aria-hidden="true">💡</div>
              <div>
                <strong>Catatan Konseptual Guru & Kimiawan:</strong>
                <p>{activeSection.scientificNote}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigasi Bawah */}
        <div className="module-bottom-nav">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onPrevChapter}
          >
            ← Kembali ke Bab 5: Proyek STEM
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onBackToHome}
          >
            Selesai • Kembali ke Beranda & Peta Modul
          </button>
        </div>
      </section>
    </div>
  );
};

