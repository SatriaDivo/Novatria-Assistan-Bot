const { EmbedBuilder } = require("discord.js");
const getMabarChannel = require("../utils/getMabarChannel");
const kirimKeChannel = require("../utils/kirimKeChannel");
const simpanKeSheet = require("../utils/sheet");
const buatId = require("../utils/buatId");
const { replyError, replySuccess } = require("../utils/replyEmbed");

function buatTanggalIso(day, month, year) {
  const text = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const date = new Date(Date.UTC(year, month - 1, day));
  const valid =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;

  return valid ? text : null;
}

function isValidTime(text) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(text || ""));
}

async function execute(interaction) {
  const id = buatId("mabar");
  const game = interaction.options.getString("game");
  const tanggalHari = interaction.options.getInteger("tanggal");
  const bulan = interaction.options.getInteger("bulan");
  const tahun = interaction.options.getInteger("tahun");
  const tanggal = buatTanggalIso(tanggalHari, bulan, tahun);
  const jam = interaction.options.getString("jam");
  const catatan = interaction.options.getString("catatan") || "-";
  const { channel: channelMabar } = await getMabarChannel(interaction.guild);

  if (!tanggal) {
    return replyError(
      interaction,
      "Tanggal tidak valid",
      "Cek kombinasi `tanggal`, `bulan`, dan `tahun`. Contoh valid: tanggal `30`, bulan `4`, tahun `2026`."
    );
  }

  if (!isValidTime(jam)) {
    return replyError(interaction, "Jam tidak valid", "Gunakan format `HH:mm`, contoh: `20:00`.");
  }

  if (!channelMabar) {
    return replyError(
      interaction,
      "Channel tidak ditemukan",
      "Channel info-mabar, jadwal-mabar, mabar-chat, atau jadwal tidak ditemukan."
    );
  }

  const embed = new EmbedBuilder()
    .setColor(0xa371f7)
    .setTitle(`🎮 Mabar ${game}`)
    .addFields(
      { name: "ID", value: id, inline: true },
      { name: "Game", value: game, inline: true },
      { name: "Tanggal", value: tanggal, inline: true },
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
