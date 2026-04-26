const { SlashCommandBuilder } = require("discord.js");

// Definisi semua slash command yang akan didaftarkan ke Discord.
const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Cek apakah bot aktif"),

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
        .addChoices(
          { name: "Catatan", value: "catat" },
          { name: "Todo", value: "todo" },
          { name: "Link", value: "link" },
          { name: "Jadwal", value: "jadwal" },
          { name: "Arsip", value: "arsip" }
        )
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
        .addChoices(
          { name: "Catatan", value: "catat" },
          { name: "Todo", value: "todo" },
          { name: "Link", value: "link" },
          { name: "Jadwal", value: "jadwal" },
          { name: "Arsip", value: "arsip" }
        )
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
    .addIntegerOption((option) =>
      option
        .setName("tanggal")
        .setDescription("Tanggal/hari, contoh: 30")
        .setMinValue(1)
        .setMaxValue(31)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("bulan")
        .setDescription("Bulan, contoh: 4 untuk April")
        .setMinValue(1)
        .setMaxValue(12)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("tahun")
        .setDescription("Tahun, contoh: 2026")
        .setMinValue(2000)
        .setMaxValue(2100)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("jam").setDescription("Jam mulai, format HH:mm").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("selesai").setDescription("Jam selesai, format HH:mm").setRequired(false)
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
];

module.exports = commands.map((command) => command.toJSON());
