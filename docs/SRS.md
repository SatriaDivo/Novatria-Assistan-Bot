# Software Requirements Specification (SRS)

## 1. Pendahuluan
Dokumen **Software Requirements Specification (SRS)** ini mendefinisikan secara rinci spesifikasi teknis, arsitektur, dan kebutuhan fungsional (Functional Requirements) serta non-fungsional (Non-Functional Requirements) dari **Novatria Assistant Bot**.

## 2. Struktur Dokumen SRS
SRS ini dibagi menjadi komponen-komponen yang berfokus pada fitur spesifik bot:

### Kebutuhan Fungsional (Functional Requirements)
- [FR: Manajemen Catatan & Produktivitas](srs/fr-notes.md)
- [FR: CTF Tracking & Workflow](srs/fr-ctf.md)
- [FR: Integrasi Google Sheets](srs/fr-google-sheets.md)
- [FR: Integrasi Eksternal API (CTFtime)](srs/fr-api.md)
- [FR: Integrasi GitHub API](srs/fr-github.md)
- [FR: Sistem Otomasi & Notifikasi](srs/fr-notifications.md)
- [FR: Autentikasi & Keamanan (Role & Permission)](srs/fr-auth.md)

### Data & Performa
- [Database & Data Schema](srs/database_schema.md)
- [Non-Functional Requirements (NFR)](srs/nfr.md)

## 3. Arsitektur Sistem
Sistem ini menggunakan arsitektur modular yang terdiri dari:
- **Discord Client:** Node.js + Discord.js v14 sebagai frontend bot.
- **Database/Storage:** Google Sheets sebagai database utama melalui Google Apps Script Web App.
- **Eksternal API:** CTFtime API (public event) dan GitHub API (fetching markdown challenge).
- **Deployment:** Docker Engine dengan persistent volume mounting untuk menyimpan status lokal (notifikasi).