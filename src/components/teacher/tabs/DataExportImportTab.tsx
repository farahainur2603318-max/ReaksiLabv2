/**
 * components/teacher/tabs/DataExportImportTab.tsx
 * Tab 6: Ekspor dan Impor Data (Export & Import Center)
 * - Ekspor Excel (.xlsx) Multi-Sheet
 * - Ekspor CSV (.csv) UTF-8
 * - Ekspor Matriks Skor Dikotomi (1=benar, 0=salah) untuk Analisis SPSS & Jamovi
 * - Cetak Laporan Resmi / Simpan PDF
 * - Impor Berkas Excel/CSV dengan Preview Validasi & Unduh Template Contoh
 */
import React, { useState, useMemo, useRef } from 'react';
import type { StudentItem, StudentGrade, StudentSubmission, QuestionItem, GradingWeightConfig } from '../../../types';
import { exportService, type ExportFilterOptions } from '../../../services/exportService';

interface DataExportImportTabProps {
  students: StudentItem[];
  grades: StudentGrade[];
  submissions: StudentSubmission[];
  questions: QuestionItem[];
  config: GradingWeightConfig;
  onImportStudents: (students: StudentItem[]) => void;
  onBulkSaveGrades: (grades: StudentGrade[]) => void;
}

export const DataExportImportTab: React.FC<DataExportImportTabProps> = ({
  students,
  grades,
  submissions,
  questions,
  config,
  onImportStudents,
  onBulkSaveGrades,
}) => {
  // Filter Ekspor
  const [exportFilters, setExportFilters] = useState<ExportFilterOptions>({
    kelas: 'all',
    studentId: 'all',
    assessmentType: 'all',
  });

  // State File Impor
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<{
    type: 'students' | 'grades' | 'unknown';
    data: any[];
    error?: string;
  } | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Daftar Kelas Unik
  const classList = useMemo(() => {
    const set = new Set(students.map((s) => s.kelas).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [students]);

  // Handle Pilih File
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setParseResult(null);
    setImportSuccessMsg(null);

    const result = await exportService.parseUploadedFile(file);
    setParseResult(result);
    setIsParsing(false);
  };

  // Eksekusi Simpan Data Impor
  const handleExecuteImport = () => {
    if (!parseResult || parseResult.data.length === 0) return;

    if (parseResult.type === 'students') {
      onImportStudents(parseResult.data as StudentItem[]);
      setImportSuccessMsg(`Berhasil mengimpor ${parseResult.data.length} data peserta didik ke dalam sistem!`);
      setSelectedFile(null);
      setParseResult(null);
    } else if (parseResult.type === 'grades') {
      onBulkSaveGrades(parseResult.data as StudentGrade[]);
      setImportSuccessMsg(`Berhasil mengimpor dan memperbarui nilai ${parseResult.data.length} peserta didik!`);
      setSelectedFile(null);
      setParseResult(null);
    }
  };

  return (
    <div className="teacher-tab-content animate-fade-in">
      {/* Toast Notifikasi Berhasil */}
      {importSuccessMsg && (
        <div className="teacher-toast-alert animate-fade-in" role="status">
          <span className="toast-icon">✅</span>
          <span>{importSuccessMsg}</span>
          <button type="button" className="toast-close" onClick={() => setImportSuccessMsg(null)}>✕</button>
        </div>
      )}

      {/* Bagian Filter Lingkup Ekspor */}
      <div className="export-filter-card">
        <div className="filter-card-header">
          <div>
            <h3 className="filter-card-title">🎯 Parameter Lingkup Unduhan Data</h3>
            <p className="filter-card-sub">Sesuaikan filter sebelum mengunduh format data yang diinginkan</p>
          </div>
          <span className="data-counter-pill">
            Data Terpilih: <strong>{exportFilters.kelas === 'all' ? students.length : students.filter((s) => s.kelas === exportFilters.kelas).length}</strong> Siswa
          </span>
        </div>

        <div className="filter-inputs-grid">
          <div className="filter-field">
            <label className="field-label">Target Rombel / Kelas:</label>
            <select
              className="form-control"
              value={exportFilters.kelas}
              onChange={(e) => setExportFilters({ ...exportFilters, kelas: e.target.value })}
            >
              <option value="all">Seluruh Rombel ({students.length} Siswa)</option>
              {classList
                .filter((c) => c !== 'all')
                .map((c) => (
                  <option key={c} value={c}>
                    {c} ({students.filter((s) => s.kelas === c).length} Siswa)
                  </option>
                ))}
            </select>
          </div>

          <div className="filter-field">
            <label className="field-label">Siswa Tertentu (Opsional):</label>
            <select
              className="form-control"
              value={exportFilters.studentId}
              onChange={(e) => setExportFilters({ ...exportFilters, studentId: e.target.value })}
            >
              <option value="all">Semua Siswa Terdaftar</option>
              {students
                .filter((s) => exportFilters.kelas === 'all' || s.kelas === exportFilters.kelas)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.kelas})
                  </option>
                ))}
            </select>
          </div>

          <div className="filter-field">
            <label className="field-label">Komponen Penilaian:</label>
            <select
              className="form-control"
              value={exportFilters.assessmentType}
              onChange={(e) =>
                setExportFilters({ ...exportFilters, assessmentType: e.target.value as ExportFilterOptions['assessmentType'] })
              }
            >
              <option value="all">Semua Komponen (Tugas, Kuis, Pre, Post, Ujian)</option>
              <option value="posttest">Evaluasi Akhir Bab 6 Saja</option>
              <option value="tugas">Tugas Terstruktur Saja</option>
              <option value="ujian">Ujian Sumatif Saja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid 4 Kartu Ekspor Utama */}
      <div className="export-cards-grid">
        {/* Kartu 1: Microsoft Excel (.xlsx) */}
        <div className="export-format-card card-excel">
          <div className="format-card-top">
            <div className="format-badge-icon">📊</div>
            <div>
              <h4 className="format-title">Microsoft Excel (.xlsx)</h4>
              <span className="format-meta">Multi-Sheet Workbook</span>
            </div>
          </div>
          <p className="format-description">
            Memuat 4 lembar kerja terpisah dalam satu berkas: <strong>Data Siswa</strong>, <strong>Rekapitulasi Nilai</strong>, <strong>Hasil Evaluasi Siswa</strong>, dan <strong>Matriks Jawaban Butir Soal</strong>.
          </p>
          <ul className="format-features">
            <li>✓ Lengkap dengan rumus bobot & status ketuntasan</li>
            <li>✓ Kompatibel dengan MS Excel, Google Sheets & LibreOffice</li>
          </ul>
          <button
            type="button"
            className="btn-download-format excel"
            onClick={() =>
              exportService.exportToExcel(students, grades, submissions, questions, config, exportFilters)
            }
          >
            📥 Unduh Excel (.xlsx)
          </button>
        </div>

        {/* Kartu 2: Skor Dikotomi SPSS & Jamovi */}
        <div className="export-format-card card-spss">
          <div className="format-card-top">
            <div className="format-badge-icon">🔬</div>
            <div>
              <h4 className="format-title">Skor Dikotomi SPSS & Jamovi</h4>
              <span className="format-meta">1 = Benar, 0 = Salah (CSV)</span>
            </div>
          </div>
          <p className="format-description">
            Format matriks psikometrik murni untuk uji validitas butir, reliabilitas (Cronbach Alpha / KR-20), dan analisis tingkat kesukaran di SPSS atau Jamovi.
          </p>
          <ul className="format-features">
            <li>✓ Header variabel baku (RESP_ID, NAMA, ITEM_1 s.d. ITEM_N)</li>
            <li>✓ Siap impor langsung ke SPSS Variable View</li>
          </ul>
          <button
            type="button"
            className="btn-download-format spss"
            onClick={() => exportService.exportDichotomyForSpss(submissions, questions, exportFilters)}
          >
            📊 Unduh Dikotomi SPSS/Jamovi
          </button>
        </div>

        {/* Kartu 3: Data Mentah CSV (.csv) */}
        <div className="export-format-card card-csv">
          <div className="format-card-top">
            <div className="format-badge-icon">📄</div>
            <div>
              <h4 className="format-title">Berkas Mentah CSV (.csv)</h4>
              <span className="format-meta">Format Standar UTF-8 BOM</span>
            </div>
          </div>
          <p className="format-description">
            Data mentah peserta didik dan seluruh komponen nilai dalam format CSV terstruktur dengan karakter UTF-8 BOM agar terbaca tanpa error pada berbagai spreadsheet.
          </p>
          <ul className="format-features">
            <li>✓ Ringan dan mudah diintegrasikan ke sistem dapodik/LMS</li>
            <li>✓ Menampilkan rincian NIS, NISN, dan nilai per komponen</li>
          </ul>
          <button
            type="button"
            className="btn-download-format csv"
            onClick={() => exportService.exportToCsv(students, grades, config, exportFilters)}
          >
            📥 Unduh File CSV (.csv)
          </button>
        </div>

        {/* Kartu 4: Laporan Siap Cetak / PDF */}
        <div className="export-format-card card-pdf">
          <div className="format-card-top">
            <div className="format-badge-icon">🖨️</div>
            <div>
              <h4 className="format-title">Laporan Resmi Siap Cetak / PDF</h4>
              <span className="format-meta">Dokumen Berkop & Tanda Tangan</span>
            </div>
          </div>
          <p className="format-description">
            Menghasilkan lembar laporan formal dengan kop resmi laboratorium kimia, tabel rekapitulasi nilai, statistik kelas, dan kolom tanda tangan guru pengampu serta kepala sekolah.
          </p>
          <ul className="format-features">
            <li>✓ Format tata letak kertas A4 siap cetak / Simpan ke PDF</li>
            <li>✓ Dilengkapi statistik ketuntasan klasikal & KKM</li>
          </ul>
          <button
            type="button"
            className="btn-download-format pdf"
            onClick={() => exportService.printOfficialReport(students, grades, config, exportFilters)}
          >
            🖨️ Cetak / Simpan Laporan PDF
          </button>
        </div>
      </div>

      {/* Bagian Impor Data (Excel / CSV) */}
      <div className="import-section-card">
        <div className="col-card-header">
          <div>
            <h3 className="col-card-title">📥 Impor Data Peserta Didik & Nilai</h3>
            <p className="col-card-sub">
              Unggah berkas Excel (.xlsx) atau CSV (.csv) untuk memperbarui data siswa atau nilai secara masal
            </p>
          </div>
          <div className="template-download-buttons">
            <button
              type="button"
              className="btn-template-download"
              onClick={() => exportService.downloadStudentTemplate()}
              title="Unduh format tabel contoh untuk data siswa"
            >
              📑 Template Siswa (.xlsx)
            </button>
            <button
              type="button"
              className="btn-template-download"
              onClick={() => exportService.downloadGradeTemplate(students)}
              title="Unduh format tabel contoh untuk nilai"
            >
              📑 Template Nilai (.xlsx)
            </button>
          </div>
        </div>

        {/* Area Drag & Drop / Input File */}
        <div
          className={`import-dropzone ${selectedFile ? 'has-file' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
          />
          <div className="dropzone-content">
            <span className="dropzone-icon">{selectedFile ? '📄' : '📁'}</span>
            {selectedFile ? (
              <div>
                <strong className="dropzone-file-name">{selectedFile.name}</strong>
                <p className="dropzone-file-meta">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Klik untuk mengganti berkas
                </p>
              </div>
            ) : (
              <div>
                <strong>Pilih Berkas Excel atau CSV untuk Diunggah</strong>
                <p>Mendukung format .xlsx, .xls, dan .csv (Tarik & lepas file atau klik untuk memilih)</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Parsing & Preview Validasi */}
        {isParsing && (
          <div className="parsing-loading-banner">
            <span className="spinner-dots">⏳</span>
            <span>Memeriksa struktur kolom dan memvalidasi data berkas...</span>
          </div>
        )}

        {parseResult && (
          <div className="import-preview-box">
            {parseResult.error ? (
              <div className="import-error-banner">
                <strong>⚠️ Terjadi Kesalahan Format:</strong> {parseResult.error}
              </div>
            ) : (
              <div>
                <div className="preview-top-bar">
                  <div className="preview-badge-group">
                    <span className="preview-type-badge">
                      Tipe Data: <strong>{parseResult.type === 'students' ? 'DATA PESERTA DIDIK' : 'DATA NILAI SISWA'}</strong>
                    </span>
                    <span className="preview-count-badge">
                      Ditemukan: <strong>{parseResult.data.length}</strong> Baris Data Valid
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-primary-action success"
                    onClick={handleExecuteImport}
                  >
                    ✓ Terapkan & Simpan ke Sistem
                  </button>
                </div>

                {/* Cuplikan 5 Baris Pertama */}
                <div className="table-responsive" style={{ maxHeight: '220px', marginTop: '12px' }}>
                  <table className="teacher-data-table">
                    <thead>
                      <tr>
                        {parseResult.type === 'students' ? (
                          <>
                            <th>Nama Siswa</th>
                            <th>NIS</th>
                            <th>Kelas</th>
                            <th>Gender</th>
                            <th>Email</th>
                          </>
                        ) : (
                          <>
                            <th>ID Siswa</th>
                            <th>Tugas</th>
                            <th>Kuis</th>
                            <th>Pretest</th>
                            <th>Posttest</th>
                            <th>Ujian</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {parseResult.data.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          {parseResult.type === 'students' ? (
                            <>
                              <td><strong>{row.name}</strong></td>
                              <td>{row.nis || '-'}</td>
                              <td>{row.kelas}</td>
                              <td>{row.gender || '-'}</td>
                              <td>{row.email || '-'}</td>
                            </>
                          ) : (
                            <>
                              <td><strong>{row.studentId}</strong></td>
                              <td>{row.tugas}</td>
                              <td>{row.kuis}</td>
                              <td>{row.pretest}</td>
                              <td>{row.posttest}</td>
                              <td>{row.ujian}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parseResult.data.length > 5 && (
                  <p className="preview-more-hint">
                    ...dan {parseResult.data.length - 5} baris data lainnya siap diimpor.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
