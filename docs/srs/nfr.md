# Non-Functional Requirements (NFR)

Persyaratan non-fungsional memastikan bahwa sistem tidak hanya beroperasi sesuai desain logika, melainkan melaksanakannya secara efisien, persisten, andal, dan aman.

## 1. Kinerja dan Tanggap Waktu (Performance & Responsiveness)
- **Latensi Antarmuka:** Discord mewajibkan interaksi terhadap *Slash Commands* menerima pengakuan (Acknowledgement) selambatnya di bawah `3000ms (3 detik)`. Semua permintaan berat seperti pencarian GitHub Repo, interaksi Google API, dan sinkronisasi CTFtime diantisipasi menggunakan modul asinkron `interaction.deferReply()` untuk mencegah *Timeout Error*.
- **Penulisan Database:** Permintaan jaringan ke endpoint web Google Apps Script dibatasi maksimal operasi di bawah 5 detik.

## 2. Keandalan dan Persistensi Sistem (Reliability & Persistence)
- **Containerization Engine:** Proses inti bot (Node.js) diisolasi melalui mesin arsitektur Docker (`Dockerfile` dan `docker-compose.yml`).
- **Restart Otomatis:** Perangkat Docker dikonfigurasi menggunakan label pengaturan jaminan layanan `restart: unless-stopped`. Kegagalan fatal (misal: *Out of Memory* atau diskoneksi server WebSocket sentral) memicu otomatisasi *reboot* dalam skala milidetik tanpa sentuhan manual manusia.
- **Persistent Data Volume:** Direktori vital pemetaan (Bind Mount) dideklarasikan: `./data:/app/data`. Jika berkas atau citra kontainer (Container Image) di-*rebuild*, seluruh memori persisten status *CTFtime Settings* tetap utuh dan tak terhapus.

## 3. Keamanan Informasi (Security & Privacy)
- **Isolasi Kunci (Secret Management):** Tidak ada string rahasia (Token Bot Discord, Kunci Otentikasi App Script, *Personal Token* GitHub) yang diekspos melalui log sistem (*stdout*/*stderr*) maupun di-*hardcode* pada *source file*. Semua informasi peka lingkungan disalurkan melalui fail kontrol `.env`.
- **RBAC Strict Fallback:** Tanpa registrasi sah ID `ADMIN_ROLE_IDS`, celah penghapusan database Google Sheet secara eksklusif dan masif otomatis ditutup.
- **Rate Limit Toleration:** Permintaan GitHub API diproses menggunakan blok memori *delay* atau dibekali `Bearer Token` opsional demi menghindari cekal layanan (*IP Ban*) pada alamat IP sistem peladen (*host*).

## 4. Ekstensibilitas (Extensibility)
- Modul sistem diringkas di bawah arsitektur standar kerangka kerja Discord.js (Struktur Handler). Setiap modul dan perintah utilitas baru hanya perlu didaftarkan dan di-*export* sebagai satu *file independent* pada repositori direktori `./src/commands/`.