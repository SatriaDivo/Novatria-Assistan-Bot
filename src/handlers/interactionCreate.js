const hermes = require("../commands/hermes");
const createBansosCommand = require("../commands/bansos");
const rolepanel = require("../commands/rolepanel");
const handleClaimAccount = require("../buttons/claimAccount");
const handleClaimApi = require("../buttons/claimApi");
const handleToggleRole = require("../buttons/toggleRole");
const { createEmbed } = require("../utils/replyEmbed");

function createInteractionHandler(bansosService) {
  const bansos = createBansosCommand(bansosService);

  const commandHandlers = {
    hermes,
    bansos,
    rolepanel,
  };

  return async function interactionCreate(interaction) {
    // 1. Handle Slash Command
    if (interaction.isChatInputCommand()) {
      const handler = commandHandlers[interaction.commandName];

      if (!handler) {
        return interaction.reply({
          content: "❌ Command tidak dikenal.",
          ephemeral: true,
        });
      }

      try {
        await interaction.deferReply({ ephemeral: true });
        await handler.execute(interaction);
      } catch (error) {
        console.error(`Error command /${interaction.commandName}:`, error);
        const errEmbed = createEmbed(
          "error",
          "❌ Terjadi Kesalahan",
          `Gagal memproses command: ${error.message || "Error tidak diketahui"}`
        );

        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ embeds: [errEmbed] }).catch(() => null);
        } else {
          await interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(() => null);
        }
      }
      return;
    }

    // 2. Handle Button Interactions
    if (interaction.isButton()) {
      const { customId } = interaction;

      if (customId === "btn_claim_account") {
        return handleClaimAccount(interaction, bansosService);
      }

      if (customId === "btn_claim_api") {
        return handleClaimApi(interaction, bansosService);
      }

      if (customId === "btn_role_bansos" || customId === "btn_role_gamers") {
        return handleToggleRole(interaction);
      }
    }
  };
}

module.exports = createInteractionHandler;
