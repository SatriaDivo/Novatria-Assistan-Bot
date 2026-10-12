const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const ticketService = require("../services/ticketService");

async function handleTicketButton(interaction) {
  const { customId, guild, member, channel } = interaction;

  // 1. Tombol Buka Tiket
  if (customId === "btn_ticket_create") {
    if (ticketService.hasOpenTicket(member.id)) {
      const existingChannelId = ticketService.getTicketChannelId(member.id);
      return interaction.reply({
        content: `❌ Kamu sudah memiliki tiket yang sedang aktif di <#${existingChannelId}>! Selesaikan tiket tersebut terlebih dahulu.`,
        ephemeral: true,
      });
    }

    try {
      const ticketChannel = await ticketService.createTicketChannel(guild, member);

      const welcomeEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`🎫 Tiket Bantuan: ${member.user.tag}`)
        .setDescription(
          `Halo <@${member.id}>, selamat datang di tiket bantuan privat kamu!\n\n` +
            `Silakan jelaskan kendala atau pertanyaan kamu secara rinci (sertakan screenshot jika ada).\n` +
            `Tim Admin akan segera merespons pesan kamu di sini.`
        )
        .setFooter({ text: "Tekan tombol di bawah jika kendala sudah terselesaikan." })
        .setTimestamp();

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("btn_ticket_close")
          .setLabel("🔒 Tutup Tiket")
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({
        content: `Halo <@${member.id}>! Tiket kamu siap digunakan.`,
        embeds: [welcomeEmbed],
        components: [closeRow],
      });

      return interaction.reply({
        content: `✅ Tiket bantuan kamu berhasil dibuat! Silakan klik ke <#${ticketChannel.id}>.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Gagal membuat tiket:", error);
      return interaction.reply({
        content: `❌ Gagal membuat channel tiket: ${error.message}. Pastikan bot memiliki izin Manage Channels.`,
        ephemeral: true,
      });
    }
  }

  // 2. Tombol Tutup Tiket
  if (customId === "btn_ticket_close") {
    const ownerUserId = ticketService.findUserByChannelId(channel.id);
    if (ownerUserId) {
      ticketService.removeOpenTicket(ownerUserId);
    }

    await interaction.reply({
      content: "🔒 **Tiket sedang ditutup...** Channel ini akan dihapus secara otomatis dalam 5 detik.",
    });

    setTimeout(async () => {
      try {
        await channel.delete("Tiket ditutup oleh user/admin");
      } catch (err) {
        console.warn("Gagal menghapus channel tiket:", err.message);
      }
    }, 5000);
  }
}

module.exports = handleTicketButton;
