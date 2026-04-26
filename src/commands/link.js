const { EmbedBuilder } = require("discord.js");
const getTargetChannel = require("../utils/getTargetChannel");
const kirimKeChannel = require("../utils/kirimKeChannel");
const simpanKeSheet = require("../utils/sheet");
const buatId = require("../utils/buatId");
const { replyError, replySuccess } = require("../utils/replyEmbed");

async function execute(interaction) {
  const id = buatId("link");
  const url = interaction.options.getString("url");
  const judul = interaction.options.getString("judul");
  const catatan = interaction.options.getString("catatan") || "-";
  const channelLink = await getTargetChannel(interaction.guild, "link", "link-penting");

  try {
    new URL(url);
  } catch {
    return replyError(
      interaction,
      "URL tidak valid",
      "Contoh URL yang benar: `https://example.com`."
    );
  }

  if (!channelLink) {
    return replyError(
      interaction,
      "Channel tidak ditemukan",
      "Channel link-penting tidak ditemukan."
    );
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
    return replyError(interaction, "Gagal mengirim link", hasilKirim.error);
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

  await replySuccess(interaction, "Link berhasil", `Link berhasil dikirim ke ${channelLink}.`, [
    { name: "ID", value: `\`${id}\`` },
  ]);
}

module.exports = { execute };
