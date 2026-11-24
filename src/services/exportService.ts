/**
 * services/exportService.ts
 * Layanan Ekspor & Impor Data Komprehensif untuk Panel Guru ReaksiLab XI:
 * - Format Excel (.xlsx) dengan SheetJS (xlsx)
 * - Format CSV (.csv) berstandar UTF-8 BOM
 * - Format Skor Dikotomi (1 = benar, 0 = salah) siap olah SPSS & Jamovi
 * - Format Laporan Siap Cetak / PDF dengan Kop Sekolah dan Rekapitulasi Resmi
 * - Parser Impor Excel & CSV dengan validasi cerdas dan template unduhan
 */
import * as XLSX from 'xlsx';
import type {
  StudentItem,
  StudentGrade,
  StudentSubmission,
  QuestionItem,
  GradingWeightConfig,
} from '../types';

export interface ExportFilterOptions {
  kelas?: string; // 'all' atau nama kelas spesifik
  studentId?: string; // 'all' atau studentId spesifik
  assessmentType?: 'all' | 'tugas' | 'kuis' | 'pretest' | 'posttest' | 'ujian';
}

/**
 * Helper untuk memicu unduhan file di browser
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

export const exportService = {
  // ================= 1. EKSPOR EXCEL (.XLSX) MULTI-SHEET =================
  exportToExcel(
    students: StudentItem[],
    grades: StudentGrade[],
    submissions: StudentSubmission[],
    questions: QuestionItem[],
    config: GradingWeightConfig,
    filters: ExportFilterOptions = {}
  ): void {
    const workbook = XLSX.utils.book_new();

    // 1. Filter Siswa & Nilai
    let filteredStudents = [...students];
    if (filters.kelas && filters.kelas !== 'all') {
      filteredStudents = filteredStudents.filter((s) => s.kelas === filters.kelas);
    }
    if (filters.studentId && filters.studentId !== 'all') {
      filteredStudents = filteredStudents.filter((s) => s.id === filters.studentId);
    }

    const studentMap = new Map(filteredStudents.map((s) => [s.id, s]));

    // Sheet 1: Data Peserta Didik
    const studentsSheetData = filteredStudents.map((s, idx) => ({
      No: idx + 1,
      'ID Siswa': s.id,
      NIS: s.nis || '-',
      NISN: s.nisn || '-',
      'Nama Lengkap': s.name,
      Kelas: s.kelas,
      'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : s.gender === 'P' ? 'Perempuan' : '-',
      Email: s.email || '-',
    }));
    const wsStudents = XLSX.utils.json_to_sheet(studentsSheetData);
    XLSX.utils.book_append_sheet(workbook, wsStudents, 'Data Siswa');

    // Sheet 2: Rekapitulasi Nilai & Ketuntasan
    const gradesSheetData = grades
      .filter((g) => studentMap.has(g.studentId))
      .map((g, idx) => {
        const student = studentMap.get(g.studentId);
        return {
          No: idx + 1,
          NIS: student?.nis || '-',
          'Nama Siswa': student?.name || g.studentId,
          Kelas: student?.kelas || '-',
          [`Tugas (${config.tugas}%)`]: g.tugas,
          [`Kuis (${config.kuis}%)`]: g.kuis,
          [`Pretest (${config.pretest}%)`]: g.pretest,
          [`Posttest (${config.posttest}%)`]: g.posttest,
          [`Ujian (${config.ujian}%)`]: g.ujian,
          'Nilai Akhir': g.finalScore,
          'Batas KKM': config.kkm,
          'Status Ketuntasan': g.isPassed ? 'TUNTAS' : 'BELUM TUNTAS',
          Catatan: g.notes || '-',
        };
      });
    const wsGrades = XLSX.utils.json_to_sheet(gradesSheetData);
    XLSX.utils.book_append_sheet(workbook, wsGrades, 'Rekap Nilai');

    // Sheet 3: Hasil Evaluasi Bab 6
    const filteredSubmissions = submissions.filter((sub) => {
      if (filters.kelas && filters.kelas !== 'all' && sub.kelas !== filters.kelas) return false;
      if (filters.studentId && filters.studentId !== 'all' && sub.studentId !== filters.studentId) return false;
      return true;
    });

    const evalSheetData = filteredSubmissions.map((sub, idx) => ({
      No: idx + 1,
      'ID Pengerjaan': sub.id,
      'Nama Siswa': sub.studentName,
      Kelas: sub.kelas,
      'Waktu Submisi': sub.submittedAt,
      'Jumlah Benar': sub.correctCount,
      'Jumlah Salah': sub.incorrectCount,
      'Total Butir': sub.totalQuestions,
      'Nilai Evaluasi': sub.score,
      Status: sub.score >= config.kkm ? 'TUNTAS' : 'REMEDIAL',
    }));
    const wsEval = XLSX.utils.json_to_sheet(evalSheetData);
    XLSX.utils.book_append_sheet(workbook, wsEval, 'Hasil Evaluasi Bab 6');

    // Sheet 4: Matriks Skor Dikotomi (1 = benar, 0 = salah)
    const publishedQuestions = questions.filter((q) => q.isPublished).sort((a, b) => a.order - b.order);
    const dichotomySheetData = filteredSubmissions.map((sub, idx) => {
      const row: Record<string, string | number> = {
        No: idx + 1,
        'ID Responden': sub.studentId,
        'Nama Responden': sub.studentName,
        Kelas: sub.kelas,
      };
      let totalBenar = 0;
      publishedQuestions.forEach((q) => {
        const itemScore = sub.dichotomyScores?.[q.id] !== undefined ? sub.dichotomyScores[q.id] : (sub.answers?.[q.id] === q.correctKey ? 1 : 0);
        row[`Soal_${q.id}`] = itemScore;
        totalBenar += itemScore;
      });
      row['Total_Benar'] = totalBenar;
      row['Skor_Akhir'] = sub.score;
      return row;
    });
    const wsDichotomy = XLSX.utils.json_to_sheet(dichotomySheetData);
    XLSX.utils.book_append_sheet(workbook, wsDichotomy, 'Matriks Dikotomi SPSS');

    // Tulis ke binary array & trigger unduh
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const cleanKelasName = filters.kelas && filters.kelas !== 'all' ? `_${filters.kelas.replace(/\s+/g, '_')}` : '';
    triggerDownload(blob, `ReaksiLab_XI_Rekapitulasi_Lengkap${cleanKelasName}_${Date.now()}.xlsx`);
  },

  // ================= 2. EKSPOR DATA MENTAH CSV (.CSV) =================
  exportToCsv(
    students: StudentItem[],
    grades: StudentGrade[],
    config: GradingWeightConfig,
    filters: ExportFilterOptions = {}
  ): void {
    let filteredStudents = [...students];
    if (filters.kelas && filters.kelas !== 'all') {
      filteredStudents = filteredStudents.filter((s) => s.kelas === filters.kelas);
    }
    const gradeMap = new Map(grades.map((g) => [g.studentId, g]));

    const headers = [
      'ID_SISWA',
      'NIS',
      'NISN',
      'NAMA_SISWA',
      'KELAS',
      'JENIS_KELAMIN',
      'EMAIL',
      'NILAI_TUGAS',
      'NILAI_KUIS',
      'NILAI_PRETEST',
      'NILAI_POSTTEST',
      'NILAI_UJIAN',
      'NILAI_AKHIR',
      'KKM',
      'STATUS_KETUNTASAN',
    ];

    const rows = filteredStudents.map((s) => {
      const g = gradeMap.get(s.id);
      return [
        `"${s.id}"`,
        `"${s.nis || ''}"`,
        `"${s.nisn || ''}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.kelas}"`,
        `"${s.gender || '-'}"`,
        `"${s.email || ''}"`,
        g ? g.tugas : 0,
        g ? g.kuis : 0,
        g ? g.pretest : 0,
        g ? g.posttest : 0,
        g ? g.ujian : 0,
        g ? g.finalScore : 0,
        config.kkm,
        g ? (g.isPassed ? '"TUNTAS"' : '"BELUM TUNTAS"') : '"BELUM DIINPUT"',
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const cleanKelasName = filters.kelas && filters.kelas !== 'all' ? `_${filters.kelas.replace(/\s+/g, '_')}` : '';
    triggerDownload(blob, `ReaksiLab_XI_Data_Nilai${cleanKelasName}_${Date.now()}.csv`);
  },

  // ================= 3. EKSPOR MATRIKS SKOR DIKOTOMI UNTUK SPSS & JAMOVI =================
  exportDichotomyForSpss(
    submissions: StudentSubmission[],
    questions: QuestionItem[],
    filters: ExportFilterOptions = {}
  ): void {
    const publishedQuestions = questions.filter((q) => q.isPublished).sort((a, b) => a.order - b.order);

    let filtered = submissions;
    if (filters.kelas && filters.kelas !== 'all') {
      filtered = filtered.filter((s) => s.kelas === filters.kelas);
    }

    if (filtered.length === 0) {
      alert('Tidak ada data submisi evaluasi untuk diekspor ke SPSS/Jamovi.');
      return;
    }

    // Format Header Standar SPSS: Baris pertama berupa nama variabel pendek tanpa spasi
    const headers = [
      'RESPONDEN_ID',
      'NAMA',
      'KELAS',
      ...publishedQuestions.map((q) => `ITEM_${q.id}`),
      'TOTAL_SKOR',
    ];

    const rows = filtered.map((sub, idx) => {
      const itemScores = publishedQuestions.map((q) => {
        if (sub.dichotomyScores?.[q.id] !== undefined) {
          return sub.dichotomyScores[q.id];
        }
        return sub.answers?.[q.id] === q.correctKey ? 1 : 0;
      });

      const total = itemScores.reduce((acc, val) => acc + val, 0);

      return [
        `"RESP_${String(idx + 1).padStart(3, '0')}"`,
        `"${sub.studentName.replace(/"/g, '""')}"`,
        `"${sub.kelas}"`,
        ...itemScores,
        total,
      ].join(',');
    });

    // Baris info variabel metadata di komentar awal jika diinginkan, namun file CSV murni lebih mudah di-import ke SPSS/Jamovi
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const cleanKelas = filters.kelas && filters.kelas !== 'all' ? `_${filters.kelas.replace(/\s+/g, '_')}` : '';
    triggerDownload(blob, `SPSS_Jamovi_Dikotomi_ReaksiLab${cleanKelas}_${Date.now()}.csv`);
  },

  // ================= 4. CETAK LAPORAN RESMI / PDF =================
  printOfficialReport(
    students: StudentItem[],
    grades: StudentGrade[],
    config: GradingWeightConfig,
    filters: ExportFilterOptions = {}
  ): void {
    let filteredStudents = [...students];
    if (filters.kelas && filters.kelas !== 'all') {
      filteredStudents = filteredStudents.filter((s) => s.kelas === filters.kelas);
    }
    const gradeMap = new Map(grades.map((g) => [g.studentId, g]));

    // Hitung statistik
    const targetGrades = filteredStudents
      .map((s) => gradeMap.get(s.id)?.finalScore)
      .filter((sc): sc is number => typeof sc === 'number');

    const highest = targetGrades.length > 0 ? Math.max(...targetGrades) : 0;
    const lowest = targetGrades.length > 0 ? Math.min(...targetGrades) : 0;
    const average = targetGrades.length > 0 ? Math.round((targetGrades.reduce((a, b) => a + b, 0) / targetGrades.length) * 10) / 10 : 0;
    const passedCount = filteredStudents.filter((s) => {
      const g = gradeMap.get(s.id);
      return g && g.isPassed;
    }).length;
    const masteryPercentage = filteredStudents.length > 0 ? Math.round((passedCount / filteredStudents.length) * 100) : 0;

    const kelasTitle = filters.kelas && filters.kelas !== 'all' ? `KELAS ${filters.kelas.toUpperCase()}` : 'SELURUH KELAS XI';
    const printDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up terblokir oleh browser. Harap izinkan pop-up untuk mencetak / menyimpan PDF laporan.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>Laporan Hasil Belajar Laju Reaksi - ${kelasTitle}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm 15mm 20mm 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #1e293b; line-height: 1.4; margin: 0; padding: 15px; }
          .kop-surat { display: flex; align-items: center; border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .kop-logo { font-size: 38px; margin-right: 18px; }
          .kop-text h2 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px; color: #1e3a8a; }
          .kop-text h3 { margin: 3px 0; font-size: 15px; font-weight: 600; color: #334155; }
          .kop-text p { margin: 0; font-size: 11px; color: #64748b; }
          .doc-title { text-align: center; margin: 15px 0 20px 0; }
          .doc-title h1 { margin: 0; font-size: 16px; text-transform: uppercase; text-decoration: underline; color: #0f172a; }
          .doc-title p { margin: 4px 0 0 0; font-size: 12px; color: #475569; }
          .meta-grid { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 12px; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; width: 48%; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; text-align: center; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .badge-tuntas { color: #166534; font-weight: bold; background: #dcfce7; padding: 2px 6px; border-radius: 4px; display: inline-block; }
          .badge-remedial { color: #991b1b; font-weight: bold; background: #fee2e2; padding: 2px 6px; border-radius: 4px; display: inline-block; }
          .summary-card { display: flex; gap: 10px; margin-bottom: 25px; }
          .summary-item { flex: 1; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center; background: #f8fafc; }
          .summary-label { font-size: 10px; color: #64748b; text-transform: uppercase; }
          .summary-val { font-size: 14px; font-weight: bold; color: #1e3a8a; margin-top: 2px; }
          .signature-section { display: flex; justify-content: space-between; margin-top: 35px; page-break-inside: avoid; font-size: 12px; }
          .sig-box { width: 40%; text-align: center; }
          .sig-space { height: 60px; }
          .sig-name { font-weight: bold; text-decoration: underline; }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; padding: 10px; background: #e0f2fe; border: 1px solid #7dd3fc; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
          <span>📄 <strong>Laporan Siap Cetak</strong>: Klik tombol Cetak / Simpan PDF untuk mencetak atau menyimpan dokumen resmi ini.</span>
          <button onclick="window.print()" style="padding: 6px 14px; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">🖨️ Cetak / Simpan PDF</button>
        </div>

        <div class="kop-surat">
          <div class="kop-logo">⚗️</div>
          <div class="kop-text">
            <h2>REAKSILAB XI – LABORATORIUM DIGITAL KIMIA</h2>
            <h3>LAPORAN RESMI HASIL EVALUASI PEMBELAJARAN LAJU REAKSI</h3>
            <p>Platform Pembelajaran Berbasis Tiga Representasi Kimia & Praktikum Virtual Interaktif SMA Kelas XI</p>
          </div>
        </div>

        <div class="doc-title">
          <h1>REKAPITULASI CAPAIAN HASIL BELAJAR SISWA</h1>
          <p>Materi Pokok: Laju Reaksi, Teori Tumbukan, dan Faktor Penentu Kelajuan Reaksi</p>
        </div>

        <div class="meta-grid">
          <div class="meta-box">
            <div><strong>Sasaran Kelas:</strong> ${kelasTitle}</div>
            <div><strong>Kriteria Ketuntasan (KKM):</strong> ${config.kkm}</div>
            <div><strong>Tahun Pembelajaran:</strong> 2026/2027</div>
          </div>
          <div class="meta-box">
            <div><strong>Bobot Nilai:</strong> Tugas ${config.tugas}%, Kuis ${config.kuis}%, Pre ${config.pretest}%, Post ${config.posttest}%, UAS ${config.ujian}%</div>
            <div><strong>Tanggal Dokumen:</strong> ${printDate}</div>
            <div><strong>Total Peserta Didik:</strong> ${filteredStudents.length} Siswa</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-item">
            <div class="summary-label">Rata-Rata Nilai</div>
            <div class="summary-val">${average}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Nilai Tertinggi</div>
            <div class="summary-val">${highest}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Nilai Terendah</div>
            <div class="summary-val">${lowest}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Ketuntasan Klasikal</div>
            <div class="summary-val">${masteryPercentage}% (${passedCount}/${filteredStudents.length})</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th style="width: 60px;">NIS</th>
              <th>Nama Lengkap Peserta Didik</th>
              <th style="width: 70px;">Kelas</th>
              <th style="width: 45px;">Tugas</th>
              <th style="width: 45px;">Kuis</th>
              <th style="width: 45px;">Pre</th>
              <th style="width: 45px;">Post</th>
              <th style="width: 45px;">Ujian</th>
              <th style="width: 55px;">Nilai Akhir</th>
              <th style="width: 80px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredStudents
              .map((s, idx) => {
                const g = gradeMap.get(s.id);
                const finalScore = g ? g.finalScore : '-';
                const isPassed = g ? g.isPassed : false;
                return `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td class="text-center">${s.nis || '-'}</td>
                  <td><strong>${s.name}</strong></td>
                  <td class="text-center">${s.kelas}</td>
                  <td class="text-center">${g ? g.tugas : '-'}</td>
                  <td class="text-center">${g ? g.kuis : '-'}</td>
                  <td class="text-center">${g ? g.pretest : '-'}</td>
                  <td class="text-center">${g ? g.posttest : '-'}</td>
                  <td class="text-center">${g ? g.ujian : '-'}</td>
                  <td class="text-center" style="font-weight: bold; background: #f8fafc;">${finalScore}</td>
                  <td class="text-center">
                    ${
                      g
                        ? isPassed
                          ? '<span class="badge-tuntas">TUNTAS</span>'
                          : '<span class="badge-remedial">BELUM TUNTAS</span>'
                        : '<span style="color: #94a3b8;">-</span>'
                    }
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="sig-box">
            <div>Mengetahui,</div>
            <div>Kepala Sekolah SMA</div>
            <div class="sig-space"></div>
            <div class="sig-name">Dr. H. Bambang Sudarsono, M.Pd.</div>
            <div>NIP. 19740512 199903 1 002</div>
          </div>
          <div class="sig-box">
            <div>Kota Pembelajaran, ${printDate}</div>
            <div>Guru Pengampu Mata Pelajaran Kimia</div>
            <div class="sig-space"></div>
            <div class="sig-name">Nurul Hidayati, S.Pd., M.Si.</div>
            <div>NIP. 19860824 201001 2 018</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  },

  // ================= 5. DOWNLOAD CONTOH TEMPLATE EXCEL UNTUK IMPOR =================
  downloadStudentTemplate(): void {
    const templateData = [
      {
        NIS: '22110',
        NISN: '0061234510',
        'Nama Lengkap': 'Budi Prasetyo Utomo',
        Kelas: 'XI MIPA 1',
        'Jenis Kelamin (L/P)': 'L',
        Email: 'budi.prasetyo@siswa.reaksilab.id',
      },
      {
        NIS: '22111',
        NISN: '0061234511',
        'Nama Lengkap': 'Dewi Lestari Anggraeni',
        Kelas: 'XI MIPA 1',
        'Jenis Kelamin (L/P)': 'P',
        Email: 'dewi.lestari@siswa.reaksilab.id',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerDownload(blob, 'Template_Impor_Siswa_ReaksiLab.xlsx');
  },

  downloadGradeTemplate(students: StudentItem[]): void {
    const templateData = students.map((s) => ({
      'ID Siswa (Jangan Diubah)': s.id,
      NIS: s.nis,
      'Nama Siswa': s.name,
      Kelas: s.kelas,
      'Nilai Tugas': 85,
      'Nilai Kuis': 80,
      'Nilai Pretest': 70,
      'Nilai Posttest': 85,
      'Nilai Ujian': 88,
      Catatan: 'Tuntas dengan capaian baik',
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Nilai');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerDownload(blob, 'Template_Impor_Nilai_ReaksiLab.xlsx');
  },

  // ================= 6. PARSER FILE UNGGAHAN (.XLSX / .CSV) =================
  async parseUploadedFile(file: File): Promise<{
    type: 'students' | 'grades' | 'unknown';
    data: any[];
    error?: string;
  }> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          if (!buffer) {
            resolve({ type: 'unknown', data: [], error: 'Gagal membaca isi file.' });
            return;
          }

          const workbook = XLSX.read(buffer, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            resolve({ type: 'unknown', data: [], error: 'File Excel tidak memiliki lembar kerja (sheet).' });
            return;
          }

          const sheet = workbook.Sheets[firstSheetName];
          const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

          if (!rawRows || rawRows.length === 0) {
            resolve({ type: 'unknown', data: [], error: 'File tidak memuat baris data.' });
            return;
          }

          // Deteksi tipe data berdasarkan nama kolom
          const firstRow = rawRows[0];
          const keys = Object.keys(firstRow).map((k) => k.toLowerCase());

          // 1. Apakah data nilai? (ada kata nilai / tugas / kuis)
          const isGradeSheet = keys.some((k) => k.includes('tugas') || k.includes('kuis') || k.includes('ujian') || k.includes('posttest'));
          if (isGradeSheet) {
            const parsedGrades: StudentGrade[] = rawRows.map((r) => {
              const studentId = r['ID Siswa (Jangan Diubah)'] || r['ID_SISWA'] || r['studentId'] || r['ID Siswa'] || '';
              const tugas = Number(r['Nilai Tugas'] || r['NILAI_TUGAS'] || r['tugas'] || 0);
              const kuis = Number(r['Nilai Kuis'] || r['NILAI_KUIS'] || r['kuis'] || 0);
              const pretest = Number(r['Nilai Pretest'] || r['NILAI_PRETEST'] || r['pretest'] || 0);
              const posttest = Number(r['Nilai Posttest'] || r['NILAI_POSTTEST'] || r['posttest'] || 0);
              const ujian = Number(r['Nilai Ujian'] || r['NILAI_UJIAN'] || r['ujian'] || 0);
              const notes = String(r['Catatan'] || r['notes'] || '');

              return {
                studentId,
                tugas,
                kuis,
                pretest,
                posttest,
                ujian,
                finalScore: 0,
                isPassed: false,
                notes,
              };
            });

            resolve({ type: 'grades', data: parsedGrades });
            return;
          }

          // 2. Data Siswa
          const parsedStudents: StudentItem[] = rawRows.map((r, idx) => {
            const name = String(r['Nama Lengkap'] || r['Nama Siswa'] || r['NAMA_SISWA'] || r['name'] || `Siswa Baru ${idx + 1}`);
            const nis = String(r['NIS'] || r['nis'] || '');
            const nisn = String(r['NISN'] || r['nisn'] || '');
            const kelas = String(r['Kelas'] || r['KELAS'] || r['kelas'] || 'XI MIPA 1');
            const rawGender = String(r['Jenis Kelamin (L/P)'] || r['JENIS_KELAMIN'] || r['gender'] || '').toUpperCase();
            const gender: 'L' | 'P' | undefined = rawGender.startsWith('L') ? 'L' : rawGender.startsWith('P') ? 'P' : undefined;
            const email = String(r['Email'] || r['EMAIL'] || r['email'] || '');
            const id = r['ID Siswa'] || r['ID_SISWA'] || r['id'] || `std-imp-${Date.now()}-${idx}`;

            return {
              id,
              nis,
              nisn,
              name,
              kelas,
              gender,
              email,
            };
          });

          resolve({ type: 'students', data: parsedStudents });
        } catch (err: any) {
          console.error('Error parsing file:', err);
          resolve({ type: 'unknown', data: [], error: `Format file tidak valid atau rusak: ${err.message}` });
        }
      };

      reader.onerror = () => {
        resolve({ type: 'unknown', data: [], error: 'Gagal membaca berkas dari perangkat.' });
      };

      reader.readAsBinaryString(file);
    });
  },
};
