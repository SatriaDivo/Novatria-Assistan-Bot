const { EmbedBuilder } = require("discord.js");
const getTargetChannel = require("../utils/getTargetChannel");
const kirimKeChannel = require("../utils/kirimKeChannel");
const simpanKeSheet = require("../utils/sheet");
const buatId = require("../utils/buatId");

async function execute(interaction) {
  const id = buatId("arsip");
  const isi = interaction.options.getString("isi");
  const channelArsip = await getTargetChannel(interaction.guild, "arsip", "arsip");

  if (!channelArsip) {
    return interaction.editReply({
      content: "❌ Channel arsip tidak ditemukan.",
    });
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
    return interaction.editReply({ content: hasilKirim.error });
  }

  await simpanKeSheet("arsip", {
    id,
    user: interaction.user.tag,
    userId: interaction.user.id,
    server: interaction.guild.name,
    channel: channelArsip.name,
    isi,
  });

  await interaction.editReply({
    content: `✅ Arsip berhasil dikirim ke ${channelArsip}. ID: \`${id}\``,
  });
}

module.exports = { execute };
