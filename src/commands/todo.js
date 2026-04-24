const { EmbedBuilder } = require("discord.js");
const getTargetChannel = require("../utils/getTargetChannel");
const kirimKeChannel = require("../utils/kirimKeChannel");
const simpanKeSheet = require("../utils/sheet");
const buatId = require("../utils/buatId");

async function execute(interaction) {
  const id = buatId("todo");
  const tugas = interaction.options.getString("tugas");
  const channelTodo = await getTargetChannel(interaction.guild, "todo", "todo-list");

  if (!channelTodo) {
    return interaction.editReply({
      content: "❌ Channel todo-list tidak ditemukan.",
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0x3fb950)
    .setTitle("✅ Todo Baru")
    .setDescription(`☐ ${tugas}`)
    .addFields(
      { name: "ID", value: id, inline: true },
      { name: "Status", value: "Belum selesai", inline: true }
    )
    .setFooter({ text: `Dibuat oleh ${interaction.user.tag}` })
    .setTimestamp();

  const hasilKirim = await kirimKeChannel(interaction, channelTodo, {
    embeds: [embed],
  });

  if (!hasilKirim.ok) {
    return interaction.editReply({ content: hasilKirim.error });
  }

  await simpanKeSheet("todo", {
    id,
    user: interaction.user.tag,
    userId: interaction.user.id,
    server: interaction.guild.name,
    channel: channelTodo.name,
    tugas,
    status: "Belum selesai",
  });

  await interaction.editReply({
    content: `✅ Todo berhasil dikirim ke ${channelTodo}. ID: \`${id}\``,
  });
}

module.exports = { execute };
