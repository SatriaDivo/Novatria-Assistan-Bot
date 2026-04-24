async function execute(interaction) {
  await interaction.editReply({
    content: "🏓 Pong! Novatria Assistant aktif.",
  });
}

module.exports = { execute };
