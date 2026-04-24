const { SlashCommandBuilder } = require("discord.js");

// Definisi semua slash command yang akan didaftarkan ke Discord.
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Cek apakah bot aktif"),

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Cek konfigurasi channel dan Google Sheet"),

  new SlashCommandBuilder()
    .setName("catat")
    .setDescription("Kirim catatan ke channel catatan")
    .addStringOption(option =>
      option
        .setName("isi")
        .setDescription("Isi catatan kamu")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("todo")
    .setDescription("Kirim tugas ke channel todo-list")
    .addStringOption(option =>
      option
        .setName("tugas")
        .setDescription("Tugas yang ingin ditambahkan")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("link")
    .setDescription("Kirim link penting")
    .addStringOption(option =>
      option
        .setName("url")
        .setDescription("URL link")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("judul")
        .setDescription("Judul link")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("catatan")
        .setDescription("Catatan tambahan")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("jadwal")
    .setDescription("Kirim jadwal")
    .addStringOption(option =>
      option
        .setName("judul")
        .setDescription("Judul jadwal")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("tanggal")
        .setDescription("Tanggal jadwal")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("jam")
        .setDescription("Jam jadwal")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("catatan")
        .setDescription("Catatan tambahan")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("arsip")
    .setDescription("Kirim arsip")
    .addStringOption(option =>
      option
        .setName("isi")
        .setDescription("Isi arsip")
        .setRequired(true)
    ),
];

module.exports = commands.map(command => command.toJSON());
