const { EmbedBuilder } = require("discord.js");
const cariChannel = require("../utils/cariChannel");
const simpanKeSheet = require("../utils/sheet");
const buatId = require("../utils/buatId");

function buatTanggalIso(day, month, year) {
  const text = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const date = new Date(Date.UTC(year, month - 1, day));
  const valid = date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return valid ? text : null;
}

function isValidTime(text) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text);
}

async function execute(interaction) {
  const id = buatId("jadwal");
  const judul = interaction.options.getString("judul");
  const tanggalHari = interaction.options.getInteger("tanggal");
  const bulan = interaction.options.getInteger("bulan");
  const tahun = interaction.options.getInteger("tahun");
  const tanggal = buatTanggalIso(tanggalHari, bulan, tahun);
  const jam = interaction.options.getString("jam");
  const selesai = interaction.options.getString("selesai") || "";
  const catatan = interaction.options.getString("catatan") || "-";
  const channelJadwal = cariChannel(interaction.guild, "jadwal");

  if (!tanggal) {
    return interaction.editReply({
      content: "❌ Tanggal tidak valid. Cek kombinasi `tanggal`, `bulan`, dan `tahun`. Contoh valid: tanggal `30`, bulan `4`, tahun `2026`.",
    });
  }

  if (!isValidTime(jam)) {
    return interaction.editReply({
      content: "❌ Format jam mulai tidak valid. Gunakan format `HH:mm`, contoh: `20:00`.",
    });
  }

  if (selesai && !isValidTime(selesai)) {
    return interaction.editReply({
      content: "❌ Format jam selesai tidak valid. Gunakan format `HH:mm`, contoh: `21:00`.",
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
      { name: "Jam Mulai", value: jam, inline: true },
      { name: "Jam Selesai", value: selesai || "Otomatis +1 jam", inline: true },
      { name: "Catatan", value: catatan }
    )
    .setFooter({ text: `Dibuat oleh ${interaction.user.tag}` })
    .setTimestamp();

  try {
    await channelJadwal.send({ embeds: [embed] });

    const result = await simpanKeSheet("jadwal", {
      id,
      user: interaction.user.tag,
      userId: interaction.user.id,
      server: interaction.guild.name,
      channel: channelJadwal.name,
      judul,
      tanggal,
      jam,
      selesai,
      catatan,
    });

    const eventInfo = result.calendarEventId ? `\n📆 Calendar Event ID: \`${result.calendarEventId}\`` : "";

    return interaction.editReply({
      content: `✅ Jadwal berhasil dikirim ke ${channelJadwal}, disimpan ke Google Sheet, dan dibuat di Google Calendar. ID: \`${id}\`${eventInfo}`,
    });
  } catch (error) {
    console.error("Gagal membuat jadwal:", error);

    return interaction.editReply({
      content: `❌ Gagal membuat jadwal: ${error.message}`,
    });
  }
}

module.exports = { execute };
