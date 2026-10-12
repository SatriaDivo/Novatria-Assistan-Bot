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
      "Hanya Administrator yang dapat mengirim panel role."
    );
  }

  const targetChannel =
    interaction.options.getChannel("channel") || interaction.channel;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🎭 Ambil Role Komunitas Novatria")
    .setDescription(
      "Pilih role yang ingin kamu miliki dengan menekan tombol di bawah ini.\n" +
        "Tekan tombol sekali untuk mengambil role, tekan lagi untuk melepasnya.\n\n" +
        "🎁 **Bansos Hunter:** Dapatkan notifikasi saat ada drop akun / API gratis.\n" +
        "🎮 **Gamers / Mabar:** Dapatkan notifikasi saat ada ajakan mabar game."
    )
    .setFooter({ text: "Novatria Role System" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_role_bansos")
      .setLabel("🎁 Bansos Hunter")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("btn_role_gamers")
      .setLabel("🎮 Gamers / Mabar")
      .setStyle(ButtonStyle.Primary)
  );

  await targetChannel.send({ embeds: [embed], components: [row] });

  return replySuccess(
    interaction,
    "Panel Role Terkirim",
    `Panel ambil role berhasil dikirim ke <#${targetChannel.id}>!`
  );
}

module.exports = { execute };
