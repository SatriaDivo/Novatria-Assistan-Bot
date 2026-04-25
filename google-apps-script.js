const FALLBACK_SPREADSHEET_ID = "LINK-SHEET-ID-ANDA";
const SCRIPT_VERSION = "2026-04-25-status-v1";

const ID_PREFIXES = {
  catat: "CAT",
  todo: "TODO",
  link: "LINK",
  jadwal: "JAD",
  arsip: "ARS",
  log: "LOG",
};

const CONFIG = {
  catat: {
    sheet: "Catatan",
    header: ["ID", "Waktu", "User", "User ID", "Server", "Channel", "Isi"],
    row: data => [data.id, new Date(), data.user, data.userId, data.server, data.channel, data.isi],
  },
  todo: {
    sheet: "Todo",
    header: ["ID", "Waktu", "User", "User ID", "Server", "Channel", "Tugas", "Status"],
    row: data => [data.id, new Date(), data.user, data.userId, data.server, data.channel, data.tugas, data.status],
  },
  link: {
    sheet: "Link",
    header: ["ID", "Waktu", "User", "User ID", "Server", "Channel", "Judul", "URL", "Catatan"],
    row: data => [data.id, new Date(), data.user, data.userId, data.server, data.channel, data.judul, data.url, data.catatan],
  },
  jadwal: {
    sheet: "Jadwal",
    header: ["ID", "Waktu", "User", "User ID", "Server", "Channel", "Judul", "Tanggal", "Jam Mulai", "Jam Selesai", "Catatan", "Google Calendar Event ID"],
    row: data => [data.id, new Date(), data.user, data.userId, data.server, data.channel, data.judul, data.tanggal, data.jam, data.selesai || "", data.catatan, data.calendarEventId || ""],
  },
  arsip: {
    sheet: "Arsip",
    header: ["ID", "Waktu", "User", "User ID", "Server", "Channel", "Isi"],
    row: data => [data.id, new Date(), data.user, data.userId, data.server, data.channel, data.isi],
  },
  log: {
    sheet: "Log",
    header: ["ID", "Waktu", "Type", "User", "User ID", "Server", "Channel", "Data"],
    row: (data, type) => [data.id || "", new Date(), type, data.user, data.userId, data.server, data.channel, JSON.stringify(data)],
  },
};

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const expectedSecret = getSecretKey();

    if (!expectedSecret) {
      return json({ ok: false, error: "SECRET_KEY belum diatur di Script Properties." });
    }

    if (body.secret !== expectedSecret) {
      return json({ ok: false, error: "Secret tidak valid" });
    }

    const action = body.action || "append";
    const type = body.type || "log";
    const data = body.data || {};
    const config = CONFIG[type] || CONFIG.log;

    const spreadsheetId = getSpreadsheetId();

    if (!spreadsheetId || spreadsheetId === "LINK-SHEET-ID-ANDA") {
      return json({ ok: false, error: "SPREADSHEET_ID belum diatur di Script Properties atau kode Apps Script." });
    }

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

    if (action === "status") {
      return json({
        ok: true,
        version: SCRIPT_VERSION,
        spreadsheetName: spreadsheet.getName(),
        sheets: Object.keys(CONFIG).map(key => CONFIG[key].sheet),
      });
    }

    const sheet = getSheet(spreadsheet, config.sheet, config.header, type);

    if (action === "append") {
      if (type === "jadwal") {
        data.calendarEventId = createCalendarEvent(data);
      }

      const row = config === CONFIG.log ? config.row(data, type) : config.row(data);
      sheet.appendRow(row);
      return json({ ok: true, sheet: config.sheet, id: data.id || "", calendarEventId: data.calendarEventId || "" });
    }

    if (action === "list") {
      const limit = Math.min(Number(data.limit || 10), 20);
      return json({ ok: true, items: listRows(sheet, config.header, limit) });
    }

    if (action === "delete") {
      const deleted = deleteById(sheet, String(data.id || ""));
      return json({ ok: true, deleted });
    }

    return json({ ok: false, error: "Action tidak dikenal" });
  } catch (error) {
    return json({ ok: false, error: error.message });
  }
}

function getSecretKey() {
  return PropertiesService.getScriptProperties().getProperty("SECRET_KEY");
}

function getSpreadsheetId() {
  return PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") || FALLBACK_SPREADSHEET_ID;
}

function createCalendarEvent(data) {
  const start = parseDateTime(data.tanggal, data.jam);
  const end = data.selesai ? parseDateTime(data.tanggal, data.selesai) : new Date(start.getTime() + 60 * 60 * 1000);

  if (end <= start) {
    throw new Error("Jam selesai harus lebih besar dari jam mulai.");
  }

  const description = [
    data.catatan || "",
    "",
    `Dibuat oleh: ${data.user || "-"}`,
    `Server: ${data.server || "-"}`,
    `Channel: ${data.channel || "-"}`,
  ].join("\n");

  const event = CalendarApp.getDefaultCalendar().createEvent(
    data.judul,
    start,
    end,
    { description }
  );

  return event.getId();
}

function parseDateTime(tanggal, jam) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(tanggal || ""))) {
    throw new Error("Format tanggal harus YYYY-MM-DD.");
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(jam || ""))) {
    throw new Error("Format jam harus HH:mm.");
  }

  const [year, month, day] = tanggal.split("-").map(Number);
  const [hour, minute] = jam.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, 0);
}

function getSheet(spreadsheet, name, header, type) {
  let sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  ensureHeader(sheet, header, type);
  return sheet;
}

function ensureHeader(sheet, header, type) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    sheet.setFrozenRows(1);
    return;
  }

  if (header[0] === "ID" && sheet.getRange(1, 1).getValue() !== "ID") {
    sheet.insertColumnBefore(1);
  }

  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  sheet.setFrozenRows(1);
  backfillMissingIds(sheet, type, header.length);
}

function backfillMissingIds(sheet, type, width) {
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return;
  }

  const range = sheet.getRange(2, 1, lastRow - 1, width);
  const values = range.getValues();
  let changed = false;

  values.forEach(row => {
    const hasData = row.slice(2).some(value => value !== "");

    if (hasData && !row[0]) {
      row[0] = makeId(type);
      changed = true;
    }
  });

  if (changed) {
    range.setValues(values);
  }
}

function makeId(type) {
  const prefix = ID_PREFIXES[type] || "LOG";
  const waktu = Date.now().toString(36).toUpperCase();
  const acak = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `${prefix}-${waktu}-${acak}`;
}

function listRows(sheet, header, limit) {
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, header.length).getValues();

  return values
    .filter(row => hasMeaningfulData(row))
    .slice(-limit)
    .reverse()
    .map(row => {
      const item = {};

      header.forEach((title, index) => {
        item[title] = row[index] instanceof Date ? row[index].toISOString() : row[index];
      });

      return item;
    });
}

function hasMeaningfulData(row) {
  return row.slice(2).some(value => value !== "");
}

function deleteById(sheet, id) {
  if (!id || sheet.getLastRow() <= 1) {
    return false;
  }

  const idColumn = 1;
  const ids = sheet.getRange(2, idColumn, sheet.getLastRow() - 1, 1).getValues();

  for (let index = ids.length - 1; index >= 0; index--) {
    if (String(ids[index][0]) === id) {
      sheet.deleteRow(index + 2);
      return true;
    }
  }

  return false;
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
