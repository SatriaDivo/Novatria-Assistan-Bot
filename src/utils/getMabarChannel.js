const config = require("../config");
const cariChannel = require("./cariChannel");
const getTargetChannel = require("./getTargetChannel");

async function getMabarChannel(guild) {
  if (!guild) {
    return { channel: null, source: "" };
  }

  const channelInfoMabar = cariChannel(guild, "info-mabar");

  if (channelInfoMabar) {
    return { channel: channelInfoMabar, source: "nama channel info-mabar" };
  }

  const channelId = config.channels.mabar;

  if (channelId) {
    const channel = await guild.channels.fetch(channelId).catch(() => null);

    if (channel && channel.isTextBased()) {
      return { channel, source: "ID .env" };
    }
  }

  const channelJadwalMabar = cariChannel(guild, "jadwal-mabar");

  if (channelJadwalMabar) {
    return { channel: channelJadwalMabar, source: "fallback nama channel jadwal-mabar" };
  }

  const channelMabarChat = cariChannel(guild, "mabar-chat");

  if (channelMabarChat) {
    return { channel: channelMabarChat, source: "fallback nama channel mabar-chat" };
  }

  const channelJadwal = await getTargetChannel(guild, "jadwal", "jadwal");

  if (channelJadwal) {
    return {
      channel: channelJadwal,
      source: config.channels.jadwal ? "fallback ID .env jadwal" : "fallback nama channel jadwal",
    };
  }

  return { channel: null, source: "" };
}

module.exports = getMabarChannel;
