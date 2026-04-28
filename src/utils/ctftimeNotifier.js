const fs = require("fs");
const path = require("path");
const { createCtftimeEventsEmbed, getUpcomingCtfEvents } = require("./ctftimeApi");
const { findCtfTargetChannelFromClient } = require("./ctfChannelGuard");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const SETTINGS_PATH = path.join(DATA_DIR, "ctftime-settings.json");
const SEEN_PATH = path.join(DATA_DIR, "ctftime-seen.json");
const START_DELAY_MS = 10000;
const JAKARTA_TIME_ZONE = "Asia/Jakarta";
const H3_WINDOW_DAYS = 3;
const NOTIFIER_EVENT_LIMIT = 10;
const CHECK_TIMES_WIB = [
  { hour: 0, minute: 0 },
  { hour: 8, minute: 0 },
  { hour: 17, minute: 0 },
];
const WIB_UTC_OFFSET_HOURS = 7;

let scheduleTimer = null;

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile(filePath, fallback) {
  ensureDataDir();

  if (!fs.existsSync(filePath)) {
    writeJsonFile(filePath, fallback);
    return fallback;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Gagal membaca ${filePath}:`, error);
    return fallback;
  }
}

function writeJsonFile(filePath, data) {
  ensureDataDir();
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function getCtftimeSettings() {
  return readJsonFile(SETTINGS_PATH, {
    notifyEnabled: false,
    updatedAt: null,
  });
}

function setCtftimeNotifyEnabled(enabled) {
  const settings = {
    notifyEnabled: Boolean(enabled),
    updatedAt: new Date().toISOString(),
  };

  writeJsonFile(SETTINGS_PATH, settings);
  return settings;
}

function getSeenEventIds() {
  const data = readJsonFile(SEEN_PATH, { h3NotifiedEventIds: [] });
  const ids = data.h3NotifiedEventIds || [];

  return Array.isArray(ids) ? ids.map(String) : [];
}

function saveSeenEventIds(ids) {
  writeJsonFile(SEEN_PATH, {
    h3NotifiedEventIds: [...new Set(ids.map(String))],
    updatedAt: new Date().toISOString(),
  });
}

function getJakartaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function getJakartaScheduleTimestamp({ year, month, day }, time, dayOffset = 0) {
  return Date.UTC(
    year,
    month - 1,
    day + dayOffset,
    time.hour - WIB_UTC_OFFSET_HOURS,
    time.minute,
    0,
    0
  );
}

function getNextCheckDelayMs(now = new Date()) {
  const nowMs = now.getTime();
  const jakartaToday = getJakartaDateParts(now);

  for (const dayOffset of [0, 1]) {
    for (const time of CHECK_TIMES_WIB) {
      const scheduleMs = getJakartaScheduleTimestamp(jakartaToday, time, dayOffset);

      if (scheduleMs > nowMs) {
        return scheduleMs - nowMs;
      }
    }
  }

  return 24 * 60 * 60 * 1000;
}

function formatWibSchedule(date) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function checkAndNotifyCtftime(client) {
  try {
    const settings = getCtftimeSettings();

    if (!settings.notifyEnabled) {
      return;
    }

    const channel = findCtfTargetChannelFromClient(client);

    if (!channel) {
      console.warn("Channel CTF untuk notifikasi CTFtime tidak ditemukan.");
      return;
    }

    const events = await getUpcomingCtfEvents(NOTIFIER_EVENT_LIMIT, H3_WINDOW_DAYS);
    const seenEventIds = getSeenEventIds();
    const newEvents = events.filter((event) => !seenEventIds.includes(String(event.id)));

    if (newEvents.length === 0) {
      return;
    }

    const embed = createCtftimeEventsEmbed(newEvents, {
      description:
        "Reminder H-3: lomba CTF yang mulai dalam 3 hari ke depan. Scan otomatis berjalan pada 00:00, 08:00, dan 17:00 WIB.",
    });

    await channel.send({ embeds: [embed] });
    saveSeenEventIds([...seenEventIds, ...newEvents.map((event) => event.id)]);
  } catch (error) {
    console.error("Gagal menjalankan notifier CTFtime:", error);
  }
}

function scheduleNextCtftimeCheck(client) {
  const delay = getNextCheckDelayMs();
  const nextRunAt = new Date(Date.now() + delay);

  if (scheduleTimer) {
    clearTimeout(scheduleTimer);
  }

  console.log(`Notifier CTFtime berikutnya: ${formatWibSchedule(nextRunAt)} WIB.`);

  scheduleTimer = setTimeout(async () => {
    await checkAndNotifyCtftime(client);
    scheduleNextCtftimeCheck(client);
  }, delay);
}

function startCtftimeNotifier(client) {
  ensureDataDir();
  getCtftimeSettings();
  getSeenEventIds();

  setTimeout(async () => {
    await checkAndNotifyCtftime(client);
    scheduleNextCtftimeCheck(client);
  }, START_DELAY_MS);
}

module.exports = {
  getCtftimeSettings,
  setCtftimeNotifyEnabled,
  startCtftimeNotifier,
};
