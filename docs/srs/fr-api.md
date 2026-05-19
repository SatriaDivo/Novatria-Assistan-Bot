# FR: Integrasi Eksternal API

Spesifikasi fungsional ini menjabarkan kemampuan Novatria-Bot dalam berinteraksi dengan API dari layanan pihak ketiga (CTFtime).

## 1. CTFtime API Service
Bot harus dapat mengekstraksi jadwal kompetisi *Capture The Flag* global menggunakan infrastruktur *open API* milik CTFtime.org.

### A. Endpoint Target
- URL Asal: `https://ctftime.org/api/v1/events/`
- Method: `GET`

### B. Parameter Fetching
- `limit`: Ditentukan oleh pengguna melalui *command option* (default: 5, rentang: 1 - 10).
- `start`: *UNIX Timestamp* saat waktu request dibuat.
- `finish`: *UNIX Timestamp* 30 hari kalender setelah waktu request dibuat.

### C. Alur Pengolahan Response
1. Sistem mengirim request ke API CTFtime dengan menambahkan `User-Agent` khusus (`NovatriaBot Discord/1.0`) untuk menghindari pemblokiran *rate-limiting*.
2. Apabila respon API mengembalikan status `200 OK`, sistem mengurai JSON *Array* berisi informasi `title`, `url`, `logo`, `start`, `finish`, `format`, dan `weight`.
3. Waktu UTC (Z) yang dikembalikan oleh server CTFtime **harus dikonversi secara otomatis** menjadi Waktu Indonesia Barat (WIB / GMT+7) menggunakan library `moment-timezone` untuk dipaparkan kepada pengguna akhir dalam Discord Embed.

### D. Penanganan Kesalahan (Error Handling)
- **Timeout/500 Server Error:** Sistem mengembalikan pesan informatif ke channel "Gagal mengambil data dari CTFtime saat ini. Coba lagi nanti."
- **Data Kosong:** Jika rentang *start* dan *finish* tidak menghasilkan kompetisi satupun, bot menginformasikan "Tidak ada kompetisi CTF mendatang yang ditemukan."

### E. Integrasi dengan Command Terkait
- **`/ctfevent`**: Pengguna memicu langsung pengambilan data dan menampilkan hasilnya di *channel* eksekusi.
- **`/ctfcek`**: Pengguna memicu langsung, namun hasilnya diarahkan untuk dikirim pada sistem deteksi kanal `ctf-info` / `ctf-lomba`.