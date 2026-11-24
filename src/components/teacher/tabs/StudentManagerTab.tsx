/**
 * components/teacher/tabs/StudentManagerTab.tsx
 * Tab 2: Data Peserta Didik (Student Management)
 * CRUD Data Siswa (Nama, NIS, NISN, Kelas, Gender, Email), Pencarian, dan Filter Kelas.
 */
import React, { useState, useMemo } from 'react';
import type { StudentItem } from '../../../types';

interface StudentManagerTabProps {
  students: StudentItem[];
  onSaveStudent: (student: StudentItem) => void;
  onDeleteStudent: (studentId: string) => void;
}

export const StudentManagerTab: React.FC<StudentManagerTabProps> = ({
  students,
  onSaveStudent,
  onDeleteStudent,
}) => {
  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // State Modal Tambah / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    nis: '',
    nisn: '',
    kelas: 'XI MIPA 1',
    gender: 'L' as 'L' | 'P',
    email: '',
  });

  // State Konfirmasi Hapus
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Daftar Kelas Unik
  const classList = useMemo(() => {
    const set = new Set(students.map((s) => s.kelas).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [students]);

  // Filter & Cari Data Siswa
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClass === 'all' || s.kelas === selectedClass;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.nis.toLowerCase().includes(query) ||
        s.nisn.toLowerCase().includes(query) ||
        (s.email && s.email.toLowerCase().includes(query));
      return matchClass && matchQuery;
    });
  }, [students, selectedClass, searchQuery]);

  // Buka Modal Tambah Baru
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      nis: '',
      nisn: '',
      kelas: selectedClass !== 'all' ? selectedClass : 'XI MIPA 1',
      gender: 'L',
      email: '',
    });
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEditModal = (student: StudentItem) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      nis: student.nis || '',
      nisn: student.nisn || '',
      kelas: student.kelas,
      gender: student.gender || 'L',
      email: student.email || '',
    });
    setIsModalOpen(true);
  };

  // Simpan Data
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama lengkap peserta didik wajib diisi.');
      return;
    }

    const newStudent: StudentItem = {
      id: editingStudent ? editingStudent.id : `std-${Date.now()}`,
      name: formData.name.trim(),
      nis: formData.nis.trim(),
      nisn: formData.nisn.trim(),
      kelas: formData.kelas.trim(),
      gender: formData.gender,
      email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@siswa.reaksilab.id`,
    };

    onSaveStudent(newStudent);
    setIsModalOpen(false);
  };

  // Eksekusi Hapus
  const handleConfirmDelete = () => {
    if (deletingStudentId) {
      onDeleteStudent(deletingStudentId);
      setDeletingStudentId(null);
    }
  };

  return (
    <div className="teacher-tab-content animate-fade-in">
      {/* Header Bar Kontrol */}
      <div className="tab-control-bar">
        <div className="control-bar-left">
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Cari nama, NIS, atau NISN siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-select-wrapper">
            <label htmlFor="filter-class-select" className="filter-label">Kelas:</label>
            <select
              id="filter-class-select"
              className="filter-dropdown"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">Semua Rombel ({students.length})</option>
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
          <span className="data-counter-pill">
            Menampilkan <strong>{filteredStudents.length}</strong> dari <strong>{students.length}</strong> Siswa
          </span>
          <button
            type="button"
            className="btn-primary-action"
            onClick={handleOpenAddModal}
          >
            <span aria-hidden="true">➕</span> Tambah Peserta Didik
          </button>
        </div>
      </div>

      {/* Tabel Data Peserta Didik */}
      <div className="teacher-table-card">
        {filteredStudents.length === 0 ? (
          <div className="table-empty-state">
            <span className="empty-icon">👥</span>
            <h4>Tidak Ada Data Peserta Didik Ditemukan</h4>
            <p>Cobalah mengganti kata kunci pencarian atau memilih filter kelas lainnya.</p>
            <button
              type="button"
              className="btn-empty-reset"
              onClick={() => {
                setSearchQuery('');
                setSelectedClass('all');
              }}
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="teacher-data-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }} className="text-center">No</th>
                  <th style={{ width: '100px' }}>NIS</th>
                  <th style={{ width: '130px' }}>NISN</th>
                  <th>Nama Lengkap Siswa</th>
                  <th style={{ width: '120px' }}>Kelas</th>
                  <th style={{ width: '70px' }} className="text-center">L/P</th>
                  <th>Email Siswa</th>
                  <th style={{ width: '140px' }} className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => (
                  <tr key={student.id}>
                    <td className="text-center text-muted">{idx + 1}</td>
                    <td>
                      <code className="code-badge">{student.nis || '-'}</code>
                    </td>
                    <td>
                      <code className="code-badge secondary">{student.nisn || '-'}</code>
                    </td>
                    <td>
                      <div className="student-name-cell">
                        <span className="avatar-letter" aria-hidden="true">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong className="s-name">{student.name}</strong>
                          <span className="s-id-sub">ID: {student.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="class-pill">{student.kelas}</span>
                    </td>
                    <td className="text-center">
                      <span className={`gender-badge ${student.gender === 'L' ? 'male' : 'female'}`}>
                        {student.gender || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="email-text">{student.email || '-'}</span>
                    </td>
                    <td className="text-center">
                      <div className="action-button-group">
                        <button
                          type="button"
                          className="btn-action edit"
                          onClick={() => handleOpenEditModal(student)}
                          title="Edit data siswa"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn-action delete"
                          onClick={() => setDeletingStudentId(student.id)}
                          title="Hapus data siswa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT SISWA */}
      {isModalOpen && (
        <div className="teacher-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="teacher-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-icon">{editingStudent ? '✏️' : '➕'}</span>
                <div>
                  <h3 className="modal-title">
                    {editingStudent ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}
                  </h3>
                  <p className="modal-sub">
                    {editingStudent ? `Memperbarui profil untuk ${editingStudent.name}` : 'Masukkan data identitas siswa kelas XI'}
                  </p>
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

            <form onSubmit={handleSubmitForm} className="modal-body form-grid">
              <div className="form-group full-width">
                <label className="form-label required">Nama Lengkap Peserta Didik</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Muhammad Bintang Pratama"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor Induk Siswa (NIS)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: 22108"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">NISN (10 Digit Nasional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: 0061234508"
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Kelas / Rombel</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: XI MIPA 1"
                  required
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jenis Kelamin</label>
                <select
                  className="form-control"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Alamat Email Siswa</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Contoh: nama.siswa@reaksilab.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <span className="form-hint">Digunakan untuk sinkronisasi nilai jika siswa masuk menggunakan Google.</span>
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
                  {editingStudent ? 'Simpan Perubahan' : 'Tambahkan Peserta Didik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deletingStudentId && (
        <div className="teacher-modal-backdrop" onClick={() => setDeletingStudentId(null)}>
          <div className="teacher-modal-dialog modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title text-danger">⚠️ Konfirmasi Penghapusan</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setDeletingStudentId(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Apakah Anda yakin ingin menghapus data peserta didik ini? Seluruh riwayat nilai dan submisi terkait juga akan terhapus. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDeletingStudentId(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleConfirmDelete}
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
