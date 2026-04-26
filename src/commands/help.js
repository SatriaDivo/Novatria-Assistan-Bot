const { EmbedBuilder } = require("discord.js");

async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x58a6ff)
    .setTitle("🤖 NOVATRIA ASSISTANT HELP")
    .setDescription("Daftar command utama Novatria Assistant.")
    .addFields(
      { name: "/ping", value: "Cek bot aktif.", inline: true },
      { name: "/status", value: "Cek status channel, permission, dan Google Sheet.", inline: true },
      { name: "/catat", value: "Simpan catatan ke Discord dan Google Sheet.", inline: true },
      { name: "/todo", value: "Simpan tugas/todo.", inline: true },
      { name: "/link", value: "Simpan link penting.", inline: true },
      { name: "/jadwal", value: "Buat jadwal ke Sheet + Google Calendar.", inline: true },
      { name: "/arsip", value: "Simpan arsip penting.", inline: true },
      { name: "/list", value: "Lihat data tersimpan beserta ID.", inline: true },
      { name: "/hapus", value: "Hapus data tertentu berdasarkan ID.", inline: true }
    )
    .setFooter({ text: "Novatria Assistant • Novatria HQ" })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

module.exports = { execute };
