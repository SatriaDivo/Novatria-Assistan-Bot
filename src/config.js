require("dotenv").config({ quiet: true });

// Semua nilai penting diambil dari .env agar tidak hardcode di kode.
module.exports = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  sheetWebAppUrl: process.env.SHEET_WEBAPP_URL,
  sheetSecret: process.env.SHEET_SECRET,
  githubToken: process.env.GITHUB_TOKEN || "",
  channels: {
    catatan: process.env.CHANNEL_CATATAN_ID,
    todo: process.env.CHANNEL_TODO_ID,
    link: process.env.CHANNEL_LINK_ID,
    jadwal: process.env.CHANNEL_JADWAL_ID,
    mabar: process.env.CHANNEL_MABAR_ID,
    arsip: process.env.CHANNEL_ARSIP_ID,
    log: process.env.CHANNEL_LOG_ID,
  },
};
