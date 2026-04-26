const { replySuccess } = require("../utils/replyEmbed");

async function execute(interaction) {
  await replySuccess(interaction, "Pong!", "Novatria Assistant aktif dan siap digunakan.");
}

module.exports = { execute };
