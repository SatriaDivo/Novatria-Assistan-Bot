const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const config = require("../config");
const mabarService = require("../services/mabarService");

async function execute(interaction) {
  const game = interaction.options.getString("game");
  const slot = interaction.options.getInteger("slot");
  const jam = interaction.options.getString("jam") || "Sekarang";
  const catatan = interaction.options.getString("catatan") || "-";

  // Kirim placeholder pesan terlebih dahulu untuk mendapatkan messageId
  const roleMention = config.roles.gamers ? `<@&${config.roles.gamers}>` : "";
  const content = roleMention ? `📢 **Ayo Mabar!** ${roleMention}` : "📢 **Ayo Mabar!**";

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_mabar_join")
      .setLabel("🟢 Ikut Mabar")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("btn_mabar_leave")
      .setLabel("🔴 Batal Ikut")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("btn_mabar_cancel")
      .setLabel("❌ Akhiri / Batalkan")
      .setStyle(ButtonStyle.Danger)
  );

  // Buat sesi sementara
  const tempEmbed = mabarService.buildMabarEmbed({
    hostId: interaction.user.id,
    game,
    maxSlots: slot,
    note: catatan,
    time: jam,
    participants: [interaction.user.id],
  });

  const msg = await interaction.channel.send({
    content,
    embeds: [tempEmbed],
    components: [buttons],
  });

  // Simpan sesi dengan messageId aktual
  mabarService.createSession(msg.id, interaction.user.id, game, slot, catatan, jam);

  return interaction.editReply({
    content: "✅ Ajakan mabar berhasil dibuat di channel ini!",
  });
}

module.exports = { execute };
