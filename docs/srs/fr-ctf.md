# FR: CTF Tracking & Workflow

Modul spesifik yang dirancang khusus untuk memfasilitasi kebutuhan sebuah tim/komunitas keamanan siber (CTF Team) secara langsung dari server Discord.

## 1. Pemantauan Kompetisi Upcoming
- **FR.CTF.01 (`/ctfevent`):** Bot harus menyediakan daftar interaktif mengenai kompetisi CTF mendatang dalam rentang 30 hari kalender, menggunakan API pihak ketiga (CTFtime), disertai dukungan argumen opsional `limit`.
- **FR.CTF.02 (`/ctfcek`):** Bot harus bisa menangkap request jadwal dan mengirimkannya ke ruang obrolan (*channel*) publik yang ditentukan (prioritas pencarian: `ctf-info`, `ctf-lomba`, kanal ber-*prefix* ctf).

## 2. Repositori Data CTF
Semua data di bawah ini otomatis dialirkan ke *Google Sheets* dan *Channel Log*.
- **FR.CTF.03 (`/ctf`):** Pengguna dapat memasukkan instrumen *target challenge* dengan argumen `nama`, `platform`, `url` (opsional), `kategori`, dan `catatan`. Bot mengirim pesan embed target ke kanal prioritas `ctf-target`.
- **FR.CTF.04 (`/progress`):** Pengguna dapat memperbarui dan menyebarkan status penyelesaian *challenge*. Bot memerlukan input `challenge` (nama), `status` (sedang dikerjakan/buntu), dan `catatan` progres, lalu mengarahkannya ke `ctf-progress`.
- **FR.CTF.05 (`/writeup`):** Setelah penyelesaian tantangan, anggota dapat menyisipkan solusi dokumentasi (*writeup*). Bot memerlukan `judul`, `challenge`, `ringkasan`, dan opsional `url` *payload*, diteruskan ke kanal `ctf-writeup`.

## 3. Batasan dan Aturan Fungsional
- Seluruh *command* pada kategori CTF ini mematuhi standar *Slash Command Integration* dan dirancang untuk memuat informasi secara asinkron (*Deferred Replies* digunakan ketika diperlukan waktu tunggu untuk *fetch* dan pengiriman *embed* kompleks).
- Bot menyediakan *fallback handler*, yang artinya apabila *channel* spesifik untuk CTF tidak ditemukan oleh *Smart Channel Finder*, bot akan me-rute ulang data kembali kepada kanal asal tempat perintah itu dieksekusi.