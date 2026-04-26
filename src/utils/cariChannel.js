function cariChannel(guild, keyword) {
  if (!guild) return null;

  // Cari channel teks yang namanya mengandung keyword tertentu.
  return guild.channels.cache.find(
    (channel) => channel.name.toLowerCase().includes(keyword.toLowerCase()) && channel.isTextBased()
  );
}

module.exports = cariChannel;
