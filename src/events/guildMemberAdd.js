const { EmbedBuilder } = require("discord.js");
const config = require("../config");

async function handleGuildMemberAdd(member) {
  try {
    // 1. Auto-assign role Member default jika dikonfigurasi
    if (config.roles.defaultMember) {
      const defaultRole = member.guild.roles.cache.get(config.roles.defaultMember);
      if (defaultRole) {
        await member.roles.add(defaultRole).catch((err) => {
          console.warn(`Gagal memberikan auto-role default ke ${member.user.tag}:`, err.message);
        });
      }
    }

    // 2. Kirim pesan welcome ke channel welcome
    if (config.channels.welcome) {
      const welcomeChannel = member.guild.channels.cache.get(config.channels.welcome);
      if (welcomeChannel) {
        const embed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle(`🎉 Selamat Datang di ${member.guild.name}!`)
          .setDescription(
            `Halo <@${member.id}>, selamat datang di server komunitas kami!\n\n` +
              `📌 **Langkah Awal:**\n` +
              `• Baca peraturan server di channel rules.\n` +
              `• Ambil role notifikasi mabar & bansos di channel ambil-role.\n` +
              `• Nongkrong dan ngobrol santai di channel general-chat.\n\n` +
              `Semoga betah dan seru-seruan bareng di sini!`
          )
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
          .setFooter({ text: `Member #${member.guild.memberCount}` })
          .setTimestamp();

        await welcomeChannel.send({
          content: `Selamat datang <@${member.id}>! 👋`,
          embeds: [embed],
        });
      }
    }
  } catch (error) {
    console.error("Error pada event guildMemberAdd:", error);
  }
}

module.exports = handleGuildMemberAdd;
