const { SlashCommandBuilder, ChannelType } = require("discord.js");

const commands = [
  // 1. Remote Controller Hermes (Admin Only)
  new SlashCommandBuilder()
    .setName("hermes")
    .setDescription("Panel kontrol Hermes daemon & host VPS (Admin Only)")
    .addSubcommand((sub) =>
      sub.setName("status").setDescription("Cek status daemon Hermes dan penggunaan resource VPS")
    )
    .addSubcommand((sub) =>
      sub
        .setName("cmd")
        .setDescription("Jalankan perintah shell/CLI di VPS")
        .addStringOption((opt) =>
          opt
            .setName("command")
            .setDescription("Perintah shell yang ingin dijalankan (contoh: hermes status, docker ps)")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("restart").setDescription("Restart service/daemon Hermes di host VPS")
    ),

  // 2. Manajemen Bansos Akun & API
  new SlashCommandBuilder()
    .setName("bansos")
    .setDescription("Kelola pembagian bansos akun & API gratis")
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Tambah stok akun atau API key baru (Admin Only)")
        .addStringOption((opt) =>
          opt
            .setName("tipe")
            .setDescription("Jenis bansos")
            .setRequired(true)
            .addChoices(
              { name: "Akun (Canva, Spotify, VPN, dll)", value: "account" },
              { name: "API Key (OpenAI, DeepSeek, Groq, dll)", value: "api" }
            )
        )
        .addStringOption((opt) =>
          opt
            .setName("label")
            .setDescription("Nama/label (contoh: Canva Pro, OpenAI GPT-4)")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("konten")
            .setDescription("Email:password akun ATAU string API Key")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("stock").setDescription("Lihat sisa kuota stok bansos yang tersedia")
    )
    .addSubcommand((sub) =>
      sub
        .setName("drop")
        .setDescription("Kirim panel embed klaim bansos ke channel publik (Admin Only)")
        .addStringOption((opt) =>
          opt
            .setName("tipe")
            .setDescription("Jenis panel yang ingin di-drop")
            .setRequired(true)
            .addChoices(
              { name: "Panel Akun Gratis", value: "account" },
              { name: "Panel API Key Gratis", value: "api" }
            )
        )
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Channel tujuan drop panel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
    ),

  // 3. Panel Ambil Role (Self-Role)
  new SlashCommandBuilder()
    .setName("rolepanel")
    .setDescription("Kirim panel interaktif ambil role ke channel (Admin Only)")
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Channel tujuan panel role (default: channel saat ini)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),

  // 4. Setup Dynamic Server Stats
  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Kelola channel statistik server (Admin Only)")
    .addSubcommand((sub) =>
      sub.setName("setup").setDescription("Buat channel voice statistik member otomatis di atas server")
    )
    .addSubcommand((sub) =>
      sub.setName("sync").setDescription("Sinkronkan ulang jumlah member ke channel stats")
    ),

  // 5. Interactive Mabar Coordinator
  new SlashCommandBuilder()
    .setName("mabar")
    .setDescription("Ajak teman server untuk mabar game favoritmu")
    .addStringOption((opt) =>
      opt
        .setName("game")
        .setDescription("Nama game (contoh: Mobile Legends, Valorant, Dota 2)")
        .setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt
        .setName("slot")
        .setDescription("Jumlah maksimal pemain (2 - 10)")
        .setMinValue(2)
        .setMaxValue(10)
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("jam")
        .setDescription("Jam atau waktu main (contoh: 20:00 WIB, Sekarang)")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("catatan")
        .setDescription("Catatan tambahan (contoh: Rank Gold, have fun)")
        .setRequired(false)
    ),

  // 6. In-House Support Ticket
  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Kelola sistem tiket bantuan (Admin Only)")
    .addSubcommand((sub) =>
      sub
        .setName("panel")
        .setDescription("Kirim panel tombol buka tiket bantuan")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Channel tujuan penempatan panel tiket")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
    ),
];

module.exports = commands;
