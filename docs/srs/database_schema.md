# Database Schema (Google Sheets)

Novatria-Bot menggunakan **Google Sheets** sebagai penyimpanan database relasional sederhana (flat-file format). Komunikasi antar Node.js dan Google Sheets diatur oleh Google Apps Script Web App yang mengurai data JSON.

## Konsep Penyimpanan
Setiap tipe data memiliki entitas "Sheet" masing-masing. Jika sheet tidak tersedia, admin Google Sheets harus membuatnya secara manual sesuai skema. Skema menggunakan pengenal unik (ID) berawalan tipe data (misal: `CAT-`, `TODO-`).

### 1. Struktur Payload Standar (JSON)
Backend Node.js mengirimkan objek JSON standar menuju endpoint `SHEET_WEBAPP_URL`:
```json
{
  "secret": "STRING",      // API Key untuk otentikasi
  "action": "STRING",      // "append", "delete", "update_status"
  "type": "STRING",        // Kategori sheet: "catat", "todo", "ctf", dll
  "data": {                // Object kolom data
     "id": "STRING",
     "user": "STRING",
     "userId": "STRING",
     "server": "STRING",
     "channel": "STRING",
     // ... field tambahan sesuai tipe
  }
}
```

### 2. Skema Tabel (Sheet)

#### A. Sheet `Catatan`, `Link`, `Arsip`
| Kolom A | Kolom B | Kolom C | Kolom D | Kolom E | Kolom F | Kolom G | Kolom H |
|---------|---------|---------|---------|---------|---------|---------|---------|
| Timestamp | ID | User | User ID | Server | Channel | Judul/Url | Isi/Catatan |

#### B. Sheet `Todo`
| Kolom A | Kolom B | Kolom C | Kolom D | Kolom E | Kolom F | Kolom G | Kolom H | Kolom I |
|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| Timestamp | ID | User | User ID | Server | Channel | Tugas | **Status** | Waktu Selesai |
*Catatan: Kolom Status dapat diupdate nilainya menjadi `Selesai` via `/done`.*

#### C. Sheet `Jadwal` & `Mabar`
| Kolom A | Kolom B | Kolom C | Kolom D | Kolom E | Kolom F | Kolom G | Kolom H | Kolom I | Kolom J | Kolom K |
|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| Timestamp | ID | User | User ID | Server | Channel | Judul/Game | Waktu Mulai | Waktu Selesai | Tanggal | Catatan |

#### D. Sheet `CTF Challenge` & `CTF Tantangan`
| Kolom A | Kolom B | Kolom C | Kolom D | Kolom E | Kolom F | Kolom G | Kolom H | Kolom I | Kolom J |
|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| Timestamp | ID | User | User ID | Server | Channel | Nama/Judul | Platform/URL | Kategori/Hadiah | Catatan |

#### E. Sheet `CTF Writeup` & `CTF Progress`
| Kolom A | Kolom B | Kolom C | Kolom D | Kolom E | Kolom F | Kolom G | Kolom H | Kolom I |
|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| Timestamp | ID | User | User ID | Server | Channel | Judul / Challenge | Ringkasan / Status | URL / Catatan |

#### F. Sheet `Log`
| Kolom A | Kolom B | Kolom C | Kolom D | Kolom E |
|---------|---------|---------|---------|---------|
| Timestamp | Tipe Aksi | User | Channel | Detail |

## Local Volume Storage (JSON Database)
Untuk data yang memerlukan latensi rendah atau sinkronisasi lokal, bot menyimpan file di `./data/` menggunakan sistem *file-based mapping*:
- `ctftime-settings.json`: Menyimpan status konfigurasi apakah `/ctfnotify` sedang `on` atau `off`.
- `ctftime-seen.json`: Menyimpan daftar ID Lomba H-3 yang sudah diumumkan, sehingga tidak ada spam pesan ganda.