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
    enabled ? "✅ Notifikasi CTFtime aktif." : "✅ Notifikasi CTFtime mati."
  );
}

module.exports = { execute };
