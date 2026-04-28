const { hapusSheet } = require("../utils/sheet");
const { assertSensitiveCommandPermission } = require("../utils/permissionGuard");
const { replyError, replySuccess } = require("../utils/replyEmbed");

async function execute(interaction) {
  if (!(await assertSensitiveCommandPermission(interaction))) {
    return;
  }

  const type = interaction.options.getString("tipe");
  const id = interaction.options.getString("id");
  let result;

  try {
    result = await hapusSheet(type, id);
  } catch (error) {
    return replyError(interaction, "Gagal menghapus data", error.message);
  }

  if (result.skipped) {
    return replyError(
      interaction,
      "Google Sheet belum aktif",
      "SHEET_WEBAPP_URL belum dikonfigurasi, jadi data belum bisa dihapus."
    );
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
