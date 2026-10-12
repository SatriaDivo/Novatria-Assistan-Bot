const fs = require("fs");
const path = require("path");
const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const config = require("../config");

function getFormattedDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

function createBackupAttachment(customDbPath) {
  const dbPath =
    customDbPath || path.join(__dirname, "../../data/database.sqlite");

  if (!fs.existsSync(dbPath)) {
    return null;
  }

  const filename = `backup-novatria-${getFormattedDate()}.sqlite`;
  return new AttachmentBuilder(dbPath, { name: filename });
}

async function sendBackup(targetChannel, customDbPath) {
  if (!targetChannel) return false;

  const resolvedDbPath =
    customDbPath || path.join(__dirname, "../data/database.sqlite");

  const attachment = createBackupAttachment(resolvedDbPath);
  if (!attachment) {
    console.warn("File database SQLite tidak ditemukan untuk di-backup.");
    return false;
  }

  const stats = fs.statSync(resolvedDbPath);
  const sizeKb = (stats.size / 1024).toFixed(1);

  const embed = new EmbedBuilder()
    .setColor(0x3fb950)
    .setTitle("💾 Auto-Backup Database SQLite")
    .setDescription(
      `Snapshot database Novatria-Bot berhasil dibuat.\n` +
        `• **Ukuran File:** ${sizeKb} KB\n` +
        `• **Waktu:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
        `*Simpan file lampiran ini untuk restore jika terjadi masalah pada VPS.*`
    )
    .setTimestamp();

  try {
    await targetChannel.send({
      embeds: [embed],
      files: [attachment],
    });
    return true;
  } catch (error) {
    console.error("Gagal mengirim file backup database:", error);
    return false;
  }
}

module.exports = {
  createBackupAttachment,
  sendBackup,
};
