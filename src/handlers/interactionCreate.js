const ping = require("../commands/ping");
const help = require("../commands/help");
const status = require("../commands/status");
const list = require("../commands/list");
const hapus = require("../commands/hapus");
const catat = require("../commands/catat");
const todo = require("../commands/todo");
const done = require("../commands/done");
const link = require("../commands/link");
const jadwal = require("../commands/jadwal");
const mabar = require("../commands/mabar");
const arsip = require("../commands/arsip");
const ctfevent = require("../commands/ctfevent");
const ctfcek = require("../commands/ctfcek");
const ctfnotify = require("../commands/ctfnotify");
const ctf = require("../commands/ctf");
const writeup = require("../commands/writeup");
const progress = require("../commands/progress");
const tantangan = require("../commands/tantangan");
const logActivity = require("../utils/logActivity");
const { isCtfArea, isCtfCommandName } = require("../utils/ctfChannelGuard");
const { createEmbed } = require("../utils/replyEmbed");

const commandHandlers = {
  ping,
  help,
  status,
  list,
  hapus,
  catat,
  todo,
  done,
  link,
  jadwal,
  mabar,
  arsip,
  ctfevent,
  ctfcek,
  ctfnotify,
  ctf,
  writeup,
  progress,
  tantangan,
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

  if (isCtfArea(interaction.channel) && !isCtfCommandName(interaction.commandName)) {
    return interaction.reply({
      content:
        "❌ Di kategori CTF, gunakan command CTF saja: `/ctfevent`, `/ctfcek`, `/ctfnotify`, `/ctf`, `/writeup`, `/progress`, atau `/tantangan`.",
      flags: 64,
    });
  }

  let activityStatus = "Berhasil";
  let activityMessage = "Command selesai diproses.";
  const originalEditReply = interaction.editReply.bind(interaction);

  interaction.editReply = async (options) => {
    const content = typeof options === "string" ? options : options?.content;
    const firstEmbed = typeof options === "object" ? options?.embeds?.[0]?.data : null;
    const embedSummary = [firstEmbed?.title, firstEmbed?.description].filter(Boolean).join(" - ");
    const replySummary = content || embedSummary;

    if (replySummary) {
      activityMessage = replySummary;

      if (replySummary.trim().startsWith("❌")) {
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
      embeds: [
        createEmbed(
          "error",
          "❌ Command gagal",
          `Terjadi error saat menjalankan command: ${error.message || "Error tidak diketahui"}`
        ),
      ],
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
