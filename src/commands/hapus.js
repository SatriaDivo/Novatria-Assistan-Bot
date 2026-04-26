const { hapusSheet } = require("../utils/sheet");
const { replyError, replySuccess } = require("../utils/replyEmbed");

async function execute(interaction) {
  const type = interaction.options.getString("tipe");
  const id = interaction.options.getString("id");
  let result;

  try {
    result = await hapusSheet(type, id);
  } catch (error) {
    return replyError(interaction, "Gagal menghapus data", error.message);
  }

  if (!result.deleted) {
    return replyError(
      interaction,
      "Data tidak ditemukan",
      `Data dengan ID \`${id}\` tidak ditemukan di tipe \`${type}\`. Cek dulu dengan \`/list\`.`
    );
  }

  await replySuccess(
    interaction,
    "Data berhasil dihapus",
    `Data \`${id}\` berhasil dihapus dari Google Sheet.`
  );
}

module.exports = { execute };
