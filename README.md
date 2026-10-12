<p align="center">
  <img src="assets/logo.png" alt="Novatria Assistant Bot Logo" width="180">
</p>

# Novatria Assistant Bot (Overhauled v2.0)

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Novatria Assistant Bot adalah bot Discord modern, ultra-ringan, dan cepat yang dirancang untuk:
1. **Remote Control Hermes di VPS** langsung dari Discord (`/hermes status`, `/hermes cmd`, `/hermes restart`).
2. **Sistem Bansos Akun & API Key Otomatis** dengan database SQLite atomik (anti-rebutan/anti-race condition) dan pengiriman credential secara *Ephemeral* (rahasia).
3. **Komunitas & Gaming** (Auto-role, Welcome greeting, dan Self-Role interaktif via tombol).

---

## ⚡ Fitur Utama

### 👑 1. Hermes VPS Controller (Khusus Admin)
* `/hermes status` — Cek status daemon Hermes, uptime VPS, dan pemakaian RAM.
* `/hermes cmd <command>` — Jalankan perintah CLI di VPS dengan batas waktu aman (10 detik) dan output terpotong otomatis.
* `/hermes restart` — Kirim perintah restart daemon Hermes ke `systemd`.

### 🎁 2. Sistem Bansos Akun & API Key
* `/bansos add <tipe> <label> <konten>` — Tambahkan stok akun atau API key ke database (Admin).
* `/bansos stock` — Cek sisa kuota stok yang tersedia vs yang sudah diklaim.
* `/bansos drop <tipe> [channel]` — Kirim panel embed interaktif ke channel bansos:
  * Tombol `[🎁 Klaim Akun Gratis]`
  * Tombol `[🔑 Klaim API Key]`
* **Fitur Keamanan Bansos:**
  * Transaksi atomik SQLite (`better-sqlite3` WAL mode): Aman saat ratusan user menekan tombol bersamaan.
  * Credential dikirimkan secara **Ephemeral** (hanya terlihat oleh orang yang menekan tombol).
  * Pembatasan 1 klaim per user per kategori.
  * Notifikasi log otomatis ke channel `#bansos-manage`.

### 🌟 3. Komunitas & Self-Role
* **Welcome Message & Auto-Role**: Menyambut member baru di `#welcome` dan otomatis memberikan role default `Member`.
* `/rolepanel [channel]` — Mengirim panel tombol untuk mengambil role sendiri:
  * `[🎁 Bansos Hunter]` (Notifikasi drop bansos)
  * `[🎮 Gamers / Mabar]` (Ajakan main bareng)

---

## 📁 Susunan Channel Server Discord yang Disarankan

```text
📁 📌 WELCOME & RULES (Public, Read-Only)
   ├── 💬 #welcome          <-- Pesan sambutan & avatar member baru
   ├── 💬 #rules            <-- Peraturan server
   └── 💬 #ambil-role       <-- Panel tombol /rolepanel

📁 💬 CHILL ZONE (Public)
   ├── 💬 #general-chat     <-- Tempat nongkrong santai
   ├── 💬 #media-meme       <-- Share foto, video & meme
   └── 🔊 Chill Lounge      <-- Voice channel santai

📁 🎯 MABAR & GAMING (Public)
   ├── 💬 #ajak-mabar       <-- Channel teks janjian game
   ├── 🔊 Mabar Room 1      <-- Voice mabar
   └── 🔊 Mabar Room 2      <-- Voice mabar

📁 🎉 BANSOS CORNER (Public, Read-Only)
   ├── 💬 #bagi-akun        <-- Panel klaim akun gratis
   └── 💬 #bagi-api         <-- Panel klaim API key gratis

📁 🔒 ADMIN & HERMES (Private, Admin Only)
   ├── 💬 #hermes-control   <-- Remote control Hermes di VPS
   └── 💬 #bansos-manage    <-- Input stok & log klaim real-time
```

---

## 🚀 Panduan Deployment Docker di VPS

### 1. Konfigurasi `.env`
Salin template konfigurasi:
```bash
cp .env.example .env
nano .env
```
Isi variabel yang diperlukan:
* `TOKEN` & `CLIENT_ID`: Dari Discord Developer Portal.
* `GUILD_ID`: ID Server Discord Anda (agar slash command langsung aktif tanpa jeda).
* `ADMIN_CHANNEL_ID`: ID channel `#hermes-control`.
* `BANSOS_LOG_CHANNEL_ID`: ID channel `#bansos-manage`.
* `WELCOME_CHANNEL_ID`: ID channel `#welcome`.
* `DEFAULT_ROLE_ID`: Role ID untuk member baru.
* `ROLE_BANSOS_ID`: Role ID untuk bansos hunter.
* `ROLE_GAMERS_ID`: Role ID untuk gamers.
* `ADMIN_ROLE_IDS`: Role ID admin.

### 2. Jalankan dengan Docker Compose
```bash
docker compose up -d --build
```

### 3. Cek Log Container
```bash
docker compose logs -f
```

---

## 🧪 Menjalankan Test Otomatis
```bash
npm test
```
Menggunakan native Node.js test runner bawaan dengan 9 unit & integration tests mencakup transaksi SQLite, izin command, dan eksekusi Hermes.
