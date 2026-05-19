# Stakeholders

Bagian ini mengidentifikasi seluruh pemangku kepentingan yang terlibat langsung atau tidak langsung dalam penggunaan, pengelolaan, dan pengembangan Novatria Assistant Bot.

## 1. Developer / System Maintainer
- **Peran:** Mengelola *source code*, melakukan konfigurasi instalasi pada lingkungan produksi (*Docker*), mengurus pembaruan keamanan, dan me-*deploy* Google Apps Script Web App.
- **Kewenangan:** Memiliki akses penuh terhadap file konfigurasi lokal (`.env`), repositori kode sumber, dan konsol layanan Google Cloud (Apps Script).
- **Entitas Target:** SatriaDivo (dan kontributor repositori `SatriaDivo/Novatria-Assistan-Bot`).

## 2. Server Administrator & Moderator
- **Peran:** Mengelola izin (*permissions*) akses aplikasi dalam peladen (Server Discord), mendaftarkan *role* ke dalam sistem (`ADMIN_ROLE_IDS`), dan mengurus penamaan *channel* agar dapat diindeks oleh bot.
- **Kewenangan:** Dapat menjalankan perintah administratif secara eksklusif (seperti `/hapus`), melihat seluruh aktivitas di *channel* `log-aktivitas`, dan memodifikasi letak *category* CTF.

## 3. End-Users (Anggota Komunitas / Tim CTF)
- **Peran:** Pengguna akhir dari asisten bot. Mereka mengirim catatan, menjadwalkan pertemuan (*mabar*), menambahkan daftar tugas (*todo*), serta mengelola alur pengerjaan *challenge* CTF.
- **Kewenangan:** Dapat menjalankan perintah-perintah produktivitas (`/catat`, `/todo`, `/done`, `/link`, `/arsip`) dan CTF (`/ctf`, `/tantangan`, `/writeup`, `/progress`) sesuai dengan aturan segmentasi *channel* yang berlaku (misal: perintah non-CTF ditolak apabila dieksekusi di *channel* CTF).

## 4. Platform Providers (Third-Party)
- **Discord:** Sebagai ekosistem antarmuka pesan dan registrasi *Slash Commands*.
- **Google Workspace (Google Sheets & Apps Script):** Bertindak sebagai fasilitas penyimpanan (*database as a service*).
- **CTFtime & GitHub:** Bertindak sebagai *Data Provider* dalam operasional manajemen alur keamanan siber tim.