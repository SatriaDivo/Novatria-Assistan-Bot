# FR: Autentikasi & Keamanan (Role & Permission)

Dokumen ini menjelaskan kendali akses dan otorisasi yang diterapkan dalam Novatria-Bot untuk mencegah eksploitasi fitur maupun gangguan (spam).

## 1. Akses Otoritas Aplikasi (Discord Permissions)
Sistem bot tidak memerlukan izin administratif penuh (*Administrator*) secara global. Hanya izin berikut yang wajib diberikan di server:
- `View Channels` (Membaca Kanal)
- `Send Messages` (Mengirim Pesan Teks & Embed)
- `Use Application Commands` (Mengeksekusi *Slash Commands*)

## 2. Kendali Perintah Sensitif (Role-Based Access)
Perintah yang bersifat destruktif atau mengubah konfigurasi global harus diproteksi dengan verifikasi identitas (Role/Permissions pengguna yang mengeksekusi).

### Aturan Eksekusi Perintah `/hapus`
Perintah `/hapus` hanya akan diproses apabila pemanggil (*executor*) memenuhi **SALAH SATU** dari prasyarat berikut:
1. Memiliki izin tingkat peladen: `Administrator`.
2. Memiliki izin tingkat peladen: `Manage Server`.
3. Memiliki *Role ID* yang terdaftar secara eksplisit pada variabel sistem lingkungan (Environment Variable `ADMIN_ROLE_IDS`).

*Perilaku Sistem:* Apabila anggota biasa (`@everyone`) mencoba memanggil perintah ini, bot menolak akses dan mengirim pesan respons sementara (Ephemeral Message) yang berisi peringatan penolakan akses.

## 3. CTF Channel Guard (Segmentasi Ruang Perintah)
Bot mengimplementasikan segmentasi zona logika, sehingga perintah umum tidak tercampur dengan ekosistem manajemen CTF.
- **Zona CTF:** Setiap *channel* atau *category* yang memuat *string* "ctf" (misal: `🤖-ctf-command`) merupakan *Protected CTF Zone*.
- **Blokir Command Umum:** Penggunaan `/catat`, `/todo`, `/jadwal`, `/mabar`, dan command fungsional lainnya (selain *list command CTF*) akan **diblokir dan ditolak otomatis** oleh sistem jika dijalankan di *zona CTF*.

## 4. Autentikasi Backend (Google Apps Script)
Google Apps Script bertindak sebagai API Server publik (`doPost()`). Untuk memastikan bahwa tidak ada pihak yang dapat memanipulasi *database* secara manual, setiap request memuat token.
- **Mekanisme Rahasia:** Penggunaan `SHEET_SECRET` yang disuntikkan secara aman ke dalam *body payload* POST request. Payload akan ditolak dan menghasilkan respons error `401 Unauthorized` oleh Apps Script jika `secret` tidak terverifikasi dengan konfigurasi variabel `SECRET_KEY` internal Google.