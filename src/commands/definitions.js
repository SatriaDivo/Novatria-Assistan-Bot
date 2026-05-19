const { SlashCommandBuilder } = require("discord.js");

const dataTypeChoices = [
  { name: "Catatan", value: "catat" },
  { name: "Todo", value: "todo" },
  { name: "Link", value: "link" },
  { name: "Jadwal", value: "jadwal" },
  { name: "Mabar", value: "mabar" },
  { name: "Arsip", value: "arsip" },
  { name: "CTF Challenge", value: "ctf_challenge" },
  { name: "CTF Writeup", value: "ctf_writeup" },
  { name: "CTF Progress", value: "ctf_progress" },
  { name: "CTF Tantangan", value: "ctf_tantangan" },
];

// Definisi semua slash command yang akan didaftarkan ke Discord.
const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Cek apakah bot aktif"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lihat daftar command Novatria Assistant"),

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Cek konfigurasi channel dan Google Sheet"),

  new SlashCommandBuilder()
    .setName("list")
    .setDescription("Lihat data terbaru sebelum menghapus")
    .addStringOption((option) =>
      option
        .setName("tipe")
        .setDescription("Jenis data yang ingin dilihat")
        .setRequired(true)
        .addChoices(...dataTypeChoices)
    )
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setDescription("Jumlah data yang ditampilkan")
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("hapus")
    .setDescription("Hapus data dari Google Sheet berdasarkan ID")
    .addStringOption((option) =>
      option
        .setName("tipe")
        .setDescription("Jenis data yang ingin dihapus")
        .setRequired(true)
        .addChoices(...dataTypeChoices)
    )
    .addStringOption((option) =>
      option.setName("id").setDescription("ID data dari hasil /list").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("catat")
    .setDescription("Kirim catatan ke channel catatan")
    .addStringOption((option) =>
      option.setName("isi").setDescription("Isi catatan kamu").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("todo")
    .setDescription("Kirim tugas ke channel todo-list")
    .addStringOption((option) =>
      option.setName("tugas").setDescription("Tugas yang ingin ditambahkan").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("done")
    .setDescription("Tandai todo sebagai selesai")
    .addStringOption((option) =>
      option.setName("id").setDescription("ID todo dari hasil /list").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("link")
    .setDescription("Kirim link penting")
    .addStringOption((option) => option.setName("url").setDescription("URL link").setRequired(true))
    .addStringOption((option) =>
      option.setName("judul").setDescription("Judul link").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("catatan").setDescription("Catatan tambahan").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("jadwal")
    .setDescription("Kirim jadwal")
    .addStringOption((option) =>
      option.setName("judul").setDescription("Judul jadwal").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("jam").setDescription("Jam mulai, format HH:mm").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("tanggal")
        .setDescription("Tanggal/hari, contoh: 30. Kosongkan untuk hari ini")
        .setMinValue(1)
        .setMaxValue(31)
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("bulan")
        .setDescription("Bulan, contoh: 4 untuk April. Kosongkan untuk hari ini")
        .setMinValue(1)
        .setMaxValue(12)
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("tahun")
        .setDescription("Tahun, contoh: 2026. Kosongkan untuk hari ini")
        .setMinValue(2000)
        .setMaxValue(2100)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("selesai").setDescription("Jam selesai, format HH:mm").setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("catatan").setDescription("Catatan tambahan").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("mabar")
    .setDescription("Buat jadwal mabar")
    .addStringOption((option) =>
      option.setName("game").setDescription("Nama game").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("jam").setDescription("Jam mabar, format HH:mm").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("tanggal")
        .setDescription("Tanggal/hari, contoh: 30. Kosongkan untuk hari ini")
        .setMinValue(1)
        .setMaxValue(31)
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("bulan")
        .setDescription("Bulan, contoh: 4 untuk April. Kosongkan untuk hari ini")
        .setMinValue(1)
        .setMaxValue(12)
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("tahun")
        .setDescription("Tahun, contoh: 2026. Kosongkan untuk hari ini")
        .setMinValue(2000)
        .setMaxValue(2100)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("catatan").setDescription("Catatan tambahan").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("arsip")
    .setDescription("Kirim arsip")
    .addStringOption((option) =>
      option.setName("isi").setDescription("Isi arsip").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ctfevent")
    .setDescription("Lihat event CTF upcoming dari CTFtime")
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setDescription("Jumlah event yang ditampilkan")
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("ctfcek")
    .setDescription("Kirim info lomba CTF upcoming ke channel CTF"),

  new SlashCommandBuilder()
    .setName("ctfnotify")
    .setDescription("Atur notifikasi otomatis H-3 lomba CTFtime")
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("Status notifikasi CTFtime")
        .setRequired(true)
        .addChoices({ name: "on", value: "on" }, { name: "off", value: "off" })
    ),

  new SlashCommandBuilder()
    .setName("ctf")
    .setDescription("Tambah challenge CTF ke channel target")
    .addStringOption((option) =>
      option.setName("nama").setDescription("Nama challenge CTF").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("platform").setDescription("Nama platform CTF").setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("url").setDescription("URL challenge atau platform").setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("kategori")
        .setDescription("Kategori, contoh: web, crypto, pwn")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("catatan")
        .setDescription("Catatan, hint, atau target belajar")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("writeup")
    .setDescription("Simpan writeup CTF")
    .addStringOption((option) =>
      option.setName("judul").setDescription("Judul writeup").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("challenge").setDescription("Nama challenge terkait").setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("ringkasan").setDescription("Ringkasan pembahasan").setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("url").setDescription("URL writeup jika ada").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("progress")
    .setDescription("Update progress challenge CTF")
    .addStringOption((option) =>
      option.setName("challenge").setDescription("Nama challenge CTF").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("Status pengerjaan")
        .setRequired(true)
        .addChoices(
          { name: "Belum mulai", value: "todo" },
          { name: "Sedang dikerjakan", value: "proses" },
          { name: "Stuck / butuh hint", value: "stuck" },
          { name: "Selesai", value: "selesai" }
        )
    )
    .addStringOption((option) =>
      option.setName("catatan").setDescription("Catatan progress").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("tantangan")
    .setDescription("Tambah tantangan dari GitHub (auto-baca MD & download file)")
    .addStringOption((option) =>
      option.setName("url").setDescription("URL GitHub repo/folder challenge").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("judul").setDescription("Judul tantangan (opsional)").setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("hadiah")
        .setDescription("Hadiah tantangan, contoh: Rp500.000 (opsional)")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("interrupter")
    .setDescription("Atur fitur bot pemotong pembicaraan (Voice Interrupter)")
    .addSubcommand(subcommand =>
      subcommand
        .setName("toggle")
        .setDescription("Aktifkan atau matikan fitur interrupter")
        .addStringOption(option =>
          option.setName("status")
            .setDescription("Status")
            .setRequired(true)
            .addChoices({ name: "ON", value: "on" }, { name: "OFF", value: "off" })
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("target")
        .setDescription("Atur target yang akan diinterupsi")
        .addRoleOption(option => option.setName("role").setDescription("Role target (opsional)").setRequired(false))
        .addUserOption(option => option.setName("user").setDescription("User target (opsional)").setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("sound")
        .setDescription("Pilih suara yang akan dimainkan")
        .addStringOption(option => option.setName("nama").setDescription("Nama file suara tanpa ekstensi, contoh: donnie").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("status")
        .setDescription("Lihat status interrupter saat ini")
    ),
];

module.exports = commands.map((command) => command.toJSON());
