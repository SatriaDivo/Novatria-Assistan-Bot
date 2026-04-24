const config = require("../config");
const cariChannel = require("./cariChannel");

async function getTargetChannel(guild, key, keyword) {
  if (!guild) return null;

  const channelId = config.channels[key];

  // Prioritas pertama: pakai ID channel dari .env jika tersedia.
  if (channelId) {
    const channel = await guild.channels.fetch(channelId).catch(() => null);

    if (channel && channel.isTextBased()) {
      return channel;
    }
  }

  // Fallback: cari berdasarkan nama channel.
  return cariChannel(guild, keyword);
}

module.exports = getTargetChannel;
