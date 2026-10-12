const { EmbedBuilder } = require("discord.js");
const config = require("../config");

async function handleClaimApi(interaction, bansosService) {
  try {
    const item = bansosService.claimItem(interaction.user.id, "api");

    const embed = new EmbedBuilder()
      .setColor(0x58a6ff)
      .setTitle("🎉 Klaim API Key Berhasil!")
      .setDescription(
        `Selamat! Kamu berhasil mendapatkan bansos API Key **${item.label}**.\n` +
          `Pesan ini bersifat **rahasia** dan hanya terlihat oleh kamu.`
      )
      .addFields(
        { name: "🏷️ Provider / Layanan", value: item.label, inline: true },
        {
          name: "🔑 API Key",
          value: `\`\`\`text\n${item.content}\n\`\`\``,
        },
        {
          name: "⚠️ Perhatian",
          value:
            "Jaga kerahasiaan API key kamu, jangan commit ke repository publik!",
        }
      )
      .setFooter({ text: "Novatria Bansos • Happy Coding!" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });

    // Kirim notifikasi log ke channel log admin
    if (config.channels.bansosLog) {
      const logChannel = interaction.guild.channels.cache.get(
        config.channels.bansosLog
      );
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(0x58a6ff)
          .setTitle("📋 Log Klaim Bansos")
          .setDescription(
            `**User:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
              `**Kategori:** API Key\n` +
              `**Provider:** ${item.label}\n` +
              `**Waktu:** <t:${Math.floor(Date.now() / 1000)}:R>`
          )
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] }).catch(() => null);
      }
    }
  } catch (error) {
    await interaction.reply({
      content: `❌ ${error.message || "Gagal mengklaim API Key."}`,
      ephemeral: true,
    });
  }
}

module.exports = handleClaimApi;
