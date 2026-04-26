const { EmbedBuilder } = require("discord.js");
const getTargetChannel = require("../utils/getTargetChannel");
const kirimKeChannel = require("../utils/kirimKeChannel");
const simpanKeSheet = require("../utils/sheet");
const buatId = require("../utils/buatId");
const { replyError, replySuccess } = require("../utils/replyEmbed");

async function execute(interaction) {
  const id = buatId("arsip");
  const isi = interaction.options.getString("isi");
  const channelArsip = await getTargetChannel(interaction.guild, "arsip", "arsip");

  if (!channelArsip) {
    return replyError(interaction, "Channel tidak ditemukan", "Channel arsip tidak ditemukan.");
  }

  const embed = new EmbedBuilder()
    .setColor(0x8b949e)
    .setTitle("🗄️ Arsip Baru")
    .setDescription(isi)
    .addFields({ name: "ID", value: id, inline: true })
    .setFooter({ text: `Dibuat oleh ${interaction.user.tag}` })
    .setTimestamp();

  const hasilKirim = await kirimKeChannel(interaction, channelArsip, {
    embeds: [embed],
  });

  if (!hasilKirim.ok) {
    return replyError(interaction, "Gagal mengirim arsip", hasilKirim.error);
  }

  await simpanKeSheet("arsip", {
    id,
    user: interaction.user.tag,
    userId: interaction.user.id,
    server: interaction.guild.name,
    channel: channelArsip.name,
    isi,
  });

  await replySuccess(interaction, "Arsip berhasil", `Arsip berhasil dikirim ke ${channelArsip}.`, [
    { name: "ID", value: `\`${id}\`` },
  ]);
}

module.exports = { execute };
