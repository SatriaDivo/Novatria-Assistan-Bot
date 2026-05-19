# Scope

Ruang lingkup mendefinisikan fitur apa saja yang disertakan dalam versi sistem saat ini (In-Scope) dan fitur yang dengan sengaja ditinggalkan (Out-of-Scope) untuk mencegah *feature creep*.

## In-Scope (Termasuk dalam Sistem)
Sistem **Novatria-Bot** (v1.1.0) mencakup fungsionalitas berikut:
1. **Sistem Komando Interaktif:** Penggunaan antarmuka *Discord Slash Commands* untuk memfasilitasi interaksi pengguna dengan parameter input (opsional maupun *required*).
2. **Sinkronisasi Database Google Sheets:** Integrasi HTTP POST dari Node.js menuju Google Apps Script Web App untuk melakukan aksi *Create*, *Read*, *Update*, dan *Delete* pada berbagai jenis *Sheet*.
3. **CTF Workflow Automation:** 
   - *Fetching* data melalui *Public API* CTFtime (tanpa login).
   - Pengiriman otomatis notifikasi H-3 (tersimpan pada *local storage* container).
   - Pendataan *target challenge* dan *writeup* lomba CTF.
4. **GitHub Fetcher:** Pengambilan data *challenge* berbasis Markdown `.md` langsung dari repositori publik GitHub, beserta limitasi keamanan anti-spam (maksimal 5 *file* dan 10 *chunk*).
5. **Role-Based Access Control (RBAC):** Proteksi perintah berisiko tinggi (`/hapus`) yang dipetakan pada *Environment Variables* (`ADMIN_ROLE_IDS`).
6. **Smart Channel Detection:** Perutean pesan pintar yang mencari *channel* tujuan berbasis struktur penamaan (misal: memprioritaskan kata `info-mabar`, lalu `mabar-chat` apabila channel spesifik tidak dikonfigurasi).

## Out-of-Scope (Tidak Termasuk dalam Sistem)
Fungsionalitas berikut **tidak** termasuk dalam fokus pengembangan:
1. **Fitur Audio/Voice:** Pemutaran musik (*Music Bot*), merekam suara dari *voice channel*, atau *Text-to-Speech* (TTS).
2. **Sistem Leveling & Ekonomi:** Fitur *gamification*, sistem *experience points* (XP), mata uang virtual peladen, maupun jual-beli peran (*Role Shop*).
3. **Web Dashboard Independen:** Sistem ini sangat bergantung pada Google Sheets sebagai Graphical User Interface (GUI) bagi administrasi *database*, sehingga tidak disediakan sebuah web kontrol panel berbasis React/Vue untuk melihat *log* bot.
4. **Otentikasi Akun CTFtime:** Fitur yang mengharuskan bot untuk *login* ke profil pribadi pengguna di CTFtime (hanya mengekstraksi data publik).