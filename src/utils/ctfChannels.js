function findTextChannelByKeyword(guild, keyword) {
  if (!guild) return null;

  return guild.channels.cache.find(
    (channel) => channel.name.toLowerCase().includes(keyword) && channel.isTextBased()
  );
}

function findCtfContentChannel(guild, keyword) {
  return findTextChannelByKeyword(guild, keyword);
}

module.exports = {
  findCtfContentChannel,
};
