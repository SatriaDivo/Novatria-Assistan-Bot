const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const config = require("./src/config");
const commands = require("./src/commands/definitions");
const initDatabase = require("./src/db");
const createBansosService = require("./src/services/bansosService");
const createInteractionHandler = require("./src/handlers/interactionCreate");
const handleGuildMemberAdd = require("./src/events/guildMemberAdd");
const handleGuildMemberRemove = require("./src/events/guildMemberRemove");
const { updateMemberStats } = require("./src/services/statsService");

// Inisialisasi Database SQLite & Services
const db = initDatabase();
const bansosService = createBansosService(db);
const interactionCreate = createInteractionHandler(bansosService);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // Dibutuhkan untuk event member join & auto-role
  ],
});

// Registrasi Slash Commands ke Discord API
async function registerCommands(readyClient) {
  const rest = new REST({ version: "10" }).setToken(config.token);

  console.log("Mendaftarkan slash commands...");

  // Jika GUILD_ID ditentukan, daftarkan langsung ke server target (instan tanpa delay)
  if (config.guildId) {
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );
    console.log(`Slash commands berhasil didaftarkan di guild: ${config.guildId}`);
  } else {
    // Daftarkan ke semua server tempat bot berada
    for (const guild of readyClient.guilds.cache.values()) {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, guild.id),
        { body: commands }
      );
      console.log(`Slash commands berhasil didaftarkan di server: ${guild.name}`);
    }
  }

  console.log("Semua slash commands selesai didaftarkan.");
}

client.once("ready", async (readyClient) => {
  try {
    console.log(`Bot berhasil login sebagai ${readyClient.user.tag}`);
    await registerCommands(readyClient);

    // Sinkronkan counter member stats saat bot online
    for (const guild of readyClient.guilds.cache.values()) {
      await updateMemberStats(guild).catch(() => null);
    }
  } catch (error) {
    console.error("Gagal mendaftarkan slash commands:", error);
  }
});

// Event Handlers
client.on("interactionCreate", interactionCreate);
client.on("guildMemberAdd", handleGuildMemberAdd);
client.on("guildMemberRemove", handleGuildMemberRemove);

// Graceful Shutdown
function handleShutdown() {
  console.log("Menutup bot dan database connection...");
  try {
    db.close();
    client.destroy();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

if (config.token && config.token !== "ISI_TOKEN_BOT") {
  client.login(config.token).catch((err) => {
    console.error("Gagal login ke Discord:", err.message);
  });
} else {
  console.warn("⚠️ Token bot belum diisi di .env! Silakan isi TOKEN terlebih dahulu.");
}
