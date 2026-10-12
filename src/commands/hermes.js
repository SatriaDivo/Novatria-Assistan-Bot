const { isAdmin } = require("../utils/permissionGuard");
const { replyError, replySuccess, createEmbed } = require("../utils/replyEmbed");
const hermesService = require("../services/hermesService");
const { setPersona, getCurrentPersona } = require("../services/hermesChatService");
const { sendBackup } = require("../services/backupService");
const config = require("../config");

async function execute(interaction) {
  if (!isAdmin(interaction)) {
    return replyError(
      interaction,
      "Akses Ditolak",
      "Perintah `/hermes` hanya dapat digunakan oleh Administrator atau role yang berwenang."
    );
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "status") {
    const status = await hermesService.getSystemStatus();
    const uptimeHours = (status.uptime / 3600).toFixed(1);

    const embed = createEmbed(
      "info",
      "⚡ Status Hermes Daemon & Host VPS",
      `Informasi kesehatan host dan service Hermes di server.`,
      [
        { name: "Sistem Operasi", value: status.platform, inline: true },
        { name: "Uptime Sistem", value: `${uptimeHours} Jam`, inline: true },
        {
          name: "Status Service Hermes",
          value: status.serviceActive ? "🟢 Active (Running)" : "🔴 Inactive / Not Found",
          inline: true,
        },
        {
          name: "RAM VPS",
          value: `${status.memoryUsage.usedMb} MB / ${status.memoryUsage.totalMb} MB (${status.memoryUsage.percentage}%)`,
          inline: true,
        },
        { name: "Free RAM", value: `${status.memoryUsage.freeMb} MB`, inline: true },
      ]
    );

    return interaction.editReply({ embeds: [embed] });
  }

  if (subcommand === "cmd") {
    const cmd = interaction.options.getString("command");
    const result = await hermesService.executeCommand(cmd);

    const output = [
      result.stdout ? `**STDOUT:**\n\`\`\`bash\n${result.stdout}\n\`\`\`` : "",
      result.stderr ? `**STDERR:**\n\`\`\`bash\n${result.stderr}\n\`\`\`` : "",
    ]
      .filter(Boolean)
      .join("\n") || "*(Perintah selesai tanpa output)*";

    const type = result.exitCode === 0 ? "success" : "error";
    const title = result.exitCode === 0 ? "Eksekusi Berhasil" : `Eksekusi Gagal (Code: ${result.exitCode})`;

    const embed = createEmbed(
      type,
      title,
      `Perintah: \`${cmd}\`\n${output}`
    );

    return interaction.editReply({ embeds: [embed] });
  }

  if (subcommand === "restart") {
    const result = await hermesService.restartService();
    if (result.exitCode === 0) {
      return replySuccess(
        interaction,
        "Hermes Direstart",
        "Perintah restart service Hermes berhasil dikirim ke systemd."
      );
    } else {
      return replyError(
        interaction,
        "Gagal Me-restart",
        `Terjadi kendala saat restart service:\n\`\`\`bash\n${result.stderr || result.stdout}\n\`\`\``
      );
    }
  }

  if (subcommand === "mode") {
    const personaKey = interaction.options.getString("persona");
    const persona = setPersona(personaKey);

    return replySuccess(
      interaction,
      "Persona Hermes Diperbarui",
      `Mode Hermes AI di <#${config.channels.hermesChat}> berhasil diubah ke:\n` +
        `**${persona.name}**\n` +
        `*${persona.description}*`
    );
  }

  if (subcommand === "backup") {
    const targetChannel =
      interaction.guild.channels.cache.get(config.channels.bansosLog) ||
      interaction.channel;

    const success = await sendBackup(targetChannel);
    if (success) {
      return replySuccess(
        interaction,
        "Backup Database Berhasil",
        `Snapshot file \`database.sqlite\` telah dikirim ke <#${targetChannel.id}>!`
      );
    } else {
      return replyError(
        interaction,
        "Backup Gagal",
        "Gagal membuat snapshot database. Pastikan file database ada dan bot memiliki izin mengirim lampiran."
      );
    }
  }
}

module.exports = { execute };
