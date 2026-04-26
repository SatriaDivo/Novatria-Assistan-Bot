const { assertCtfCommandChannel, findCtfTargetChannel } = require("../utils/ctfChannelGuard");
const { createCtftimeEventsEmbed, getUpcomingCtfEvents } = require("../utils/ctftimeApi");

async function execute(interaction) {
  if (!(await assertCtfCommandChannel(interaction))) {
    return;
  }

  const targetChannel = findCtfTargetChannel(interaction.guild);

  if (!targetChannel) {
    await interaction.editReply("❌ Channel tujuan CTF tidak ditemukan.");
    return;
  }

  try {
    const events = await getUpcomingCtfEvents(5, 30);

    if (events.length === 0) {
      await targetChannel.send("Belum ada event CTF upcoming dari CTFtime untuk 30 hari ke depan.");
    } else {
      await targetChannel.send({
        embeds: [
          createCtftimeEventsEmbed(events, {
            description: "Info lomba CTF upcoming dari CTFtime public API.",
          }),
        ],
      });
    }

    await interaction.editReply(`✅ Info CTFtime sudah dikirim ke ${targetChannel}.`);
  } catch (error) {
    await interaction.editReply(
      `❌ Gagal mengambil atau mengirim data CTFtime: ${error.message || "Error tidak diketahui"}`
    );
  }
}

module.exports = { execute };
