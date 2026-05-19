# FR: Integrasi Google Sheets

Fungsi utama yang membedakan Novatria-Bot dari sekadar bot chat biasa adalah persistensi database gratis melalui layanan API Google Apps Script.

## 1. Operasi Komunikasi Data
Semua manipulasi data (Menambah, Merubah Status, Membaca, dan Menghapus) dikirim menggunakan metode HTTP POST asinkron (menggunakan modul *native* Node.js / `fetch`).

### A. Write (Aksi `append`)
- **Pemicu:** Segala macam perintah utilitas (`/catat`, `/todo`, `/jadwal`, `/mabar`, `/arsip`, `/ctf`, `/tantangan`, `/writeup`, `/progress`).
- **Alur Logika:** Bot merangkum input dari Discord *Slash Command*, men-generate **Unique ID** (misal: `TODO-MABC1234-ABCD` menggunakan `buatId.js`), dan mem-POST *payload* ke URL web app.
- **Respons Akhir:** Setelah pengiriman API HTTP berhasil, bot memperbarui pesan *ephemeral* Discord dengan notifikasi konfirmasi keberhasilan sistem.

### B. Update (Aksi `update_status`)
- **Pemicu:** Perintah spesifik `/done`.
- **Alur Logika:** Bot menerima input *Unique ID* dari sebuah objek. Request dilempar dengan parameter tipe spesifik dan ID tersebut, Google Apps Script akan memindai rentang kolom terkait, mencocokkan ID, dan mengubah sel *Status* kolom terakhir dari *array* menjadi teks `Selesai`.

### C. Delete (Aksi `delete`)
- **Pemicu:** Perintah khusus `/hapus` (Khusus Administrator/Pemegang Role `ADMIN_ROLE_IDS`).
- **Alur Logika:** Bot mengirim ID dan Kategori `tipe`. Google Apps Script mencari sel tersebut lalu menjalankan komando `deleteRow(rowIndex)`.
- **Validasi:** Pengguna diwajibkan menyertakan tipe Sheet secara pasti melalui antarmuka argumen Discord.

### D. Read (Aksi `list`)
- **Pemicu:** Perintah utilitas `/list`.
- **Alur Logika:** Bot meminta jumlah `limit` deretan baris terbawah dari sebuah `tipe` sheet. Aplikasi skrip akan mengembalikan objek JSON berisi kumpulan riwayat baris (*Rows*) beserta ID untuk dikembalikan sebagai list pesan di Discord.

## 2. Logging Sentral
Setiap aktivitas yang dikirim ke sheet utama (Catat, Todo, dsb.), juga **secara simultan diduplikasi ke dalam Sheet "Log"**. Sheet log bertugas sebagai jejak audit rekam (*Audit Trail*) lengkap, mencatat cap waktu pasti (Timestamp), pengguna eksekutor, nama channel, dan ringkasan eksekusi, terlepas dari hasil komando.