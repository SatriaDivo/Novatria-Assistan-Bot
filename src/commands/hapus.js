const { hapusSheet } = require("../utils/sheet");

async function execute(interaction) {
  const type = interaction.options.getString("tipe");
  const id = interaction.options.getString("id");
  let result;

  try {
    result = await hapusSheet(type, id);
  } catch (error) {
    return interaction.editReply({
      content: `❌ ${error.message}`,
    });
  }

  if (!result.deleted) {
    return interaction.editReply({
      content: `❌ Data dengan ID \`${id}\` tidak ditemukan di tipe \`${type}\`. Cek dulu dengan \`/list\`.`,
    });
  }

  await interaction.editReply({
    content: `✅ Data \`${id}\` berhasil dihapus dari Google Sheet.`,
  });
}

module.exports = { execute };
