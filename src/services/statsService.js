const { ChannelType, PermissionFlagsBits } = require("discord.js");
const config = require("../config");

// Menyimpan timestamp terakhir kali channel direname untuk menghindari Discord Rate Limit (2 edit / 10 menit)
const lastRenameTimeMap = new Map();
const RENAME_COOLDOWN_MS = 5 * 60 * 1000; // 5 Menit

async function updateMemberStats(guild, targetChannelId) {
  const channelId = targetChannelId || config.channels.statsMember;
  if (!channelId || !guild) return false;

  const channel = guild.channels.cache.get(channelId);
  if (!channel) return false;

  const expectedName = `👥 Total Member: ${guild.memberCount.toLocaleString()}`;
  if (channel.name === expectedName) return true;

  const lastTime = lastRenameTimeMap.get(channel.id) || 0;
  const now = Date.now();

  if (now - lastTime < RENAME_COOLDOWN_MS) {
    // Sedang dalam cooldown untuk mencegah rate-limit Discord API
    return false;
  }

  try {
    await channel.setName(expectedName);
    lastRenameTimeMap.set(channel.id, now);
    return true;
  } catch (error) {
    console.warn(`Gagal mengupdate nama channel stats di ${guild.name}:`, error.message);
    return false;
  }
}

async function createStatsChannel(guild) {
  const channelName = `👥 Total Member: ${guild.memberCount.toLocaleString()}`;

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildVoice,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.Connect], // Kunci agar user tidak bisa join berbicara
        allow: [PermissionFlagsBits.ViewChannel],
      },
    ],
    position: 0, // Tempatkan paling atas
    reason: "Dynamic Server Stats Counter Channel",
  });

  lastRenameTimeMap.set(channel.id, Date.now());
  return channel;
}

module.exports = {
  updateMemberStats,
  createStatsChannel,
  RENAME_COOLDOWN_MS,
  lastRenameTimeMap,
};
