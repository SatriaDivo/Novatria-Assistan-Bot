const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const { isAdmin } = require("../utils/permissionGuard");
const { replyError, replySuccess } = require("../utils/replyEmbed");

async function execute(interaction) {
  if (!isAdmin(interaction)) {
    return replyError(
      interaction,
      "Akses Ditolak",
      "Perintah panel tiket hanya dapat digunakan oleh Administrator."
    );
  }

  const targetChannel =
    interaction.options.getChannel("channel") || interaction.channel;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🎫 Layanan Bantuan & Support Novatria")
    .setDescription(
      "Apakah kamu mengalami kendala dengan akun bansos, API key, atau memiliki pertanyaan untuk Admin?\n\n" +
        "Klik tombol **[📩 Buka Tiket]** di bawah ini untuk membuat ruang obrolan privat bersama tim admin kami.\n" +
        "Harap sampaikan kendala kamu secara jelas dan sopan."
    )
    .setFooter({ text: "Novatria Support Desk • Siap membantu kamu!" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_ticket_create")
      .setLabel("📩 Buka Tiket Bantuan")
      .setStyle(ButtonStyle.Primary)
  );

  await targetChannel.send({ embeds: [embed], components: [row] });

  return replySuccess(
    interaction,
    "Panel Tiket Terkirim",
    `Panel tiket berhasil dikirim ke <#${targetChannel.id}>!`
  );
}

module.exports = { execute };
