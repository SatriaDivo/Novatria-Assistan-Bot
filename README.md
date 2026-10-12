<p align="center">
  <img src="assets/logo.png" alt="Novatria Assistant Bot Logo" width="180">
</p>

# Novatria Assistant Bot (v2.0.0)

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Novatria Assistant Bot v2.0.0** adalah bot Discord ultra-ringan, cepat, dan aman yang dirancang untuk kebutuhan server komunitas, gaming, pembagian akun/API gratis (bansos), serta manajemen remote host VPS Hermes langsung dari Discord.

---

## ⚡ Fitur Utama

### 👑 1. Remote Controller Hermes VPS (Admin Only)
Kelola daemon Hermes dan pantau server VPS langsung dari Discord channel `#hermes-control`:
* `/hermes status` — Melihat status daemon Hermes (`active`/`inactive`), sistem operasi, uptime VPS, dan kapasitas memori RAM yang terpakai.
* `/hermes cmd <command>` — Menjalankan perintah terminal/shell di VPS secara aman dengan timeout 10 detik dan pemotongan output otomatis jika melebihi batas pesan Discord.
* `/hermes restart` — Mengirim instruksi restart service daemon Hermes ke `systemd`.

### 🎁 2. Sistem Bansos Akun & API Key Otomatis
Distribusi akun premium dan API key gratis secara instan, aman, dan anti-rebutan:
* `/bansos add <tipe> <label> <konten>` — Menambahkan stok akun (Canva, Spotify, VPN) atau API Key (OpenAI, DeepSeek, Groq) ke database SQLite (Admin).
* `/bansos stock` — Menampilkan ringkasan sisa stok yang tersedia vs yang sudah diklaim.
* `/bansos drop <tipe> [channel]` — Mengirim panel embed interaktif berisi tombol klaim langsung ke channel publik:
  * `[🎁 Klaim Akun Gratis]`
  * `[🔑 Klaim API Key]`
* **Fitur Keamanan Bansos:**
  * **Atomik SQLite (`better-sqlite3`)**: Menggunakan database transaksi ACID tunggal; mencegah *race condition* atau duplikasi klaim meskipun ratusan user mengklik tombol bersamaan.
  * **Pesan Rahasia (Ephemeral)**: Detail login akun / string API key hanya dikirimkan ke pengguna yang mengklik tombol dan tidak terlihat oleh orang lain di channel.
  * **Anti-Timbun**: Pembatasan 1 kali klaim per pengguna per kategori.
  * **Log Real-time**: Rekap klaim otomatis dikirim ke channel log admin (`#bansos-manage`).

### 🌟 3. Komunitas, Welcome Card & Dynamic Server Stats
* **Welcome Card Bergambar Otomatis**: Menyambut member baru di channel `#welcome` dengan kartu grafis selamat datang (PNG 800x360) berisi avatar member, nama, dan nomor urut member server.
* **Auto-Role**: Memberikan role default `Member` secara otomatis saat pengguna pertama kali bergabung.
* `/rolepanel [channel]` — Mengirim panel tombol self-role interaktif di channel `#ambil-role`:
  * `[🎁 Bansos Hunter]` (Role notifikasi drop bansos)
  * `[🎮 Gamers / Mabar]` (Role notifikasi ajakan mabar)
* `/stats setup` — Membuat channel voice terkunci otomatis di paling atas server (`👥 Total Member: X`) sebagai counter member real-time (Admin).
* `/stats sync` — Sinkronkan ulang jumlah member terkini ke channel stats.

---

## 📁 Struktur Kategori & Channel Server Discord

Untuk pengalaman terbaik, susun channel Discord Anda sebagai berikut:

```text
📁 📌 WELCOME & RULES (Public, Read-Only)
   ├── 💬 #welcome          <-- Pesan sambutan otomatis & avatar member
   ├── 💬 #rules            <-- Peraturan & pedoman komunitas
   └── 💬 #ambil-role       <-- Panel tombol self-role (/rolepanel)

📁 💬 CHILL ZONE (Public)
   ├── 💬 #general-chat     <-- Tempat ngobrol santai antar member
   ├── 💬 #media-meme       <-- Share gambar, video, dan meme
   └── 🔊 Chill Lounge      <-- Voice channel santai

📁 🎯 MABAR & GAMING (Public)
   ├── 💬 #ajak-mabar       <-- Channel teks koordinasi & janjian game
   ├── 🔊 Mabar Room 1      <-- Voice channel gaming 1
   └── 🔊 Mabar Room 2      <-- Voice channel gaming 2

📁 🎉 BANSOS CORNER (Public, Read-Only)
   ├── 💬 #bagi-akun        <-- Panel embed klaim akun gratis
   └── 💬 #bagi-api         <-- Panel embed klaim API key gratis

📁 🔒 ADMIN & HERMES (Private, Admin Only)
   ├── 💬 #hermes-control   <-- Remote control Hermes & VPS (/hermes)
   └── 💬 #bansos-manage    <-- Input stok bansos & notifikasi klaim
```

---

## 🚀 Panduan Deployment

### Cara 1: Menggunakan Docker & Docker Compose (Direkomendasikan di VPS)

1. **Clone repository dan siapkan konfigurasi:**
   ```bash
   cp .env.example .env
   nano .env
   ```
   Isi konfigurasi sesuai channel & role ID server Discord Anda.

2. **Jalankan container:**
   ```bash
   docker compose up -d --build
   ```

3. **Cek status & log:**
   ```bash
   docker compose logs -f
   ```

*Data SQLite tersimpan persisten di folder `./data` di host VPS.*

---

### Cara 2: Menjalankan Langsung dengan Node.js

1. **Pastikan Node.js v20+ sudah terinstal.**
2. **Install dependensi:**
   ```bash
   npm install
   ```
3. **Isi file `.env`:**
   ```bash
   cp .env.example .env
   ```
4. **Jalankan bot:**
   ```bash
   npm start
   ```

---

## ⚙️ Variabel Konfigurasi (`.env`)

| Variabel | Keterangan |
|---|---|
| `TOKEN` | Token Bot dari Discord Developer Portal |
| `CLIENT_ID` | Application ID Bot |
| `GUILD_ID` | ID Server Discord (agar slash command instan terdaftar) |
| `ADMIN_CHANNEL_ID` | ID Channel `#hermes-control` |
| `BANSOS_LOG_CHANNEL_ID` | ID Channel `#bansos-manage` |
| `WELCOME_CHANNEL_ID` | ID Channel `#welcome` |
| `BANSOS_CHANNEL_ID` | ID Channel `#bagi-akun` |
| `DEFAULT_ROLE_ID` | Role ID default yang diberikan ke member baru |
| `ROLE_BANSOS_ID` | Role ID untuk Bansos Hunter |
| `ROLE_GAMERS_ID` | Role ID untuk Gamers / Mabar |
| `ADMIN_ROLE_IDS` | Role ID admin yang berwenang (pisahkan koma jika >1) |
| `HERMES_SERVICE_NAME` | Nama systemd service Hermes di VPS (default: `hermes`) |

---

## 🧪 Pengujian Otomatis (Unit & Integration Tests)

Jalankan rangkaian pengujian bawaan tanpa library pihak ketiga tambahan:
```bash
npm test
```

Semua pengujian memverifikasi integritas database SQLite, alur klaim bansos, permission guard, dan service Hermes.
