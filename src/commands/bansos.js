const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const { isAdmin } = require("../utils/permissionGuard");
const { replyError, replySuccess, createEmbed } = require("../utils/replyEmbed");

function createBansosCommand(bansosService) {
  return {
    async execute(interaction) {
      const subcommand = interaction.options.getSubcommand();

      // 1. Cek stok (Bisa diakses publik atau admin)
      if (subcommand === "stock") {
        const stock = bansosService.getStockSummary();
        const embed = createEmbed(
          "info",
          "📦 Sisa Stok Bansos Novatria",
          "Berikut adalah sisa stok akun & API key yang tersedia saat ini:",
          [
            {
              name: "🎁 Akun Premium",
              value: `Tersedia: **${stock.accounts.available}**\nDiklaim: **${stock.accounts.claimed}**`,
              inline: true,
            },
            {
              name: "🔑 API Key Gratis",
              value: `Tersedia: **${stock.apis.available}**\nDiklaim: **${stock.apis.claimed}**`,
              inline: true,
            },
          ]
        );
        return interaction.editReply({ embeds: [embed] });
      }

      // Subcommand add & drop hanya untuk Admin
      if (!isAdmin(interaction)) {
        return replyError(
          interaction,
          "Akses Ditolak",
          "Perintah pengelolaan bansos hanya dapat digunakan oleh Administrator."
        );
      }

      // 2. Tambah Stok
      if (subcommand === "add") {
        const tipe = interaction.options.getString("tipe");
        const label = interaction.options.getString("label");
        const konten = interaction.options.getString("konten");

        if (tipe === "account") {
          bansosService.addAccount(label, konten);
        } else {
          bansosService.addApi(label, konten);
        }

        return replySuccess(
          interaction,
          "Stok Berhasil Ditambahkan",
          `Berhasil menambahkan 1 item **${tipe === "account" ? "Akun" : "API Key"}** [${label}] ke database!`
        );
      }

      // 3. Drop Panel Bansos ke Channel
      if (subcommand === "drop") {
        const tipe = interaction.options.getString("tipe");
        const targetChannel =
          interaction.options.getChannel("channel") || interaction.channel;

        if (tipe === "account") {
          const embed = new EmbedBuilder()
            .setColor(0x3fb950)
            .setTitle("🎁 DROP BANSOS: Akun Premium Gratis!")
            .setDescription(
              "Halo semuanya! Bansos akun gratis sudah dibuka.\n\n" +
                "📌 **Ketentuan:**\n" +
                "• Klik tombol di bawah untuk mengklaim akun.\n" +
                "• Detail akun akan dikirim secara **rahasia (hanya Anda yang bisa melihat)**.\n" +
                "• Setiap member dibatasi **1 kali klaim** agar merata.\n\n" +
                "Silakan klik tombol di bawah untuk klaim sekarang!"
            )
            .setFooter({ text: "Novatria Bansos System • Cepat sebelum kehabisan!" })
            .setTimestamp();

          const button = new ButtonBuilder()
            .setCustomId("btn_claim_account")
            .setLabel("🎁 Klaim Akun Gratis")
            .setStyle(ButtonStyle.Success);

          const row = new ActionRowBuilder().addComponents(button);

          await targetChannel.send({ embeds: [embed], components: [row] });
        } else {
          const embed = new EmbedBuilder()
            .setColor(0x58a6ff)
            .setTitle("🔑 DROP BANSOS: API Key AI & Dev Gratis!")
            .setDescription(
              "Halo developers & AI enthusiast! Bansos API Key gratis sudah dibuka.\n\n" +
                "📌 **Ketentuan:**\n" +
                "• Klik tombol di bawah untuk mengklaim API Key.\n" +
                "• API Key akan dikirim secara **rahasia (hanya Anda yang bisa melihat)**.\n" +
                "• Setiap member dibatasi **1 kali klaim**.\n\n" +
                "Silakan klik tombol di bawah untuk klaim sekarang!"
            )
            .setFooter({ text: "Novatria Bansos System • Happy Coding!" })
            .setTimestamp();

          const button = new ButtonBuilder()
            .setCustomId("btn_claim_api")
            .setLabel("🔑 Klaim API Key")
            .setStyle(ButtonStyle.Primary);

          const row = new ActionRowBuilder().addComponents(button);

          await targetChannel.send({ embeds: [embed], components: [row] });
        }

        return replySuccess(
          interaction,
          "Panel Bansos Terkirim",
          `Panel klaim bansos **${tipe === "account" ? "Akun" : "API"}** berhasil dikirim ke <#${targetChannel.id}>!`
        );
      }
    },
  };
}

module.exports = createBansosCommand;
