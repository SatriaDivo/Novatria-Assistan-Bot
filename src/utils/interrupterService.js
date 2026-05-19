const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const fs = require("fs");
const path = require("path");

const interrupterSettingsPath = path.join(__dirname, "../../data/interrupter-settings.json");

let settings = {
  active: false,
  targetType: "role", // "role" atau "user"
  targetId: null, // ID role atau ID user
  sound: "donnie",
};

if (fs.existsSync(interrupterSettingsPath)) {
  try {
    const raw = fs.readFileSync(interrupterSettingsPath, "utf8");
    settings = { ...settings, ...JSON.parse(raw) };
  } catch (err) {
    console.error("Gagal membaca interrupter settings:", err);
  }
}

function saveSettings() {
  try {
    if (!fs.existsSync(path.dirname(interrupterSettingsPath))) {
      fs.mkdirSync(path.dirname(interrupterSettingsPath), { recursive: true });
    }
    fs.writeFileSync(interrupterSettingsPath, JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error("Gagal menyimpan interrupter settings:", err);
  }
}

const activeConnections = new Map();

function isTarget(member) {
  if (!settings.active || !settings.targetId) return false;
  if (settings.targetType === "role") {
    return member.roles.cache.has(settings.targetId);
  }
  return member.id === settings.targetId;
}

function handleVoiceStateUpdate(oldState, newState) {
  if (!settings.active) return;
  
  const member = newState.member;
  if (!member) return;

  // Jika target keluar, gabung, atau pindah
  if (!isTarget(member)) return;

  const guildId = newState.guild.id;

  // Target keluar dari channel
  if (newState.channelId === null) {
    const connectionData = activeConnections.get(guildId);
    if (connectionData) {
      connectionData.voiceConnection.destroy();
      activeConnections.delete(guildId);
    }
  } 
  // Target masuk atau pindah channel
  else {
    const channel = newState.channel;
    const voiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    const audioPlayer = createAudioPlayer();
    voiceConnection.subscribe(audioPlayer);

    activeConnections.set(guildId, { voiceConnection, audioPlayer });

    // Dengarkan saat ada yang berbicara
    voiceConnection.receiver.speaking.on('start', (userId) => {
      // Pastikan yang berbicara adalah target
      if (settings.targetType === "user" && userId !== settings.targetId) return;
      if (settings.targetType === "role") {
        const speakingMember = channel.guild.members.cache.get(userId);
        if (!speakingMember || !speakingMember.roles.cache.has(settings.targetId)) return;
      }

      // Jangan tumpuk audio jika sedang dimainkan
      if (audioPlayer.state.status === AudioPlayerStatus.Playing) return;

      const soundPath = path.join(__dirname, "../../assets/sounds", `${settings.sound}.mp3`);
      if (fs.existsSync(soundPath)) {
        const resource = createAudioResource(soundPath);
        audioPlayer.play(resource);
      }
    });
  }
}

module.exports = {
  settings,
  saveSettings,
  handleVoiceStateUpdate
};
