const mabarService = require("../services/mabarService");

async function handleMabarButton(interaction) {
  const { customId, message } = interaction;
  const userId = interaction.user.id;

  try {
    if (customId === "btn_mabar_join") {
      const session = mabarService.joinSession(message.id, userId);
      const newEmbed = mabarService.buildMabarEmbed(session);
      await message.edit({ embeds: [newEmbed] });

      return interaction.reply({
        content: `✅ Kamu berhasil bergabung dalam mabar **${session.game}**!`,
        ephemeral: true,
      });
    }

    if (customId === "btn_mabar_leave") {
      const session = mabarService.leaveSession(message.id, userId);
      const newEmbed = mabarService.buildMabarEmbed(session);
      await message.edit({ embeds: [newEmbed] });

      return interaction.reply({
        content: `👋 Kamu keluar dari mabar **${session.game}**.`,
        ephemeral: true,
      });
    }

    if (customId === "btn_mabar_cancel") {
      const session = mabarService.cancelSession(message.id, userId);
      await message.edit({
        content: `🛑 Mabar **${session.game}** telah dibatalkan oleh host <@${userId}>.`,
        components: [],
      });

      return interaction.reply({
        content: "🛑 Sesi mabar berhasil dibatalkan.",
        ephemeral: true,
      });
    }
  } catch (error) {
    return interaction.reply({
      content: `❌ ${error.message || "Gagal memproses aksi mabar."}`,
      ephemeral: true,
    });
  }
}

module.exports = handleMabarButton;
