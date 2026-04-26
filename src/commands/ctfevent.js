const { assertCtfCommandChannel } = require("../utils/ctfChannelGuard");
const { createCtftimeEventsEmbed, getUpcomingCtfEvents } = require("../utils/ctftimeApi");

async function execute(interaction) {
  if (!(await assertCtfCommandChannel(interaction))) {
    return;
  }

  const limit = interaction.options.getInteger("limit") || 5;

  try {
    const events = await getUpcomingCtfEvents(limit, 30);

    if (events.length === 0) {
      await interaction.editReply(
        "Belum ada event CTF upcoming dari CTFtime untuk 30 hari ke depan."
      );
      return;
    }

    await interaction.editReply({
      embeds: [createCtftimeEventsEmbed(events)],
    });
  } catch (error) {
    await interaction.editReply(
      `❌ Gagal mengambil data event CTFtime: ${error.message || "Error tidak diketahui"}`
    );
  }
}

module.exports = { execute };
