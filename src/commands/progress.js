const { EmbedBuilder } = require("discord.js");
const buatId = require("../utils/buatId");
const { assertCtfCommandChannel } = require("../utils/ctfChannelGuard");
const { findCtfContentChannel } = require("../utils/ctfChannels");
const kirimKeChannel = require("../utils/kirimKeChannel");
const simpanKeSheet = require("../utils/sheet");
const { replyError, replySuccess } = require("../utils/replyEmbed");

const statusLabels = {
  todo: "Belum mulai",
  proses: "Sedang dikerjakan",
  stuck: "Stuck / butuh hint",
  selesai: "Selesai",
};

async function execute(interaction) {
  if (!(await assertCtfCommandChannel(interaction))) {
    return;
  }

  const id = buatId("progress");
  const challenge = interaction.options.getString("challenge", true);
  const status = interaction.options.getString("status", true);
  const catatan = interaction.options.getString("catatan") || "-";
  const progressChannel = findCtfContentChannel(interaction.guild, "ctf-progress");

  if (!progressChannel) {
    return replyError(
      interaction,
      "Channel tidak ditemukan",
      "Channel ctf-progress tidak ditemukan."
    );
  }

  const embed = new EmbedBuilder()
    .setColor(status === "selesai" ? 0x3fb950 : 0xf2cc60)
    .setTitle(`🏆 Progress CTF: ${challenge}`)
    .setDescription(catatan)
    .addFields(
      { name: "ID", value: id, inline: true },
      { name: "Status", value: statusLabels[status] || status, inline: true }
    )
    .setFooter({ text: `Diupdate oleh ${interaction.user.tag}` })
    .setTimestamp();

  const hasilKirim = await kirimKeChannel(interaction, progressChannel, {
    embeds: [embed],
  });

  if (!hasilKirim.ok) {
    return replyError(interaction, "Gagal mengirim progress", hasilKirim.error);
  }

  await simpanKeSheet("ctf_progress", {
    id,
    user: interaction.user.tag,
    userId: interaction.user.id,
    server: interaction.guild.name,
    channel: progressChannel.name,
    challenge,
    status: statusLabels[status] || status,
    catatan,
  });

  await replySuccess(interaction, "Progress berhasil", `Progress dikirim ke ${progressChannel}.`, [
    { name: "ID", value: `\`${id}\`` },
  ]);
}

module.exports = { execute };
