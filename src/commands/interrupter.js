const { SlashCommandBuilder } = require("discord.js");
const { settings, saveSettings } = require("../utils/interrupterService");
const fs = require("fs");
const path = require("path");

function getAvailableSounds() {
  const soundsDir = path.join(__dirname, "../../assets/sounds");
  if (!fs.existsSync(soundsDir)) return [];
  const files = fs.readdirSync(soundsDir);
  return files.filter(f => f.endsWith(".mp3")).map(f => f.replace(".mp3", ""));
}

module.exports = {
  // Command definition is separate in definitions.js, this is just the executor
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();

    if (subCommand === "toggle") {
      const status = interaction.options.getString("status");
      settings.active = (status === "on");
      saveSettings();
      return interaction.editReply(`Interrupter sekarang **${settings.active ? "AKTIF" : "NONAKTIF"}**.`);
    }

    if (subCommand === "target") {
      const role = interaction.options.getRole("role");
      const user = interaction.options.getUser("user");

      if (role) {
        settings.targetType = "role";
        settings.targetId = role.id;
        saveSettings();
        return interaction.editReply(`Target interrupter diatur ke Role: **${role.name}**.`);
      } else if (user) {
        settings.targetType = "user";
        settings.targetId = user.id;
        saveSettings();
        return interaction.editReply(`Target interrupter diatur ke User: **${user.tag}**.`);
      } else {
        return interaction.editReply("❌ Anda harus memilih role atau user sebagai target.");
      }
    }

    if (subCommand === "sound") {
      const soundName = interaction.options.getString("nama");
      const available = getAvailableSounds();
      
      if (!available.includes(soundName)) {
        return interaction.editReply(`❌ Suara **${soundName}** tidak ditemukan. Pilihan yang ada: ${available.join(", ")}`);
      }

      settings.sound = soundName;
      saveSettings();
      return interaction.editReply(`Suara interrupter diubah menjadi: **${soundName}**.`);
    }

    if (subCommand === "status") {
      let targetInfo = "Belum diatur";
      if (settings.targetId) {
        targetInfo = settings.targetType === "role" ? `<@&${settings.targetId}>` : `<@${settings.targetId}>`;
      }

      const available = getAvailableSounds();

      const embed = {
        title: "🎙️ Status Discord Interrupter",
        color: 0x5865F2,
        fields: [
          { name: "Status", value: settings.active ? "✅ Aktif" : "❌ Nonaktif", inline: true },
          { name: "Suara Terpilih", value: `**${settings.sound}**`, inline: true },
          { name: "Target", value: targetInfo, inline: false },
          { name: "Daftar Suara", value: available.length > 0 ? available.join(", ") : "Tidak ada file mp3", inline: false }
        ]
      };

      return interaction.editReply({ embeds: [embed] });
    }
  }
};
