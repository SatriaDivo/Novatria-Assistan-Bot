# Novatria Assistant Bot

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/SatriaDivo/Novatria-Assistan-Bot/actions/workflows/ci.yml/badge.svg)](https://github.com/SatriaDivo/Novatria-Assistan-Bot/actions/workflows/ci.yml)
[![Project Status](https://img.shields.io/badge/status-active-brightgreen.svg)](#)

Novatria Assistant Bot adalah Discord bot berbasis Node.js dan discord.js v14 untuk mencatat catatan, todo, link penting, jadwal, dan arsip ke channel Discord sekaligus menyimpan datanya ke Google Sheet melalui Google Apps Script Web App.

## Features

- `/ping` untuk mengecek bot aktif.
- `/help` untuk melihat daftar command.
- `/status` untuk mengecek channel target, permission bot, dan konfigurasi Google Sheet.
- `/list tipe limit` untuk melihat data terbaru beserta ID sebelum menghapus.
- `/hapus tipe id` untuk menghapus data dari Google Sheet berdasarkan ID.
- `/catat isi` untuk mengirim catatan ke channel catatan dan menyimpan ke sheet `Catatan`.
- `/todo tugas` untuk mengirim todo ke channel todo-list dan menyimpan ke sheet `Todo`.
- `/link url judul catatan` untuk mengirim link penting dan menyimpan ke sheet `Link`.
- `/jadwal judul tanggal jam catatan` untuk mengirim jadwal dan menyimpan ke sheet `Jadwal`.
- `/arsip isi` untuk mengirim arsip dan menyimpan ke sheet `Arsip`.
- `/ctfevent limit` untuk melihat lomba CTF upcoming dari CTFtime public API.
- `/ctfcek` untuk mengirim daftar lomba CTF upcoming ke channel CTF.
- `/ctfnotify status` untuk mengaktifkan atau mematikan notifikasi otomatis CTFtime.
- Google Sheet integration.
- Google Calendar integration untuk event jadwal.
- Auto-log activity ke channel `log-aktivitas` atau channel log dari `CHANNEL_LOG_ID`.
- Embed message untuk tampilan command yang lebih rapi.

## Struktur Folder

```text
Novatria-Bot
├─ .env.example
├─ .gitignore
├─ google-apps-script.js
├─ package.json
├─ index.js
├─ data
│  └─ .gitkeep
└─ src
   ├─ config.js
   ├─ commands
   │  ├─ definitions.js
   │  ├─ ping.js
   │  ├─ help.js
   │  ├─ status.js
   │  ├─ list.js
   │  ├─ hapus.js
   │  ├─ catat.js
   │  ├─ todo.js
   │  ├─ link.js
   │  ├─ jadwal.js
   │  ├─ arsip.js
   │  ├─ ctfevent.js
   │  ├─ ctfcek.js
   │  └─ ctfnotify.js
   ├─ handlers
   │  └─ interactionCreate.js
   └─ utils
      ├─ ctfChannelGuard.js
      ├─ ctftimeApi.js
      ├─ ctftimeNotifier.js
      ├─ cariChannel.js
      ├─ getTargetChannel.js
      ├─ kirimKeChannel.js
      ├─ logActivity.js
      ├─ buatId.js
      └─ sheet.js
```

## Instalasi

```bash
npm init -y
npm install discord.js dotenv
```

Jika dependency sudah ada dari repository, cukup jalankan:

```bash
npm install
```

## Konfigurasi Environment

Salin `.env.example` menjadi `.env`, lalu isi nilainya.

```env
TOKEN=ISI_TOKEN_BOT
CLIENT_ID=1497290662196936744
SHEET_WEBAPP_URL=ISI_URL_WEB_APP_GOOGLE_SCRIPT
SHEET_SECRET=ISI_SECRET_YANG_SAMA_DENGAN_APPS_SCRIPT
CHANNEL_CATATAN_ID=
CHANNEL_TODO_ID=
CHANNEL_LINK_ID=
CHANNEL_JADWAL_ID=
CHANNEL_ARSIP_ID=
CHANNEL_LOG_ID=
```

Catatan:

- Jangan commit file `.env`.
- `TOKEN` adalah token bot dari Discord Developer Portal.
- `SHEET_WEBAPP_URL` adalah URL deploy Google Apps Script Web App.
- `SHEET_SECRET` harus sama dengan Script Property `SECRET_KEY` di Google Apps Script.
- Channel ID bersifat opsional. Jika kosong, bot akan mencari channel berdasarkan nama, misalnya `catatan`, `todo-list`, `link-penting`, `jadwal`, dan `arsip`.

## Menjalankan Bot

```bash
node index.js
```

Atau:

```bash
npm start
```

Saat bot aktif, slash commands akan didaftarkan otomatis ke server tempat bot berada.

## Fitur CTF

Buat category CTF di Discord, lalu siapkan channel berikut:

```text
🧩 CTF
├─ 🧩-ctf-info
├─ 🤖-ctf-command
├─ 🎯-ctf-target
├─ 📝-ctf-writeup
├─ 🔗-ctf-link
├─ 🧠-ctf-notes
└─ 🏆-ctf-progress
```

Command CTF hanya bisa dipakai di channel yang namanya mengandung `ctf-command`, misalnya `🤖-ctf-command`. Siapa saja boleh memakai command CTF selama punya akses ke channel tersebut.

Di channel/category CTF, bot juga menolak command non-CTF seperti `/catat`, `/todo`, `/jadwal`, dan command umum lain. Jadi area CTF tetap bersih untuk workflow CTF.

Data lomba diambil dari CTFtime public API, bukan scraping web dan tidak membutuhkan cookie/login CTFtime.

### Membatasi Slash Menu Di Category CTF

Discord tidak mengizinkan bot token biasa mengubah visibilitas command per channel secara otomatis. Agar slash menu di category CTF benar-benar hanya menampilkan command CTF, atur dari Discord:

1. Buka **Server Settings**.
2. Pilih **Integrations**.
3. Pilih aplikasi **Novatria Assistant** lalu klik **Manage**.
4. Untuk channel/category CTF, nonaktifkan command non-CTF:
   `/ping`, `/help`, `/status`, `/list`, `/hapus`, `/catat`, `/todo`, `/link`, `/jadwal`, `/arsip`.
5. Biarkan command CTF aktif:
   `/ctfevent`, `/ctfcek`, `/ctfnotify`.

Kalau pengaturan visibility belum dilakukan di Discord, command non-CTF mungkin masih terlihat di slash menu, tetapi bot tetap akan menolaknya saat dipakai di area CTF.

### Command CTF

```text
/ctfevent limit: 5
```

Menampilkan lomba CTF upcoming dari sekarang sampai 30 hari ke depan. Opsi `limit` bersifat opsional, default `5`, minimal `1`, maksimal `10`. Tanggal ditampilkan dalam timezone Asia/Jakarta/WIB.

```text
/ctfcek
```

Mengirim embed daftar lomba CTF upcoming ke channel tujuan. Bot mencari channel tujuan dengan prioritas nama `ctf-info`, lalu `ctf-lomba`, lalu channel yang mengandung `ctf`.

```text
/ctfnotify status: on
/ctfnotify status: off
```

Mengaktifkan atau mematikan notifikasi otomatis CTFtime. Saat aktif, bot mengecek event CTFtime setiap 6 jam dan mengirim event baru ke channel CTF tanpa mengirim ulang event yang sama.

Status notifikasi disimpan di `data/ctftime-settings.json`. Event yang sudah pernah dikirim disimpan di `data/ctftime-seen.json`. File JSON ini dibuat otomatis saat bot berjalan dan tidak perlu dicommit.

## Menjalankan Dengan Docker di Windows

Pastikan Docker Desktop sudah terinstall dan berjalan. File `.env` tetap dipakai dari folder project dan tidak dimasukkan ke image Docker.

Build dan jalankan bot:

```bash
docker compose up -d --build
```

Lihat log bot:

```bash
docker compose logs -f
```

Restart bot:

```bash
docker compose restart
```

Stop bot:

```bash
docker compose down
```

Container memakai `restart: unless-stopped`, jadi Docker akan menjalankan ulang bot otomatis setelah Docker Desktop aktif kembali.

### Auto Run Saat Laptop Menyala

Cara paling mudah di Windows:

1. Buka Docker Desktop.
2. Masuk **Settings**.
3. Aktifkan **Start Docker Desktop when you sign in**.
4. Jalankan sekali:

```bash
docker compose up -d --build
```

Setelah itu, saat laptop menyala dan kamu login Windows, Docker Desktop akan start dan container `novatria-bot` akan hidup lagi otomatis.

Repository ini menyediakan script Startup Folder untuk auto-run tanpa admin:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-startup-folder.ps1
```

Untuk menghapus auto-run dari Startup Folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\uninstall-startup-folder.ps1
```

## Permission Discord

Pastikan bot punya permission berikut pada channel target:

- View Channel
- Send Messages
- Use Application Commands

Gunakan `/status` untuk mengecek apakah channel dan permission sudah benar.

## Google Apps Script

Bot mengirim data ke Google Sheet melalui POST request ke `SHEET_WEBAPP_URL`.

Payload yang dikirim:

```json
{
  "secret": "isi-secret-anda",
  "action": "append",
  "type": "catat",
  "data": {
    "id": "CAT-MABC1234-ABCD",
    "user": "username#0000",
    "userId": "123",
    "server": "Novatria HQ",
    "channel": "catatan",
    "isi": "contoh catatan"
  }
}
```

Pastikan Apps Script:

- Memiliki fungsi `doPost(e)`.
- Memvalidasi `secret` dari Script Property `SECRET_KEY`.
- Menyimpan, membaca, dan menghapus data berdasarkan `type`.
- Dideploy sebagai Web App.

Kode lengkap Apps Script tersedia di `google-apps-script.js`. Jika memakai fitur `/status`, `/list`, dan `/hapus`, paste ulang isi file itu ke Google Apps Script lalu deploy versi Web App terbaru.

### Setup Script Properties

Di Google Apps Script, buka **Project Settings** lalu tambahkan Script Properties berikut:

```text
SECRET_KEY=isi-secret-anda
SPREADSHEET_ID=id-google-sheet-anda
```

Nilai `SECRET_KEY` harus sama dengan `SHEET_SECRET` di `.env`. Setelah mengubah Script Properties atau kode Apps Script, deploy ulang sebagai **New version**.

## Command Contoh

```text
/ping
/help
/status
/list tipe: Todo limit: 10
/hapus tipe: Todo id: TODO-MABC1234-ABCD
/catat isi: test catatan
/todo tugas: belajar discord bot
/link url: https://example.com judul: Contoh catatan: testing link
/jadwal judul: Meeting tanggal: 25 bulan: 4 tahun: 2026 jam: 20:00 selesai: 21:00 catatan: bahas bot
/arsip isi: dokumen penting testing
/ctfevent limit: 5
/ctfcek
/ctfnotify status: on
```

## Catatan Keamanan

Jika token bot pernah terlihat di terminal, chat, atau commit, segera regenerate token dari Discord Developer Portal dan perbarui `.env`.
