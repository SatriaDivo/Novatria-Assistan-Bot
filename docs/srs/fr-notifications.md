# FR: Sistem Otomasi & Notifikasi

Spesifikasi fungsional untuk rutinitas latar belakang (Background Jobs/Cron) yang dijalankan bot secara otomatis tanpa dipicu oleh intervensi langsung dari pengguna.

## 1. CTFtime Reminder Engine (H-3)
Bot menampung modul penjadwalan otomatis yang dirancang untuk secara independen menelusuri API lomba CTF dan memberikan ringkasan acara yang akan berlangsung tepat pada **3 hari sebelum hari H (H-3)**.

### A. Mekanisme *Cron / Interval*
- Pengecekan tidak dilakukan setiap detik (demi mencegah pembatasan akses API/Rate Limit).
- Bot menjalankan *check-cycle* (Siklus Cek) pada jam-jam absolut Waktu Indonesia Barat (WIB):
  - **Pukul 00:00 WIB** (Awal hari)
  - **Pukul 08:00 WIB** (Pagi hari)
  - **Pukul 17:00 WIB** (Sore hari)
- *Edge Case (Sistem Baru Hidup):* Ketika aplikasi pertama kali dinyalakan (startup container), bot mengeksekusi siklus cek sekali tanpa menunggu jadwal, untuk mengantisipasi *downtime* yang melewatkan jadwal notifikasi sebelumnya.

### B. Manajer Konfigurasi Notifikasi (`/ctfnotify`)
Sistem peringatan ini bersifat fleksibel dan dapat dikendalikan langsung melalui antarmuka bot.
- **Toggle On/Off:** Admin/Pengguna (di dalam zona CTF) mengeksekusi `/ctfnotify status: on` atau `off`.
- **Status Persistence:** Kondisi aktif/mati tidak di-reset ketika *container* Docker mengalami proses *re-build* atau sistem tertidur. Konfigurasi ini ditulis dan ditimpa di dalam fail statis pada alamat `./data/ctftime-settings.json`.

### C. Algoritma Anti-Spam (Data Persistensi)
Untuk mencegah satu acara kompetisi yang sama dikirim tiga kali berturut-turut pada jam 00:00, 08:00, dan 17:00:
- Bot memanfaatkan array penyimpanan `seen_events` (Riwayat pengingat terpublikasi).
- File diletakkan aman di `./data/ctftime-seen.json`.
- Logika eksekusi memindai `CTF_ID`, lalu melewati (skip) pengumuman CTF bila ID tersebut telah tercatat dalam basis data lokal. Riwayat lokal dibersihkan dengan rotasi manual berkala jika daftar menjadi terlalu besar.