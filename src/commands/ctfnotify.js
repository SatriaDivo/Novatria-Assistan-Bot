const { assertCtfCommandChannel } = require("../utils/ctfChannelGuard");
const { setCtftimeNotifyEnabled } = require("../utils/ctftimeNotifier");

async function execute(interaction) {
  if (!(await assertCtfCommandChannel(interaction))) {
    return;
  }

  const status = interaction.options.getString("status", true);
  const enabled = status === "on";

  setCtftimeNotifyEnabled(enabled);

  await interaction.editReply(
    enabled
      ? "✅ Notifikasi CTFtime H-3 aktif. Bot akan scan saat hidup, lalu pada 00:00, 08:00, dan 17:00 WIB."
      : "✅ Notifikasi CTFtime mati."
  );
}

module.exports = { execute };
