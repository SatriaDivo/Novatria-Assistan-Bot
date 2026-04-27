const CTF_COMMAND_KEYWORD = "ctf-command";
const CTF_TARGET_PRIORITIES = ["ctf-info", "ctf-lomba", "ctf"];
const BOT_COMMAND_KEYWORDS = ["bot-command", "bot-commands", "command-bot", "commands-bot"];
const CTF_COMMAND_NAMES = new Set([
  "ctfevent",
  "ctfcek",
  "ctfnotify",
  "ctf",
  "writeup",
  "progress",
  "tantangan",
]);

async function respondEphemeral(interaction, content) {
  const payload = { content };

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply(payload);
    return;
  }

  await interaction.reply({ ...payload, flags: 64 });
}

function isBotCommandArea(channel) {
  const channelName = channel?.name?.toLowerCase() || "";
  const parentName = channel?.parent?.name?.toLowerCase() || "";

  return (
    BOT_COMMAND_KEYWORDS.some(
      (keyword) => channelName.includes(keyword) || parentName.includes(keyword)
    ) || parentName.includes("bot")
  );
}

async function assertCtfCommandChannel(interaction) {
  const channelName = interaction.channel?.name?.toLowerCase() || "";

  if (channelName.includes(CTF_COMMAND_KEYWORD) || isBotCommandArea(interaction.channel)) {
    return true;
  }

  await respondEphemeral(
    interaction,
    "❌ Command CTF hanya bisa dipakai di channel 🤖-ctf-command atau area bot command pribadi."
  );

  return false;
}

function isCtfCommandName(commandName) {
  return CTF_COMMAND_NAMES.has(commandName);
}

function isCtfArea(channel) {
  const channelName = channel?.name?.toLowerCase() || "";
  const parentName = channel?.parent?.name?.toLowerCase() || "";

  return channelName.includes("ctf") || parentName.includes("ctf");
}

function findCtfTargetChannel(guild) {
  if (!guild) return null;

  for (const keyword of CTF_TARGET_PRIORITIES) {
    const channel = guild.channels.cache.find(
      (item) => item.name.toLowerCase().includes(keyword) && item.isTextBased()
    );

    if (channel) return channel;
  }

  return null;
}

function findCtfTargetChannelFromClient(client) {
  for (const keyword of CTF_TARGET_PRIORITIES) {
    for (const guild of client.guilds.cache.values()) {
      const channel = guild.channels.cache.find(
        (item) => item.name.toLowerCase().includes(keyword) && item.isTextBased()
      );

      if (channel) return channel;
    }
  }

  return null;
}

module.exports = {
  assertCtfCommandChannel,
  findCtfTargetChannel,
  findCtfTargetChannelFromClient,
  isCtfArea,
  isCtfCommandName,
};
