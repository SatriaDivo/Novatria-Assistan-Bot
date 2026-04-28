const { EmbedBuilder } = require("discord.js");

async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x58a6ff)
    .setTitle("🤖 NOVATRIA ASSISTANT HELP")
    .setDescription("Daftar command utama Novatria Assistant.")
    .addFields(
      {
        name: "Umum",
        value: [
          "`/ping` - Cek bot aktif.",
          "`/help` - Lihat daftar command.",
          "`/status` - Cek channel, permission, dan Google Sheet.",
          "`/list` - Lihat data tersimpan beserta ID.",
          "`/hapus` - Hapus data berdasarkan ID.",
        ].join("\n"),
      },
      {
        name: "Produktivitas",
        value: [
          "`/catat` - Simpan catatan.",
          "`/todo` - Simpan tugas/todo.",
          "`/done` - Tandai todo sebagai selesai.",
          "`/link` - Simpan link penting.",
          "`/jadwal` - Buat jadwal ke Sheet + Google Calendar.",
          "`/arsip` - Simpan arsip penting.",
        ].join("\n"),
      },
      {
        name: "Mabar",
        value: "`/mabar` - Buat jadwal mabar ke Discord dan Google Sheet.",
      },
      {
        name: "CTF",
        value: [
          "`/ctfevent` - Lihat lomba CTF upcoming dari CTFtime.",
          "`/ctfcek` - Kirim info CTF ke channel CTF.",
          "`/ctfnotify` - Atur notifikasi otomatis H-3 CTFtime.",
          "`/ctf` - Tambah challenge CTF.",
          "`/tantangan` - Import tantangan dari GitHub.",
          "`/writeup` - Simpan writeup CTF.",
          "`/progress` - Update progress challenge CTF.",
        ].join("\n"),
      }
    )
    .setFooter({ text: "Novatria Assistant • Novatria HQ" })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

module.exports = { execute };
