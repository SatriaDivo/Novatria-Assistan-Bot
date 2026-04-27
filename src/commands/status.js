const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const getMabarChannel = require("../utils/getMabarChannel");
const getTargetChannel = require("../utils/getTargetChannel");
const { cekIzinKirim } = require("../utils/kirimKeChannel");
const { cekSheetStatus } = require("../utils/sheet");

const targets = [
  { label: "Catatan", key: "catatan", keyword: "catatan" },
  { label: "Todo", key: "todo", keyword: "todo-list" },
  { label: "Link", key: "link", keyword: "link-penting" },
  { label: "Jadwal", key: "jadwal", keyword: "jadwal" },
  {
    label: "Mabar",
    key: "mabar",
    keyword: "info-mabar",
    fallbackKeyword: "jadwal-mabar/mabar-chat/jadwal",
  },
  { label: "Arsip", key: "arsip", keyword: "arsip" },
];

async function execute(interaction) {
  const fields = [];

  for (const target of targets) {
    let channel;
    let source;
    let fallbackUsed = false;

    if (target.key === "mabar") {
      const result = await getMabarChannel(interaction.guild);
      channel = result.channel;
      source = result.source;
      fallbackUsed = source.startsWith("fallback");
    } else {
      channel = await getTargetChannel(interaction.guild, target.key, target.keyword);
    }

    if (!channel && target.fallbackKey) {
      channel = await getTargetChannel(
        interaction.guild,
        target.fallbackKey,
        target.fallbackKeyword
      );
      fallbackUsed = Boolean(channel);
    }

    if (!channel) {
      fields.push({
        name: target.label,
        value: target.fallbackKeyword
          ? `❌ Channel tidak ditemukan untuk keyword \`${target.keyword}\` atau \`${target.fallbackKeyword}\`.`
          : `❌ Channel tidak ditemukan untuk keyword \`${target.keyword}\`.`,
      });
      continue;
    }

    const canSend = cekIzinKirim(interaction, channel);
    source =
      source ||
      (fallbackUsed
        ? config.channels[target.fallbackKey]
          ? "fallback ID .env jadwal"
          : "fallback nama channel jadwal"
        : config.channels[target.key]
          ? "ID .env"
          : "nama channel");

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
