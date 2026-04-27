const { EmbedBuilder } = require("discord.js");
const getTargetChannel = require("../utils/getTargetChannel");
const kirimKeChannel = require("../utils/kirimKeChannel");
const simpanKeSheet = require("../utils/sheet");
const buatId = require("../utils/buatId");
const { replyError, replySuccess } = require("../utils/replyEmbed");

function isValidDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(text || ""))) {
    return false;
  }

  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function isValidTime(text) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(text || ""));
}

async function getMabarChannel(guild) {
  const channelMabar = await getTargetChannel(guild, "mabar", "mabar");

  if (channelMabar) {
    return channelMabar;
  }

  return getTargetChannel(guild, "jadwal", "jadwal");
}

async function execute(interaction) {
  const id = buatId("mabar");
  const game = interaction.options.getString("game");
  const tanggal = interaction.options.getString("tanggal") || "";
  const jam = interaction.options.getString("jam");
  const catatan = interaction.options.getString("catatan") || "-";
  const channelMabar = await getMabarChannel(interaction.guild);

  if (tanggal && !isValidDate(tanggal)) {
    return replyError(
      interaction,
      "Tanggal tidak valid",
      "Gunakan format `YYYY-MM-DD`, contoh: `2026-04-30`."
    );
  }

  if (!isValidTime(jam)) {
    return replyError(interaction, "Jam tidak valid", "Gunakan format `HH:mm`, contoh: `20:00`.");
  }

  if (!channelMabar) {
    return replyError(
      interaction,
      "Channel tidak ditemukan",
      "Channel mabar atau jadwal tidak ditemukan."
    );
  }

  const embed = new EmbedBuilder()
    .setColor(0xa371f7)
    .setTitle(`🎮 Mabar ${game}`)
    .addFields(
      { name: "ID", value: id, inline: true },
      { name: "Game", value: game, inline: true },
      { name: "Tanggal", value: tanggal || "Belum ditentukan", inline: true },
      { name: "Jam", value: jam, inline: true },
      { name: "Catatan", value: catatan }
    )
    .setFooter({ text: `Dibuat oleh ${interaction.user.tag}` })
    .setTimestamp();

  const hasilKirim = await kirimKeChannel(interaction, channelMabar, {
    embeds: [embed],
  });

  if (!hasilKirim.ok) {
    return replyError(interaction, "Gagal mengirim mabar", hasilKirim.error);
  }

  await simpanKeSheet("mabar", {
    id,
    user: interaction.user.tag,
    userId: interaction.user.id,
    server: interaction.guild.name,
    channel: channelMabar.name,
    game,
    tanggal,
    jam,
    catatan,
  });

  await replySuccess(
    interaction,
    "Mabar berhasil",
    `Jadwal mabar berhasil dikirim ke ${channelMabar} dan disimpan ke Google Sheet.`,
    [{ name: "ID", value: `\`${id}\`` }]
  );
}

module.exports = { execute };
