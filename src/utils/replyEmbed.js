const { EmbedBuilder } = require("discord.js");

const colors = {
  success: 0x3fb950,
  error: 0xf85149,
  info: 0x58a6ff,
};

function createEmbed(type, title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setColor(colors[type] || colors.info)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
}

function replyEmbed(interaction, type, title, description, fields = []) {
  return interaction.editReply({
    embeds: [createEmbed(type, title, description, fields)],
  });
}

function replySuccess(interaction, title, description, fields = []) {
  return replyEmbed(interaction, "success", `✅ ${title}`, description, fields);
}

function replyError(interaction, title, description, fields = []) {
  return replyEmbed(interaction, "error", `❌ ${title}`, description, fields);
}

function replyInfo(interaction, title, description, fields = []) {
  return replyEmbed(interaction, "info", title, description, fields);
}

module.exports = {
  createEmbed,
  replySuccess,
  replyError,
  replyInfo,
};
