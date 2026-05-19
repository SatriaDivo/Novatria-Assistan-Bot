# Executive Summary

## 1. Latar Belakang Proyek
Di era kolaborasi digital yang cepat, komunitas sering kali menggunakan Discord sebagai pusat komunikasi utama. Namun, manajemen tugas (todo list), dokumentasi (arsip, catatan, link penting), penjadwalan (mabar/meeting), serta aktivitas spesifik seperti **Capture The Flag (CTF)** biasanya dikelola melalui platform pihak ketiga secara terpisah. Hal ini menyebabkan informasi menjadi tersebar dan sulit dilacak.

## 2. Identifikasi Masalah
- **Informasi Tersebar:** Anggota komunitas mencatat aktivitas dan jadwal di tempat berbeda, sehingga menyulitkan sinkronisasi.
- **Kesulitan Tracking CTF:** Tim sering kali kehilangan pantauan mengenai lomba CTF yang akan datang, *writeup*, dan progres pengerjaan *challenge*.
- **Kurangnya Pencatatan Sentral:** Tidak ada repositori data pusat untuk semua informasi penting yang disebarkan dalam *chat* harian.

## 3. Solusi (Novatria Assistant Bot)
Novatria Assistant Bot merupakan sebuah aplikasi *bot Discord* berbasis Node.js yang berfungsi sebagai asisten otomatis di dalam server Discord komunitas. Bot ini memberikan solusi dengan:
1. **Pusat Kendali Produktivitas:** Membawa fungsi pencatatan, *todo-list*, dan penjadwalan secara langsung ke dalam Discord melalui *Slash Commands* (`/catat`, `/todo`, `/jadwal`).
2. **Sinkronisasi Database Gratis:** Menggunakan **Google Sheets** (melalui Google Apps Script) sebagai *database* tanpa biaya (zero-cost infrastructure).
3. **Dedicated CTF Workflow:** Menyediakan manajemen kompetisi keamanan siber (CTF) mulai dari notifikasi jadwal lomba (`/ctfevent`, `/ctfnotify`), progres *challenge* (`/progress`), hingga dokumentasi *writeup* (`/writeup`).
4. **Keamanan & Kerapian:** Menyediakan fitur pembatasan perintah berbasis *channel* (CTF Channel Guard) dan batasan akses admin untuk fungsi destruktif (`/hapus`).

## 4. Nilai Bisnis
Dengan mengimplementasikan Novatria-Bot, produktivitas tim dapat diukur dan dilacak dengan baik tanpa harus beranjak dari aplikasi Discord. Integrasinya dengan layanan tanpa biaya dari Google meminimalkan biaya *overhead* infrastruktur bagi komunitas skala menengah.