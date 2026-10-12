const { EmbedBuilder } = require("discord.js");
const config = require("../config");

async function handleClaimAccount(interaction, bansosService) {
  try {
    const item = bansosService.claimItem(interaction.user.id, "account");

    const embed = new EmbedBuilder()
      .setColor(0x3fb950)
      .setTitle("🎉 Klaim Akun Berhasil!")
      .setDescription(
        `Selamat! Kamu berhasil mendapatkan bansos akun **${item.label}**.\n` +
          `Pesan ini bersifat **rahasia** dan hanya terlihat oleh kamu.`
      )
      .addFields(
        { name: "🏷️ Jenis Akun", value: item.label, inline: true },
        {
          name: "🔑 Detail Akun (Email:Password / Token)",
          value: `\`\`\`text\n${item.content}\n\`\`\``,
        },
        {
          name: "⚠️ Perhatian",
          value:
            "Harap segera coba dan gunakan. Dilarang memperjualbelikan bansos ini!",
        }
      )
      .setFooter({ text: "Novatria Bansos • Semoga bermanfaat!" })
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
              `**Kategori:** Akun Premium\n` +
              `**Item:** ${item.label}\n` +
              `**Waktu:** <t:${Math.floor(Date.now() / 1000)}:R>`
          )
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] }).catch(() => null);
      }
    }
  } catch (error) {
    await interaction.reply({
      content: `❌ ${error.message || "Gagal mengklaim akun."}`,
      ephemeral: true,
    });
  }
}

module.exports = handleClaimAccount;
