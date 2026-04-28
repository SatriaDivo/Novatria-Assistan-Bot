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
  ctf_challenge: "CTF Challenge",
  ctf_writeup: "CTF Writeup",
  ctf_progress: "CTF Progress",
  ctf_tantangan: "CTF Tantangan",
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
  if (type === "ctf_challenge") {
    return `${item.Nama || "-"}\n${item.Platform || "-"} / ${item.Kategori || "-"}\n${item.URL || "-"}`;
  }
  if (type === "ctf_writeup") {
    return `${item.Judul || "-"}\nChallenge: ${item.Challenge || "-"}\n${item.URL || "-"}`;
  }
  if (type === "ctf_progress") {
    return `${item.Challenge || "-"}\nStatus: ${item.Status || "-"}\n${item.Catatan || "-"}`;
  }
  if (type === "ctf_tantangan") {
    const path = item.Path ? `/${item.Path}` : "";

    return `${item.Judul || item.Repository || "-"}\n${item.Repository || "-"}${path}\n${item.URL || "-"}`;
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

  if (result.skipped) {
    return replyError(
      interaction,
      "Google Sheet belum aktif",
      "SHEET_WEBAPP_URL belum dikonfigurasi, jadi data belum bisa dibaca."
    );
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
