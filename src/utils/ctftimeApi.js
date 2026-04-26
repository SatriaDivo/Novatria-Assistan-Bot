const { EmbedBuilder } = require("discord.js");

const CTF_TIME_API_BASE_URL = "https://ctftime.org/api/v1/events/";
const CTF_TIME_LIMIT = 10;
const JAKARTA_TIME_ZONE = "Asia/Jakarta";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: JAKARTA_TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

function normalizeLimit(limit) {
  const parsedLimit = Number(limit) || 5;
  return Math.min(Math.max(parsedLimit, 1), CTF_TIME_LIMIT);
}

function normalizeEvent(event) {
  return {
    id: String(event.id || `${event.title}-${event.start}`),
    title: event.title || "Untitled CTF",
    format: event.format || "Unknown",
    start: event.start || null,
    finish: event.finish || null,
    weight: typeof event.weight === "number" ? event.weight : Number(event.weight) || 0,
    ctftimeUrl: event.ctftime_url || event.ctftimeUrl || null,
    url: event.url || null,
    description: event.description || "",
  };
}

function formatWibDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return `${dateFormatter.format(date)} WIB`;
}

function createCtftimeEventsEmbed(events, options = {}) {
  const limitedEvents = events.slice(0, CTF_TIME_LIMIT);
  const embed = new EmbedBuilder()
    .setColor(0x7c3aed)
    .setTitle("🧩 Upcoming CTF Events")
    .setDescription(
      options.description ||
        `Daftar lomba CTF dari CTFtime public API dalam timezone ${JAKARTA_TIME_ZONE}.`
    )
    .setTimestamp();

  for (const event of limitedEvents) {
    const lines = [
      `Format: ${event.format}`,
      `Start WIB: ${formatWibDate(event.start)}`,
      `Finish WIB: ${formatWibDate(event.finish)}`,
      `Weight: ${event.weight || 0}`,
      `CTFtime URL: ${event.ctftimeUrl || "-"}`,
      `Event URL: ${event.url || "-"}`,
    ];

    embed.addFields({
      name: event.title,
      value: lines.join("\n"),
    });
  }

  return embed;
}

async function getUpcomingCtfEvents(limit = 5, days = 30) {
  const eventLimit = normalizeLimit(limit);
  const start = Math.floor(Date.now() / 1000);
  const finish = start + days * 24 * 60 * 60;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const url = `${CTF_TIME_API_BASE_URL}?limit=100&start=${start}&finish=${finish}`;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Novatria-Assistant-Bot/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`CTFtime API merespons HTTP ${response.status}.`);
    }

    const events = await response.json();

    if (!Array.isArray(events)) {
      throw new Error("Format data CTFtime API tidak sesuai.");
    }

    return events
      .map(normalizeEvent)
      .sort((first, second) => new Date(first.start).getTime() - new Date(second.start).getTime())
      .slice(0, eventLimit);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request ke CTFtime API timeout setelah 10 detik.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  createCtftimeEventsEmbed,
  formatWibDate,
  getUpcomingCtfEvents,
};
