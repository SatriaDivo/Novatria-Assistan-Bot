const ping = require("../commands/ping");
const status = require("../commands/status");
const list = require("../commands/list");
const hapus = require("../commands/hapus");
const catat = require("../commands/catat");
const todo = require("../commands/todo");
const link = require("../commands/link");
const jadwal = require("../commands/jadwal");
const arsip = require("../commands/arsip");
const logActivity = require("../utils/logActivity");

const commandHandlers = {
  ping,
  status,
  list,
  hapus,
  catat,
  todo,
  link,
  jadwal,
  arsip,
};

async function interactionCreate(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const handler = commandHandlers[interaction.commandName];

  if (!handler) {
    return interaction.reply({
      content: "❌ Command tidak dikenal.",
      flags: 64,
    });
  }

  let activityStatus = "Berhasil";
  let activityMessage = "Command selesai diproses.";
  const originalEditReply = interaction.editReply.bind(interaction);

  interaction.editReply = async (options) => {
    const content = typeof options === "string" ? options : options?.content;

    if (content) {
      activityMessage = content;

      if (content.trim().startsWith("❌")) {
        activityStatus = "Gagal";
      }
    }

    return originalEditReply(options);
  };

  try {
    // Discord butuh respons awal cepat. Defer dulu agar command tidak timeout.
    await interaction.deferReply({ flags: 64 });
    await handler.execute(interaction);
    await logActivity(interaction, activityStatus, activityMessage);
  } catch (error) {
    console.error(`Error command /${interaction.commandName}:`, error);
    await logActivity(interaction, "Gagal", error.message || "Error tidak diketahui");

    const message = {
      content: `❌ Terjadi error saat menjalankan command: ${error.message || "Error tidak diketahui"}`,
    };

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(message);
      } else {
        await interaction.reply({ ...message, flags: 64 });
      }
    } catch (replyError) {
      console.error("Gagal mengirim pesan error:", replyError);
    }
  }
}

module.exports = interactionCreate;
