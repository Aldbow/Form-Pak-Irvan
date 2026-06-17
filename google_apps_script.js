/**
 * ============================================================================
 * SCRIPT BACKEND UNTUK GOOGLE SHEETS
 * ============================================================================
 * 
 * CARA PENGGUNAAN:
 * 1. Buka Google Sheets kosong baru, pastikan tab di bawah bernama "Sheet1" (ubah jika namanya "Lembar1").
 * 2. Klik menu "Ekstensi" > "Apps Script".
 * 3. Hapus semua kode bawaan yang ada di sana, lalu COPY semua kode di file ini dan PASTE ke sana.
 * 4. Klik ikon Disket (Save).
 * 5. Di bagian atas layar, pilih fungsi "initialSetup", lalu klik tombol "Jalankan" (Run).
 *    (Beri izin akses/Review Permissions jika diminta oleh Google).
 * 6. Klik tombol biru "Deploy" (di pojok kanan atas) > "New deployment".
 * 7. Pilih tipe "Web app".
 * 8. Set "Execute as" menjadi "Me" (Email Anda).
 * 9. Set "Who has access" menjadi "Anyone" (PENTING: Jika tidak diset 'Anyone', form akan gagal mengirim data).
 * 10. Klik Deploy, salin "Web app URL" yang muncul.
 * 11. Buka file `script.js` di folder project ini, cari variabel `googleScriptURL`, dan ganti URL-nya dengan URL yang baru Anda salin.
 * ============================================================================
 */

const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();

// Mapping dari nama field HTML ke Header tabel yang rapi dan mudah dibaca di Excel/Sheets
const headerMapping = {
  'timestamp': 'Waktu Pengisian',
  'nama': 'Nama Responden',
  'satker': 'Satuan Kerja / Unit',
  'jabatan': 'Jabatan / Peran',
  'jabatanLainnya': 'Jabatan Lainnya',
  'tanggal': 'Tanggal (Sesuai Form)',
  'U_Q1': 'Urgency - (1) Sistem Monitoring',
  'U_Q2': 'Urgency - (2) Kepatuhan SPSE',
  'U_Q3': 'Urgency - (3) Integritas Proses',
  'U_Q4': 'Urgency - (4) Kapasitas SDM',
  'S_Q1': 'Seriousness - (1) Sistem Monitoring',
  'S_Q2': 'Seriousness - (2) Kepatuhan SPSE',
  'S_Q3': 'Seriousness - (3) Integritas Proses',
  'S_Q4': 'Seriousness - (4) Kapasitas SDM',
  'G_Q1': 'Growth - (1) Sistem Monitoring',
  'G_Q2': 'Growth - (2) Kepatuhan SPSE',
  'G_Q3': 'Growth - (3) Integritas Proses',
  'G_Q4': 'Growth - (4) Kapasitas SDM',
  'catatan': 'Catatan / Komentar'
};

// Urutan kolom baku agar tabel selalu rapi urutannya
const expectedColumns = [
  'timestamp', 'nama', 'satker', 'jabatan', 'jabatanLainnya', 'tanggal',
  'U_Q1', 'U_Q2', 'U_Q3', 'U_Q4',
  'S_Q1', 'S_Q2', 'S_Q3', 'S_Q4',
  'G_Q1', 'G_Q2', 'G_Q3', 'G_Q4',
  'catatan'
];

/**
 * Fungsi ini WAJIB dijalankan satu kali secara manual (melalui tombol Run di editor) 
 * untuk menyambungkan script dengan ID Spreadsheet Anda.
 */
function initialSetup () {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

/**
 * Fungsi utama yang menerima kiriman data POST (dari fetch website)
 */
function doPost (e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);
    
    // Jika sheet masih kosong (baris 1 belum ada apa-apa), maka format tabelnya
    if (sheet.getLastRow() === 0) {
      // 1. Buat Header yang mudah dibaca
      const friendlyHeaders = expectedColumns.map(col => headerMapping[col] || col);
      const headerRange = sheet.getRange(1, 1, 1, friendlyHeaders.length);
      headerRange.setValues([friendlyHeaders]);
      
      // 2. Beri warna latar belakang Indigo dan teks Putih Tebal agar rapi
      headerRange.setBackground('#4F46E5');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      
      // 3. Kunci (freeze) baris pertama agar tidak ikut tergulung saat di-scroll ke bawah
      sheet.setFrozenRows(1);
    }

    // Susun data baru yang masuk dari form (e.parameter) sesuai urutan expectedColumns
    const newRow = expectedColumns.map(function(col) {
      if (col === 'timestamp') return new Date();
      return e.parameter[col] || ''; 
    });

    const rowToWrite = sheet.getLastRow() + 1;
    sheet.getRange(rowToWrite, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': rowToWrite }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  finally {
    lock.releaseLock();
  }
}
