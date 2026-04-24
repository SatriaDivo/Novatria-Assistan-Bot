const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const getTargetChannel = require("../utils/getTargetChannel");
const { cekIzinKirim } = require("../utils/kirimKeChannel");
const { cekSheetStatus } = require("../utils/sheet");

const targets = [
  { label: "Catatan", key: "catatan", keyword: "catatan" },
  { label: "Todo", key: "todo", keyword: "todo-list" },
  { label: "Link", key: "link", keyword: "link-penting" },
  { label: "Jadwal", key: "jadwal", keyword: "jadwal" },
  { label: "Arsip", key: "arsip", keyword: "arsip" },
];

async function execute(interaction) {
  const fields = [];

  for (const target of targets) {
    const channel = await getTargetChannel(interaction.guild, target.key, target.keyword);

    if (!channel) {
      fields.push({
        name: target.label,
        value: `❌ Channel tidak ditemukan untuk keyword \`${target.keyword}\`.`,
      });
      continue;
    }

    const canSend = cekIzinKirim(interaction, channel);
    const source = config.channels[target.key] ? "ID .env" : "nama channel";

    fields.push({
      name: target.label,
      value: `${canSend ? "✅" : "❌"} ${channel} (${source})`,
    });
  }

  const sheetReady = Boolean(
    config.sheetWebAppUrl &&
    config.sheetWebAppUrl !== "ISI_URL_WEB_APP_GOOGLE_SCRIPT" &&
    config.sheetSecret
  );

  let sheetStatus = "❌ SHEET_WEBAPP_URL atau SHEET_SECRET belum lengkap";

  if (sheetReady) {
    try {
      const result = await cekSheetStatus();
      sheetStatus = `✅ Terhubung ke \`${result.spreadsheetName || "Google Sheet"}\`\nApps Script: \`${result.version}\``;
    } catch (error) {
      sheetStatus = `❌ ${error.message}`;
    }
  }

  fields.push({
    name: "Google Sheet",
    value: sheetStatus,
  });

  const embed = new EmbedBuilder()
    .setColor(0x58a6ff)
    .setTitle("Status Novatria Assistant")
    .setDescription("Cek channel target, izin kirim pesan, dan konfigurasi Sheet.")
    .addFields(fields)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

module.exports = { execute };
