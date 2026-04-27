const { EmbedBuilder } = require("discord.js");
const { listSheet } = require("../utils/sheet");
const { replyError, replyInfo } = require("../utils/replyEmbed");

const labels = {
  catat: "Catatan",
  todo: "Todo",
  link: "Link",
  jadwal: "Jadwal",
  mabar: "Mabar",
  arsip: "Arsip",
};

function ambilRingkasan(type, item) {
  if (type === "todo") return `${item.Tugas || "-"}\nStatus: ${item.Status || "-"}`;
  if (type === "link") return `${item.Judul || "-"}\n${item.URL || "-"}`;
  if (type === "jadwal") {
    const jamMulai = item["Jam Mulai"] || item.Jam || "-";
    const jamSelesai = item["Jam Selesai"] ? ` - ${item["Jam Selesai"]}` : "";

    return `${item.Judul || "-"}\n${item.Tanggal || "-"} ${jamMulai}${jamSelesai}`;
  }
  if (type === "mabar") {
    return `${item.Game || "-"}\n${item.Tanggal || "Tanggal belum ditentukan"} ${item.Jam || "-"}`;
  }

  return item.Isi || "-";
}

function potong(text, max = 220) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

async function execute(interaction) {
  const type = interaction.options.getString("tipe");
  const limit = interaction.options.getInteger("limit") || 10;
  let result;

  try {
    result = await listSheet(type, limit);
  } catch (error) {
    return replyError(interaction, "Gagal mengambil data", error.message);
  }

  const items = result.items || [];

  if (items.length === 0) {
    return replyInfo(interaction, "Data kosong", `Belum ada data untuk tipe \`${type}\`.`);
  }

  const embed = new EmbedBuilder()
    .setColor(0x58a6ff)
    .setTitle(`Daftar ${labels[type] || type}`)
    .setDescription("Gunakan ID di bawah ini untuk `/hapus`.")
    .setTimestamp();

  for (const item of items) {
    const id = item.ID || item.Id || item.id || "-";
    embed.addFields({
      name: id,
      value: potong(ambilRingkasan(type, item)),
    });
  }

  await interaction.editReply({ embeds: [embed] });
}

module.exports = { execute };
