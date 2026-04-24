const { EmbedBuilder } = require("discord.js");
const getTargetChannel = require("../utils/getTargetChannel");
const kirimKeChannel = require("../utils/kirimKeChannel");
const simpanKeSheet = require("../utils/sheet");

async function execute(interaction) {
  const isi = interaction.options.getString("isi");
  const channelCatatan = await getTargetChannel(interaction.guild, "catatan", "catatan");

  if (!channelCatatan) {
    return interaction.editReply({
      content: "❌ Channel catatan tidak ditemukan.",
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0x4f8cff)
    .setTitle("📝 Catatan Baru")
    .setDescription(isi)
    .setFooter({ text: `Dibuat oleh ${interaction.user.tag}` })
    .setTimestamp();

  const hasilKirim = await kirimKeChannel(interaction, channelCatatan, {
    embeds: [embed],
  });

  if (!hasilKirim.ok) {
    return interaction.editReply({ content: hasilKirim.error });
  }

  await simpanKeSheet("catat", {
    user: interaction.user.tag,
    userId: interaction.user.id,
    server: interaction.guild.name,
    channel: channelCatatan.name,
    isi,
  });

  await interaction.editReply({
    content: `✅ Catatan berhasil dikirim ke ${channelCatatan}.`,
  });
}

module.exports = { execute };
