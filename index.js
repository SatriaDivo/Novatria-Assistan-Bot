const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const config = require("./src/config");
const commands = require("./src/commands/definitions");
const interactionCreate = require("./src/handlers/interactionCreate");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Daftarkan slash commands ke setiap server agar langsung muncul.
async function registerCommands(readyClient) {
  const rest = new REST({ version: "10" }).setToken(config.token);
  const guilds = readyClient.guilds.cache;

  console.log("Mendaftarkan slash commands...");

  for (const guild of guilds.values()) {
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, guild.id),
      { body: commands }
    );

    console.log(`Slash commands berhasil didaftarkan di server: ${guild.name}`);
  }

  console.log("Slash commands berhasil didaftarkan.");
}

client.once("clientReady", async readyClient => {
  try {
    await registerCommands(readyClient);
    console.log(`Bot aktif sebagai ${readyClient.user.tag}`);
  } catch (error) {
    console.error("Gagal mendaftarkan slash commands:", error);
  }
});

// Semua slash command diproses di handler terpisah.
client.on("interactionCreate", interactionCreate);

client.login(config.token);
