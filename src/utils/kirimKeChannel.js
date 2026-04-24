const { PermissionsBitField } = require("discord.js");

function cekIzinKirim(interaction, channel) {
  const botMember = interaction.guild.members.me;
  if (!botMember) return false;

  const permissions = channel.permissionsFor(botMember);

  return permissions?.has([
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.SendMessages,
  ]);
}

async function kirimKeChannel(interaction, channel, pesan) {
  // Cek izin dulu agar error Discord "Missing Access" bisa dijelaskan ke user.
  if (!cekIzinKirim(interaction, channel)) {
    return {
      ok: false,
      error: `❌ Bot belum punya izin untuk melihat atau mengirim pesan di ${channel}. Aktifkan **View Channel** dan **Send Messages** untuk role bot.`,
    };
  }

  await channel.send(pesan);

  return { ok: true };
}

module.exports = kirimKeChannel;
module.exports.cekIzinKirim = cekIzinKirim;
