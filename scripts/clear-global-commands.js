require("dotenv").config({ quiet: true });

const { REST, Routes } = require("discord.js");

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

async function clearGlobalCommands() {
  if (!token || !clientId) {
    throw new Error("TOKEN dan CLIENT_ID harus tersedia di file .env.");
  }

  const rest = new REST({ version: "10" }).setToken(token);

  console.log("Mulai menghapus global slash commands lama...");

  await rest.put(Routes.applicationCommands(clientId), { body: [] });

  console.log("Berhasil menghapus global slash commands lama.");
  console.log(
    "Jika command lama masih terlihat, restart Discord atau tunggu cache Discord selesai refresh."
  );
}

clearGlobalCommands().catch((error) => {
  console.error("Gagal menghapus global slash commands:", error);
  process.exitCode = 1;
});
