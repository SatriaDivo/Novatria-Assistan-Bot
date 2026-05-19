# Objectives

Tujuan dari pengembangan dan implementasi Novatria-Bot dirumuskan dalam poin-poini objektif berikut:

## 1. Sentralisasi Manajemen Produktivitas
- **Tujuan:** Menyediakan alat pencatatan yang terintegrasi (catatan, tugas/todo, arsip, dan link) langsung dari ruang obrolan Discord.
- **Indikator Keberhasilan:** Anggota dapat membuat, melihat daftar, menyelesaikan (`/done`), dan menghapus tugas langsung melalui *Slash Commands* Discord yang akan terekam ke Google Sheets.

## 2. Peningkatan Kolaborasi dan Penjadwalan
- **Tujuan:** Mempermudah pengaturan pertemuan rutin, agenda diskusi, hingga jadwal bermain (*mabar*) dengan peringatan yang tepat waktu.
- **Indikator Keberhasilan:** Terciptanya sistem notifikasi otomatis dan sinkronisasi ke kalender yang bisa diakses oleh komunitas.

## 3. Optimalisasi Workflow Capture The Flag (CTF)
- **Tujuan:** Mengotomatiskan pelacakan jadwal kompetisi CTF, progres per *challenge*, dan sentralisasi repositori *writeup*.
- **Indikator Keberhasilan:** Berfungsinya fitur bot untuk mengambil data dari CTFtime.org, memberikan notifikasi H-3 sebelum lomba (melalui `/ctfnotify`), serta menyimpan dokumentasi tantangan secara rapi ke *channel* spesifik (`ctf-target`, `ctf-writeup`).

## 4. Integrasi Infrastruktur Bebas Biaya (Zero-Cost)
- **Tujuan:** Menjaga biaya operasional komunitas serendah mungkin tanpa mengorbankan fungsionalitas *database* dan komputasi dasar.
- **Indikator Keberhasilan:** Seluruh sistem *backend* persisten (penyimpanan data) sepenuhnya menggunakan ekosistem Google (Google Sheets & Apps Script), sementara sistem *bot runtime* berjalan lokal melalui Docker.

## 5. Keamanan Operasional & Log Tracking
- **Tujuan:** Meminimalisir penyalahgunaan (spamming atau penghapusan data sepihak) dan memastikan setiap aksi tercatat dengan baik.
- **Indikator Keberhasilan:** Semua perintah sensitif (`/hapus`) dibatasi oleh Role ID tertentu. Semua tindakan tercatat di *channel* `log-aktivitas`. Pembatasan unggahan otomatis file berukuran besar dari GitHub (`/tantangan`) dapat dihindari lewat fitur *chunking*.