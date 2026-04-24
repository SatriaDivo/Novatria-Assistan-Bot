const { EmbedBuilder } = require("discord.js");
const getTargetChannel = require("../utils/getTargetChannel");
const kirimKeChannel = require("../utils/kirimKeChannel");
const simpanKeSheet = require("../utils/sheet");
const buatId = require("../utils/buatId");

async function execute(interaction) {
  const id = buatId("jadwal");
  const judul = interaction.options.getString("judul");
  const tanggal = interaction.options.getString("tanggal");
  const jam = interaction.options.getString("jam");
  const catatan = interaction.options.getString("catatan") || "-";
  const channelJadwal = await getTargetChannel(interaction.guild, "jadwal", "jadwal");

  if (!/^\d{1,2}:\d{2}$/.test(jam)) {
    return interaction.editReply({
      content: "❌ Format jam tidak valid. Contoh: `20:00`",
    });
  }

  if (!channelJadwal) {
    return interaction.editReply({
      content: "❌ Channel jadwal tidak ditemukan.",
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0xd29922)
    .setTitle(`📅 ${judul}`)
    .addFields(
      { name: "ID", value: id, inline: true },
      { name: "Tanggal", value: tanggal, inline: true },
      { name: "Jam", value: jam, inline: true },
      { name: "Catatan", value: catatan }
    )
    .setFooter({ text: `Dibuat oleh ${interaction.user.tag}` })
    .setTimestamp();

  const hasilKirim = await kirimKeChannel(interaction, channelJadwal, {
    embeds: [embed],
  });

  if (!hasilKirim.ok) {
    return interaction.editReply({ content: hasilKirim.error });
  }

  await simpanKeSheet("jadwal", {
    id,
    user: interaction.user.tag,
    userId: interaction.user.id,
    server: interaction.guild.name,
    channel: channelJadwal.name,
    judul,
    tanggal,
    jam,
    catatan,
  });

  await interaction.editReply({
    content: `✅ Jadwal berhasil dikirim ke ${channelJadwal}. ID: \`${id}\``,
  });
}

module.exports = { execute };
