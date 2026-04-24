# Novatria Assistant Bot

Novatria Assistant Bot adalah Discord bot berbasis Node.js dan discord.js v14 untuk mencatat catatan, todo, link penting, jadwal, dan arsip ke channel Discord sekaligus menyimpan datanya ke Google Sheet melalui Google Apps Script Web App.

## Fitur

- `/ping` untuk mengecek bot aktif.
- `/status` untuk mengecek channel target, permission bot, dan konfigurasi Google Sheet.
- `/list tipe limit` untuk melihat data terbaru beserta ID sebelum menghapus.
- `/hapus tipe id` untuk menghapus data dari Google Sheet berdasarkan ID.
- `/catat isi` untuk mengirim catatan ke channel catatan dan menyimpan ke sheet `Catatan`.
- `/todo tugas` untuk mengirim todo ke channel todo-list dan menyimpan ke sheet `Todo`.
- `/link url judul catatan` untuk mengirim link penting dan menyimpan ke sheet `Link`.
- `/jadwal judul tanggal jam catatan` untuk mengirim jadwal dan menyimpan ke sheet `Jadwal`.
- `/arsip isi` untuk mengirim arsip dan menyimpan ke sheet `Arsip`.

## Struktur Folder

```text
Novatria-Bot
├─ .env.example
├─ .gitignore
├─ google-apps-script.js
├─ package.json
├─ index.js
└─ src
   ├─ config.js
   ├─ commands
   │  ├─ definitions.js
   │  ├─ ping.js
   │  ├─ status.js
   │  ├─ list.js
   │  ├─ hapus.js
   │  ├─ catat.js
   │  ├─ todo.js
   │  ├─ link.js
   │  ├─ jadwal.js
   │  └─ arsip.js
   ├─ handlers
   │  └─ interactionCreate.js
   └─ utils
      ├─ cariChannel.js
      ├─ getTargetChannel.js
      ├─ kirimKeChannel.js
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
SHEET_SECRET=novatria-secret-123
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
  "secret": "novatria-secret-123",
  "type": "catat",
  "data": {
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
- Memvalidasi `secret`.
- Menyimpan, membaca, dan menghapus data berdasarkan `type`.
- Dideploy sebagai Web App.

Kode lengkap Apps Script tersedia di `google-apps-script.js`. Jika memakai fitur `/list` dan `/hapus`, paste ulang isi file itu ke Google Apps Script lalu deploy versi Web App terbaru.

## Command Contoh

```text
/ping
/status
/list tipe: Todo limit: 10
/hapus tipe: Todo id: TODO-MABC1234-ABCD
/catat isi: test catatan
/todo tugas: belajar discord bot
/link url: https://example.com judul: Contoh catatan: testing link
/jadwal judul: Meeting tanggal: 25 April 2026 jam: 20:00 catatan: bahas bot
/arsip isi: dokumen penting testing
```

## Catatan Keamanan

Jika token bot pernah terlihat di terminal, chat, atau commit, segera regenerate token dari Discord Developer Portal dan perbarui `.env`.
