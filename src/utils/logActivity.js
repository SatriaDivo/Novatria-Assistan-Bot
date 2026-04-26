const { EmbedBuilder } = require("discord.js");
const config = require("../config");

function potong(text, max = 1000) {
  const value = String(text || "-");

  if (value.length <= max) return value;

  return `${value.slice(0, max - 3)}...`;
}

function cariChannelLog(guild) {
  if (!guild) return null;

  if (config.channels.log) {
    const channel = guild.channels.cache.get(config.channels.log);

    if (channel && channel.isTextBased()) {
      return channel;
    }
  }

  return guild.channels.cache.find((channel) => {
    const name = channel.name.toLowerCase();

    return channel.isTextBased() && (name.includes("log-aktivitas") || name.includes("log"));
  });
}

async function logActivity(interaction, status, message) {
  try {
    const channel = cariChannelLog(interaction.guild);

    if (!channel) {
      return false;
    }

    const berhasil = status === "Berhasil";
    const embed = new EmbedBuilder()
      .setColor(berhasil ? 0x3fb950 : 0xf85149)
      .setTitle("Log Aktivitas Novatria Assistant")
      .addFields(
        { name: "Command", value: `/${interaction.commandName}`, inline: true },
        {
          name: "User",
          value: `${interaction.user.tag}\n\`${interaction.user.id}\``,
          inline: true,
        },
        { name: "Status", value: status, inline: true },
        { name: "Server", value: interaction.guild?.name || "-", inline: true },
        {
          name: "Channel",
          value: interaction.channel ? `${interaction.channel}` : "-",
          inline: true,
        },
        { name: "Waktu", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        { name: "Pesan", value: potong(message) }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.warn("Gagal mengirim log aktivitas:", error.message);
    return false;
  }
}

module.exports = logActivity;
