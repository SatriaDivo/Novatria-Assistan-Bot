const { EmbedBuilder } = require("discord.js");
const getTargetChannel = require("../utils/getTargetChannel");
const kirimKeChannel = require("../utils/kirimKeChannel");
const simpanKeSheet = require("../utils/sheet");
const buatId = require("../utils/buatId");

async function execute(interaction) {
  const id = buatId("link");
  const url = interaction.options.getString("url");
  const judul = interaction.options.getString("judul");
  const catatan = interaction.options.getString("catatan") || "-";
  const channelLink = await getTargetChannel(interaction.guild, "link", "link-penting");

  try {
    new URL(url);
  } catch {
    return interaction.editReply({
      content: "❌ URL tidak valid. Contoh: `https://example.com`",
    });
  }

  if (!channelLink) {
    return interaction.editReply({
      content: "❌ Channel link-penting tidak ditemukan.",
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0xf2cc60)
    .setTitle(`🔗 ${judul}`)
    .setURL(url)
    .setDescription(catatan)
    .addFields({ name: "ID", value: id, inline: true }, { name: "URL", value: url })
    .setFooter({ text: `Dibuat oleh ${interaction.user.tag}` })
    .setTimestamp();

  const hasilKirim = await kirimKeChannel(interaction, channelLink, {
    embeds: [embed],
  });

  if (!hasilKirim.ok) {
    return interaction.editReply({ content: hasilKirim.error });
  }

  await simpanKeSheet("link", {
    id,
    user: interaction.user.tag,
    userId: interaction.user.id,
    server: interaction.guild.name,
    channel: channelLink.name,
    judul,
    url,
    catatan,
  });

  await interaction.editReply({
    content: `✅ Link berhasil dikirim ke ${channelLink}. ID: \`${id}\``,
  });
}

module.exports = { execute };
