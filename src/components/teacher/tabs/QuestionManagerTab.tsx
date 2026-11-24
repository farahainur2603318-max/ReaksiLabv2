/**
 * components/teacher/tabs/QuestionManagerTab.tsx
 * Tab 4: Manajemen Bank Soal (Question Bank Management)
 * CRUD Soal, Opsi Jawaban (A-E), Kunci Jawaban, Pembahasan Ilmiah,
 * Skor / Bobot, Tingkat Kesulitan, Gambar/Ilustrasi, Fitur Preview,
 * dan Saklar Publikasi Otomatis ke Halaman Peserta Didik (Bab 6).
 */
import React, { useState, useMemo } from 'react';
import type { QuestionItem, QuestionOption } from '../../../types';

interface QuestionManagerTabProps {
  questions: QuestionItem[];
  onSaveQuestion: (question: QuestionItem) => void;
  onDeleteQuestion: (questionId: number) => void;
  onTogglePublish: (questionId: number) => void;
}

// Preset Ilustrasi Kimia Reaksi yang bisa dipilih guru dengan 1 klik
const PRESET_ILLUSTRATIONS = [
  { label: 'Tanpa Ilustrasi', url: '' },
  { label: 'Diagram Energi Aktivasi (Ea)', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Tabung Reaksi & Gelembung Gas', url: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8b4?auto=format&fit=crop&w=600&q=80' },
  { label: 'Kristal & Partikel Mikroskopis', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80' },
  { label: 'Gelas Kimia & Larutan Berwarna', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80' },
];

export const QuestionManagerTab: React.FC<QuestionManagerTabProps> = ({
  questions,
  onSaveQuestion,
  onDeleteQuestion,
  onTogglePublish,
}) => {
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State Tambah / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);

  // Modal Preview Khusus
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    order: number;
    topicRef: QuestionItem['topicRef'];
    topicName: string;
    difficulty: 'Mudah' | 'Sedang' | 'Sukar';
    scoreWeight: number;
    question: string;
    options: QuestionOption[];
    correctKey: string;
    explanation: string;
    imageUrl: string;
    isPublished: boolean;
  }>({
    order: 1,
    topicRef: 'bab1',
    topicName: 'Bab 1: Definisi Laju Reaksi',
    difficulty: 'Sedang',
    scoreWeight: 10,
    question: '',
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
      { key: 'E', text: '' },
    ],
    correctKey: 'A',
    explanation: '',
    imageUrl: '',
    isPublished: true,
  });

  // Modal Konfirmasi Hapus
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);

  // Filter Soal
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      const matchStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'published' && q.isPublished) ||
        (selectedStatus === 'draft' && !q.isPublished);
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        q.question.toLowerCase().includes(query) ||
        q.topicName.toLowerCase().includes(query) ||
        q.explanation.toLowerCase().includes(query);
      return matchDiff && matchStatus && matchQuery;
    });
  }, [questions, selectedDifficulty, selectedStatus, searchQuery]);

  // Buka Modal Tambah Baru
  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    const nextOrder = questions.length + 1;
    setFormData({
      order: nextOrder,
      topicRef: 'bab1',
      topicName: 'Bab 1: Definisi Laju Reaksi',
      difficulty: 'Sedang',
      scoreWeight: 10,
      question: '',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
        { key: 'E', text: '' },
      ],
      correctKey: 'A',
      explanation: '',
      imageUrl: '',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEditModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    // Pastikan selalu ada 5 opsi
    const fullOptions: QuestionOption[] = ['A', 'B', 'C', 'D', 'E'].map((k) => {
      const existing = q.options.find((o: QuestionOption) => o.key === k);
      return existing || { key: k, text: '' };
    });

    setFormData({
      order: q.order || q.id,
      topicRef: q.topicRef,
      topicName: q.topicName,
      difficulty: q.difficulty,
      scoreWeight: q.scoreWeight || 10,
      question: q.question,
      options: fullOptions,
      correctKey: q.correctKey,
      explanation: q.explanation,
      imageUrl: q.imageUrl || '',
      isPublished: q.isPublished,
    });
    setIsModalOpen(true);
  };

  // Ubah Opsi Jawaban
  const handleOptionChange = (key: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) => (opt.key === key ? { ...opt, text } : opt)),
    }));
  };

  // Otomatis sinkronkan nama bab berdasarkan topicRef
  const handleTopicChange = (topicRef: QuestionItem['topicRef']) => {
    const topicMap: Record<string, string> = {
      bab1: 'Bab 1: Definisi Laju Reaksi',
      bab2: 'Bab 2: Teori Tumbukan',
      bab3: 'Bab 3: Faktor-Faktor Laju Reaksi',
      bab4: 'Bab 4: Orde Reaksi & Hukum Laju',
      bab5: 'Bab 5: Proyek STEM Arduino',
      bab6: 'Bab 6: Evaluasi Akhir',
      umum: 'Konseptual Kimia Laju Reaksi',
    };
    setFormData((prev) => ({
      ...prev,
      topicRef,
      topicName: topicMap[topicRef] || 'Materi Laju Reaksi',
    }));
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      alert('Teks pertanyaan wajib diisi.');
      return;
    }

    // Filter opsi yang tidak kosong minimal 3 opsi
    const validOptions = formData.options.filter((o) => o.text.trim().length > 0);
    if (validOptions.length < 2) {
      alert('Sediakan minimal 2 pilihan jawaban.');
      return;
    }

    const questionToSave: QuestionItem = {
      id: editingQuestion ? editingQuestion.id : Date.now(),
      order: Number(formData.order) || 1,
      topicRef: formData.topicRef,
      topicName: formData.topicName,
      difficulty: formData.difficulty,
      scoreWeight: Number(formData.scoreWeight) || 10,
      question: formData.question.trim(),
      options: validOptions,
      correctKey: formData.correctKey,
      explanation: formData.explanation.trim() || 'Pembahasan ilmiah telah diverifikasi oleh tim pengampu.',
      imageUrl: formData.imageUrl.trim() || undefined,
      isPublished: formData.isPublished,
    };

    onSaveQuestion(questionToSave);
    setIsModalOpen(false);
  };

  // Konfirmasi Hapus
  const handleConfirmDelete = () => {
    if (deletingQuestionId !== null) {
      onDeleteQuestion(deletingQuestionId);
      setDeletingQuestionId(null);
    }
  };

  return (
    <div className="teacher-tab-content animate-fade-in">
      {/* Baris Kontrol Bank Soal */}
      <div className="tab-control-bar">
        <div className="control-bar-left">
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Cari pertanyaan atau kata kunci materi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-select-wrapper">
            <label htmlFor="filter-diff" className="filter-label">Tingkat:</label>
            <select
              id="filter-diff"
              className="filter-dropdown"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="all">Semua Kesulitan</option>
              <option value="Mudah">Mudah</option>
              <option value="Sedang">Sedang</option>
              <option value="Sukar">Sukar</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <label htmlFor="filter-pub" className="filter-label">Status:</label>
            <select
              id="filter-pub"
              className="filter-dropdown"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="published">Publik (Aktif Siswa)</option>
              <option value="draft">Draft (Tersembunyi)</option>
            </select>
          </div>
        </div>

        <div className="control-bar-right">
          <span className="data-counter-pill">
            <strong>{questions.filter((q) => q.isPublished).length}</strong> Aktif di Siswa ({questions.length} Total)
          </span>
          <button
            type="button"
            className="btn-primary-action"
            onClick={handleOpenAddModal}
          >
            <span aria-hidden="true">➕</span> Tambah Butir Soal
          </button>
        </div>
      </div>

      {/* Banner Sinkronisasi Otomatis */}
      <div className="question-sync-banner">
        <span className="sync-icon">⚡</span>
        <div className="sync-text">
          <strong>Sinkronisasi Dinamis LKPD Bab 6:</strong> Setiap butir soal dengan status <code>PUBLIK</code> akan otomatis muncul pada evaluasi siswa di Bab 6 tanpa perlu build ulang atau konfigurasi manual.
        </div>
      </div>

      {/* Daftar Kartu Butir Soal */}
      <div className="questions-grid-container">
        {filteredQuestions.length === 0 ? (
          <div className="table-empty-state">
            <span className="empty-icon">📝</span>
            <h4>Tidak Ada Butir Soal Ditemukan</h4>
            <p>Cobalah menyetel ulang filter tingkat kesulitan atau kata kunci pencarian.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div key={q.id} className={`question-admin-card ${q.isPublished ? 'published' : 'draft'}`}>
              <div className="card-top-strip">
                <div className="top-strip-left">
                  <span className="question-number-pill">Soal #{q.order || q.id}</span>
                  <span className="topic-tag-pill">{q.topicName}</span>
                  <span
                    className={`difficulty-badge ${
                      q.difficulty === 'Mudah' ? 'diff-easy' : q.difficulty === 'Sedang' ? 'diff-medium' : 'diff-hard'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="score-weight-badge">{q.scoreWeight || 10} Poin</span>
                </div>

                <div className="top-strip-right">
                  <button
                    type="button"
                    className={`btn-publish-toggle ${q.isPublished ? 'active' : 'inactive'}`}
                    onClick={() => onTogglePublish(q.id)}
                    title={q.isPublished ? 'Klik untuk sembunyikan dari siswa' : 'Klik untuk tampilkan di evaluasi siswa'}
                  >
                    <span className="toggle-dot"></span>
                    {q.isPublished ? 'PUBLIK' : 'DRAFT'}
                  </button>
                </div>
              </div>

              {/* Teks Pertanyaan & Ilustrasi jika ada */}
              <div className="card-question-body">
                {q.imageUrl && (
                  <div className="question-card-thumb">
                    <img src={q.imageUrl} alt="Ilustrasi Soal" />
                  </div>
                )}
                <p className="question-card-text">{q.question}</p>
              </div>

              {/* Rangkuman Opsi Jawaban */}
              <div className="card-options-summary">
                {q.options.map((opt: QuestionOption) => (
                  <div
                    key={opt.key}
                    className={`option-summary-pill ${opt.key === q.correctKey ? 'is-correct-key' : ''}`}
                  >
                    <span className="opt-key">{opt.key}.</span>
                    <span className="opt-text">{opt.text}</span>
                    {opt.key === q.correctKey && <span className="key-check">✓ Kunci</span>}
                  </div>
                ))}
              </div>

              {/* Pembahasan Ringkas */}
              <div className="card-explanation-box">
                <span className="exp-label">💡 Pembahasan:</span>
                <span className="exp-content">{q.explanation}</span>
              </div>

              {/* Card Footer Actions */}
              <div className="card-footer-actions">
                <button
                  type="button"
                  className="btn-card-action preview"
                  onClick={() => setPreviewQuestion(q)}
                >
                  👁️ Preview Tampilan Siswa
                </button>
                <div className="btn-group-right">
                  <button
                    type="button"
                    className="btn-card-action edit"
                    onClick={() => handleOpenEditModal(q)}
                  >
                    ✏️ Edit Soal
                  </button>
                  <button
                    type="button"
                    className="btn-card-action delete"
                    onClick={() => setDeletingQuestionId(q.id)}
                    title="Hapus butir soal"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL TAMBAH / EDIT SOAL */}
      {isModalOpen && (
        <div className="teacher-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="teacher-modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-icon">{editingQuestion ? '✏️' : '➕'}</span>
                <div>
                  <h3 className="modal-title">
                    {editingQuestion ? `Edit Butir Soal #${editingQuestion.order || editingQuestion.id}` : 'Tambah Butir Soal Baru'}
                  </h3>
                  <p className="modal-sub">Konfigurasi pertanyaan, pilihan jawaban, kunci, bobot, dan ilustrasi kimia</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body form-grid">
              <div className="form-group">
                <label className="form-label required">Nomor Urut Soal</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-control"
                  required
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 1 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Cakupan Bab / Topik</label>
                <select
                  className="form-control"
                  value={formData.topicRef}
                  onChange={(e) => handleTopicChange(e.target.value as QuestionItem['topicRef'])}
                >
                  <option value="bab1">Bab 1: Definisi Laju Reaksi</option>
                  <option value="bab2">Bab 2: Teori Tumbukan & Energi Aktivasi</option>
                  <option value="bab3">Bab 3: Faktor Penentu Laju Reaksi</option>
                  <option value="bab4">Bab 4: Analisis Data & Hukum Laju</option>
                  <option value="bab5">Bab 5: Proyek STEM Arduino</option>
                  <option value="bab6">Bab 6: Evaluasi Akhir & Refleksi</option>
                  <option value="umum">Konseptual Kimia Laju Reaksi</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Tingkat Kesulitan</label>
                <select
                  className="form-control"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'Mudah' | 'Sedang' | 'Sukar' })}
                >
                  <option value="Mudah">Mudah (C1 - C2)</option>
                  <option value="Sedang">Sedang (C3 - C4)</option>
                  <option value="Sukar">Sukar / HOTS (C5 - C6)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Bobot Skor (Poin)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  className="form-control"
                  required
                  value={formData.scoreWeight}
                  onChange={(e) => setFormData({ ...formData, scoreWeight: Number(e.target.value) || 10 })}
                />
              </div>

              {/* Teks Pertanyaan */}
              <div className="form-group full-width">
                <label className="form-label required">Teks Pertanyaan Soal</label>
                <textarea
                  className="form-control"
                  rows={3}
                  required
                  placeholder="Ketikkan rumusan pertanyaan kimia di sini..."
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                ></textarea>
              </div>

              {/* URL Gambar / Ilustrasi */}
              <div className="form-group full-width">
                <label className="form-label">Gambar atau Ilustrasi Pendukung (Opsional)</label>
                <div className="illustration-input-row">
                  <input
                    type="url"
                    className="form-control"
                    placeholder="Masukkan URL gambar atau pilih preset di sebelah kanan..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                  <select
                    className="form-control preset-select"
                    onChange={(e) => {
                      if (e.target.value !== undefined) {
                        setFormData({ ...formData, imageUrl: e.target.value });
                      }
                    }}
                  >
                    <option value="">Pilih Preset Lab...</option>
                    {PRESET_ILLUSTRATIONS.map((preset) => (
                      <option key={preset.label} value={preset.url}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.imageUrl && (
                  <div className="image-preview-mini">
                    <img src={formData.imageUrl} alt="Pratinjau Gambar" />
                    <span>Pratinjau Gambar Soal</span>
                  </div>
                )}
              </div>

              {/* Pilihan Jawaban A s.d. E */}
              <div className="form-group full-width">
                <label className="form-label required">Pilihan Jawaban & Kunci</label>
                <p className="form-hint">Pilih radio button di samping huruf untuk menetapkan Kunci Jawaban yang benar.</p>
                <div className="options-editor-stack">
                  {formData.options.map((opt) => (
                    <div key={opt.key} className={`option-edit-row ${formData.correctKey === opt.key ? 'is-key' : ''}`}>
                      <label className="key-radio-wrap" title={`Tetapkan ${opt.key} sebagai kunci jawaban`}>
                        <input
                          type="radio"
                          name="correctKeyRadio"
                          checked={formData.correctKey === opt.key}
                          onChange={() => setFormData({ ...formData, correctKey: opt.key })}
                        />
                        <span className="opt-key-badge">{opt.key}</span>
                      </label>
                      <input
                        type="text"
                        className="form-control opt-text-input"
                        placeholder={`Teks pilihan jawaban ${opt.key}...`}
                        value={opt.text}
                        onChange={(e) => handleOptionChange(opt.key, e.target.value)}
                      />
                      {formData.correctKey === opt.key && (
                        <span className="key-badge-indicator">Kunci Benar</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pembahasan Ilmiah */}
              <div className="form-group full-width">
                <label className="form-label required">Pembahasan Ilmiah Lengkap</label>
                <textarea
                  className="form-control"
                  rows={3}
                  required
                  placeholder="Jelaskan alasan ilmiah mengapa opsi tersebut benar..."
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                ></textarea>
              </div>

              {/* Status Publikasi */}
              <div className="form-group full-width">
                <label className="publish-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  />
                  <span>Publikasikan soal ini langsung ke halaman LKPD Bab 6 peserta didik</span>
                </label>
              </div>

              <div className="modal-footer full-width">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-modal-submit">
                  {editingQuestion ? 'Simpan Perubahan Soal' : 'Simpan & Tambahkan Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW TAMPILAN SISWA */}
      {previewQuestion && (
        <div className="teacher-modal-backdrop" onClick={() => setPreviewQuestion(null)}>
          <div className="teacher-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-icon">👁️</span>
                <div>
                  <h3 className="modal-title">Pratinjau Tampilan pada Siswa</h3>
                  <p className="modal-sub">Simulasi tampilan butir soal seperti yang dilihat peserta didik pada LKPD Bab 6</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setPreviewQuestion(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body preview-student-view">
              <div className="preview-quiz-card">
                <div className="quiz-item-top">
                  <span className="question-number">Soal #{previewQuestion.order || previewQuestion.id}</span>
                  <span className="topic-badge">{previewQuestion.topicName}</span>
                </div>

                {previewQuestion.imageUrl && (
                  <div className="preview-image-box">
                    <img src={previewQuestion.imageUrl} alt="Ilustrasi Soal Siswa" />
                  </div>
                )}

                <p className="question-text">{previewQuestion.question}</p>

                <div className="options-stack">
                  {previewQuestion.options.map((opt: QuestionOption) => (
                    <div
                      key={opt.key}
                      className={`quiz-opt-btn ${opt.key === previewQuestion.correctKey ? 'preview-highlight-key' : ''}`}
                    >
                      <span className="opt-key">{opt.key}</span>
                      <span className="opt-text">{opt.text}</span>
                      {opt.key === previewQuestion.correctKey && (
                        <span className="preview-tag-ans">Kunci Guru: Benar</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="explanation-box" style={{ marginTop: '16px' }}>
                  <div className="exp-badge">PEMBAHASAN ILMIAH GURU:</div>
                  <p className="exp-text">{previewQuestion.explanation}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-submit"
                onClick={() => setPreviewQuestion(null)}
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deletingQuestionId !== null && (
        <div className="teacher-modal-backdrop" onClick={() => setDeletingQuestionId(null)}>
          <div className="teacher-modal-dialog modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title text-danger">⚠️ Hapus Butir Soal?</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setDeletingQuestionId(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Apakah Anda yakin ingin menghapus butir soal #{deletingQuestionId}? Soal ini tidak akan muncul lagi pada lembar evaluasi peserta didik.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDeletingQuestionId(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleConfirmDelete}
              >
                Ya, Hapus Soal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
