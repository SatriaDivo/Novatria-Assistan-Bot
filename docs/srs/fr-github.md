# FR: Integrasi GitHub API

Fitur penunjang pengambilan data *repository* atau arsip tantangan *Capture The Flag* / pembelajaran secara spesifik dari repositori repositori GitHub secara cerdas.

## 1. Pengambilan Folder Repositori (`/tantangan`)
Bot dirancang untuk dapat menganalisis dan mengunduh konten repositori berisikan struktur *markdown* atau sumber berkas (*source file*).

### A. Validasi dan Parsing URL
- Pengguna memberikan URL langsung (contoh: `https://github.com/user/repo/tree/main/path/to/folder`).
- Bot menggunakan algoritma Regular Expression (RegEx) untuk mendekomposisi URL menjadi variabel: `owner`, `repo`, `branch`, dan `path`.
- Jika ekstrak tidak valid, sistem mengembalikan pemberitahuan kesalahan ke pengguna.

### B. Otentikasi Opsional (Rate Limit Handling)
- Jika nilai `GITHUB_TOKEN` (*Personal Access Token*) telah ditetapkan di environment variabel lokal (`.env`), bot akan melampirkannya sebagai *Bearer Authentication* Header, sehingga mencegah pembatasan batas trafik (Rate Limiting) dari GitHub API.

## 2. Penguraian File dan Rendering
- **Markdown Rendering:** Setiap file ber-ekstensi `.md` yang ditemukan di dalam direktori spesifik tersebut akan dibaca *raw text*-nya.
  - Teks kemudian di-konversi menjadi **Discord Embed Message**.
  - **Chunking System:** Discord melarang deskripsi *embed* melebihi 4096 karakter. Jika teks terlalu besar, teks dipecah ke berbagai baris aman maksimal (4000 karakter per blok) dan dikirim sebagai multiple *embeds*.
- **Asset / Attachment:** Berkas (*file*) lainnya yang tidak berakhiran `.md` akan diunduh melalui *streams* memori dan diunggah langsung ke Discord sebagai lampiran pesan (*Message Attachments*).

## 3. Limitasi Anti-Spam (Proteksi)
Karena satu tautan folder repositori bisa berukuran masif (Ratusan file):
- Bot menerapkan **batas aman pemrosesan (Safety Limits):**
  - **Maksimal File Markdown:** Dibatasi hingga `5 file`.
  - **Maksimal Attachment Tambahan:** Dibatasi hingga `5 file`.
  - **Maksimal Total Chunk Markdown:** Dibatasi hingga `10 chunks`.
- Berkas tambahan yang melewati batas ini akan dilewati (di-*skip*) demi keamanan lalu-lintas jaringan, lalu dirangkum dan dilaporkan melalui pemberitahuan status akhir kepada pengguna di Discord.