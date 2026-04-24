const config = require("../config");

async function requestSheet(action, type, data = {}) {
  // Jika URL belum diisi, lewati penyimpanan agar bot tetap bisa dipakai.
  if (!config.sheetWebAppUrl || config.sheetWebAppUrl === "ISI_URL_WEB_APP_GOOGLE_SCRIPT") {
    console.warn("SHEET_WEBAPP_URL belum diisi. Data tidak dikirim ke Google Sheet.");
    return { ok: false, skipped: true };
  }

  const response = await fetch(config.sheetWebAppUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: config.sheetSecret,
      action,
      type,
      data,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Gagal menyimpan data ke Google Sheet.");
  }

  if (action === "list" && !Array.isArray(result.items)) {
    throw new Error("Apps Script belum mendukung /list. Paste ulang google-apps-script.js ke Apps Script, lalu deploy versi Web App terbaru.");
  }

  if (action === "delete" && typeof result.deleted !== "boolean") {
    throw new Error("Apps Script belum mendukung /hapus. Paste ulang google-apps-script.js ke Apps Script, lalu deploy versi Web App terbaru.");
  }

  return result;
}

async function simpanKeSheet(type, data) {
  return requestSheet("append", type, data);
}

async function listSheet(type, limit = 10) {
  return requestSheet("list", type, { limit });
}

async function hapusSheet(type, id) {
  return requestSheet("delete", type, { id });
}

module.exports = simpanKeSheet;
module.exports.listSheet = listSheet;
module.exports.hapusSheet = hapusSheet;
