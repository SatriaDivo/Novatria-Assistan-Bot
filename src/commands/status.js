const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const getMabarChannel = require("../utils/getMabarChannel");
const getTargetChannel = require("../utils/getTargetChannel");
const { findCtfContentChannel } = require("../utils/ctfChannels");
const { cekIzinKirim } = require("../utils/kirimKeChannel");
const { cekSheetStatus } = require("../utils/sheet");

const mainTargets = [
  { label: "Catatan", key: "catatan", keyword: "catatan" },
  { label: "Todo", key: "todo", keyword: "todo-list" },
  { label: "Link", key: "link", keyword: "link-penting" },
  { label: "Jadwal", key: "jadwal", keyword: "jadwal" },
  { label: "Arsip", key: "arsip", keyword: "arsip" },
  { label: "Log", key: "log", keyword: "log" },
];

const ctfTargets = [
  { label: "CTF Info", keyword: "ctf-info" },
  { label: "CTF Command", keyword: "ctf-command" },
  { label: "CTF Target", keyword: "ctf-target" },
  { label: "CTF Writeup", keyword: "ctf-writeup" },
  { label: "CTF Progress", keyword: "ctf-progress" },
];

function formatChannelStatus(interaction, channel, source, missingText) {
  if (!channel) {
    return `❌ ${missingText}`;
  }

  const canSend = cekIzinKirim(interaction, channel);
  const permissionText = canSend ? "Izin kirim OK" : "Izin kirim belum lengkap";

  return `${canSend ? "✅" : "⚠️"} ${channel}\n${permissionText} (${source})`;
}

async function getMainFields(interaction) {
  const fields = [];

  for (const target of mainTargets) {
    const channel = await getTargetChannel(interaction.guild, target.key, target.keyword);
    const source = config.channels[target.key] ? "ID .env atau fallback nama" : "nama channel";

    fields.push({
      name: target.label,
      value: formatChannelStatus(
        interaction,
        channel,
        source,
        `Channel tidak ditemukan untuk keyword \`${target.keyword}\`.`
      ),
    });
  }

  return fields;
}

async function getMabarField(interaction) {
  const result = await getMabarChannel(interaction.guild);

  return {
    name: "Mabar",
    value: formatChannelStatus(
      interaction,
      result.channel,
      result.source || "info-mabar / CHANNEL_MABAR_ID / fallback jadwal",
      "Channel tidak ditemukan untuk keyword `info-mabar`, `jadwal-mabar`, `mabar-chat`, atau `jadwal`."
    ),
  };
}

function getCtfFields(interaction) {
  return ctfTargets.map((target) => {
    const channel = findCtfContentChannel(interaction.guild, target.keyword);

    return {
      name: target.label,
      value: formatChannelStatus(
        interaction,
        channel,
        "nama channel",
        `Channel tidak ditemukan untuk keyword \`${target.keyword}\`.`
      ),
    };
  });
}

async function getSheetField() {
  const sheetReady = Boolean(
    config.sheetWebAppUrl &&
    config.sheetWebAppUrl !== "ISI_URL_WEB_APP_GOOGLE_SCRIPT" &&
    config.sheetSecret
  );

  if (!sheetReady) {
    return {
      name: "Google Sheet",
      value: "❌ SHEET_WEBAPP_URL atau SHEET_SECRET belum lengkap.",
    };
  }

  try {
    const result = await cekSheetStatus();
    const sheetCount = Array.isArray(result.sheets) ? result.sheets.length : 0;

    return {
      name: "Google Sheet",
      value: [
        `✅ Terhubung ke \`${result.spreadsheetName || "Google Sheet"}\``,
        `Apps Script: \`${result.version}\``,
        sheetCount ? `Sheet terdaftar: ${sheetCount}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    };
  } catch (error) {
    return {
      name: "Google Sheet",
      value: `❌ ${error.message}`,
    };
  }
}

async function execute(interaction) {
  const fields = [
    ...(await getMainFields(interaction)),
    await getMabarField(interaction),
    ...getCtfFields(interaction),
    await getSheetField(),
  ];

  const embed = new EmbedBuilder()
    .setColor(0x58a6ff)
    .setTitle("Status Novatria Assistant")
    .setDescription("Cek channel utama, mabar, CTF, izin kirim pesan, dan Google Sheet.")
    .addFields(fields)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

module.exports = { execute };
