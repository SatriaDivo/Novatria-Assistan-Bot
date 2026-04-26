const fs = require("fs");
const path = require("path");
const { createCtftimeEventsEmbed, getUpcomingCtfEvents } = require("./ctftimeApi");
const { findCtfTargetChannelFromClient } = require("./ctfChannelGuard");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const SETTINGS_PATH = path.join(DATA_DIR, "ctftime-settings.json");
const SEEN_PATH = path.join(DATA_DIR, "ctftime-seen.json");
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const START_DELAY_MS = 10000;

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
  const data = readJsonFile(SEEN_PATH, { seenEventIds: [] });

  return Array.isArray(data.seenEventIds) ? data.seenEventIds.map(String) : [];
}

function saveSeenEventIds(ids) {
  writeJsonFile(SEEN_PATH, {
    seenEventIds: [...new Set(ids.map(String))],
    updatedAt: new Date().toISOString(),
  });
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

    const events = await getUpcomingCtfEvents(10, 30);
    const seenEventIds = getSeenEventIds();
    const newEvents = events.filter((event) => !seenEventIds.includes(String(event.id)));

    if (newEvents.length === 0) {
      return;
    }

    const embed = createCtftimeEventsEmbed(newEvents, {
      description: "Event CTFtime baru/upcoming dalam 30 hari ke depan.",
    });

    await channel.send({ embeds: [embed] });
    saveSeenEventIds([...seenEventIds, ...newEvents.map((event) => event.id)]);
  } catch (error) {
    console.error("Gagal menjalankan notifier CTFtime:", error);
  }
}

function startCtftimeNotifier(client) {
  ensureDataDir();
  getCtftimeSettings();
  getSeenEventIds();

  setTimeout(() => {
    checkAndNotifyCtftime(client);
    setInterval(() => checkAndNotifyCtftime(client), CHECK_INTERVAL_MS);
  }, START_DELAY_MS);
}

module.exports = {
  getCtftimeSettings,
  setCtftimeNotifyEnabled,
  startCtftimeNotifier,
};
