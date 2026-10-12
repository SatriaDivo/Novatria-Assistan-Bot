const { isAdmin } = require("../utils/permissionGuard");
const { replyError, replySuccess } = require("../utils/replyEmbed");
const { createStatsChannel, updateMemberStats } = require("../services/statsService");

async function execute(interaction) {
  if (!isAdmin(interaction)) {
    return replyError(
      interaction,
      "Akses Ditolak",
      "Perintah statistik hanya dapat digunakan oleh Administrator."
    );
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "setup") {
    try {
      const channel = await createStatsChannel(interaction.guild);
      return replySuccess(
        interaction,
        "Channel Stats Dibuat",
        `Channel counter member berhasil dibuat: <#${channel.id}>\n\n` +
          `💡 **Tips Permanen:** Tambahkan baris ini ke file \`.env\` di VPS kamu agar bot mengingat channel ini saat restart:\n` +
          `\`STATS_MEMBER_CHANNEL_ID=${channel.id}\``
      );
    } catch (error) {
      return replyError(
        interaction,
        "Gagal Membuat Channel",
        `Terjadi error saat membuat channel stats: ${error.message}. Pastikan bot memiliki izin Manage Channels.`
      );
    }
  }

  if (subcommand === "sync") {
    const updated = await updateMemberStats(interaction.guild);
    if (updated) {
      return replySuccess(
        interaction,
        "Stats Disinkronkan",
        `Jumlah member (${interaction.guild.memberCount.toLocaleString()}) berhasil disinkronkan ke channel stats!`
      );
    } else {
      return replySuccess(
        interaction,
        "Stats Sudah Terkini",
        `Channel stats sudah sesuai atau sedang berada dalam cooldown anti-rate-limit.`
      );
    }
  }
}

module.exports = { execute };
