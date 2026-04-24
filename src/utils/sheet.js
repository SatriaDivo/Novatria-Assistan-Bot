const config = require("../config");

async function simpanKeSheet(type, data) {
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
      type,
      data,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Gagal menyimpan data ke Google Sheet.");
  }

  return result;
}

module.exports = simpanKeSheet;
