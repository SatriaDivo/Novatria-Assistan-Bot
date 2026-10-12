const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const config = require("../config");
const { generateWelcomeCard } = require("../utils/welcomeCard");
const { updateMemberStats } = require("../services/statsService");

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

    // 2. Generate Welcome Card Gambar & Kirim ke Channel Welcome
    if (config.channels.welcome) {
      const welcomeChannel = member.guild.channels.cache.get(config.channels.welcome);
      if (welcomeChannel) {
        let files = [];
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
          .setFooter({ text: `Member #${member.guild.memberCount}` })
          .setTimestamp();

        try {
          const imageBuffer = await generateWelcomeCard(member);
          const attachment = new AttachmentBuilder(imageBuffer, {
            name: `welcome-${member.id}.png`,
          });
          embed.setImage(`attachment://welcome-${member.id}.png`);
          files = [attachment];
        } catch (err) {
          console.warn("Gagal membuat gambar welcome card, fallback ke avatar:", err.message);
          embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }));
        }

        await welcomeChannel.send({
          content: `Selamat datang <@${member.id}>! 👋`,
          embeds: [embed],
          files,
        });
      }
    }

    // 3. Update Dynamic Server Stats Channel
    await updateMemberStats(member.guild);
  } catch (error) {
    console.error("Error pada event guildMemberAdd:", error);
  }
}

module.exports = handleGuildMemberAdd;
