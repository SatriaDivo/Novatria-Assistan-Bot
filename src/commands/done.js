const { updateTodoStatus } = require("../utils/sheet");
const { replyError, replySuccess } = require("../utils/replyEmbed");

async function execute(interaction) {
  const id = interaction.options.getString("id", true).trim();
  let result;

  try {
    result = await updateTodoStatus(id, "Selesai");
  } catch (error) {
    return replyError(interaction, "Gagal menandai todo", error.message);
  }

  if (result.skipped) {
    return replyError(
      interaction,
      "Google Sheet belum aktif",
      "SHEET_WEBAPP_URL belum dikonfigurasi, jadi status todo belum bisa diperbarui."
    );
  }

  if (!result.updated) {
    return replyError(
      interaction,
      "Todo tidak ditemukan",
      `Todo dengan ID \`${id}\` tidak ditemukan. Cek dulu dengan \`/list tipe: Todo\`.`
    );
  }

  await replySuccess(interaction, "Todo selesai", `Todo \`${id}\` sudah ditandai selesai.`, [
    { name: "ID", value: `\`${id}\``, inline: true },
    { name: "Status", value: "Selesai", inline: true },
  ]);
}

module.exports = { execute };
