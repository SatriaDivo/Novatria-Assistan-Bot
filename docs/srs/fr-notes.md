# FR: Manajemen Catatan & Produktivitas

Bagian inti dari alat bantu komunitas untuk mendokumentasikan rutinitas, perencanaan, dan tautan.

## 1. Pencatatan dan Manajemen Tugas
- **FR.NOTES.01 (`/catat`):** Fungsi mencatat hal umum. Membutuhkan input `isi`. Bot meneruskan data ini dan menampilkannya di *channel* pencarian berprioritas nama (misal: `catatan`).
- **FR.NOTES.02 (`/todo`):** Fungsi manajemen target pengerjaan. Menerima argument wajib `tugas`. Pada database Google Sheet, entri baru ini otomatis mendapatkan tag status kosong (aktif) yang siap diubah.
- **FR.NOTES.03 (`/done`):** Aksi penanda penyelesaian tugas. Menerima argument `id`. Fungsi ini secara logis mencari ID dalam sistem backend dan menimpa sel *Status* untuk ditandai *Selesai*.

## 2. Repositori Referensi
- **FR.NOTES.04 (`/link`):** Fungsi pengarsipan tautan / URL spesifik (bookmark). Menerima argumen wajib `url`, `judul`, dan opsional `catatan`. Disalurkan ke kanal `link-penting`.
- **FR.NOTES.05 (`/arsip`):** Dokumentasi berkas/teks penting atau arsip bersejarah. Membutuhkan argument `isi`.

## 3. Sistem Penjadwalan & Komunikasi Sosial
- **FR.NOTES.06 (`/jadwal`):** Menjadwalkan sebuah pertemuan/agenda resmi (meeting/diskusi). 
  - *Argumen wajib:* `judul`, `jam`. 
  - *Opsional:* `tanggal`, `bulan`, `tahun`, `selesai` (durasi), dan `catatan`.
  - Jika tanggal/bulan/tahun tidak disertakan, sistem menganggap jadwal merupakan hari ini (*Today*).
- **FR.NOTES.07 (`/mabar`):** Sub-rutin spesifik bagi sistem pencarian lawan main (*gaming session/matchmaking*).
  - *Argumen wajib:* `game`, `jam`.
  - Kanal Prioritas Pencarian: Bot memindai kanal berlabel spesifik `info-mabar`, `mabar-chat`, `jadwal-mabar`, atau kembali menggunakan kanal eksekusi semula.

## 4. Mekanisme "Smart Channel Finder" (Prioritas Pencarian Kanal Tujuan)
Seluruh instruksi pada modul ini dilengkapi utilitas modul cerdas `cariChannel`.
Bot tidak perlu *hardcode* pengidentifikasi (ID) ruang. Saat perintah berjalan, bot memindai struktur pohon Server, lalu memilih nama ruang yang relevan (mengandung kata kunci fungsional, misal "todo" untuk command todo) menggunakan pola RegExp tak peduli besar-kecil huruf (*Case-Insensitive*). Jika tidak ada satupun yang cocok, barulah bot membalas pada kanal semula (*Current Channel*).