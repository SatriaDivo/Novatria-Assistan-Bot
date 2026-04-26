const { EmbedBuilder } = require("discord.js");
const buatId = require("../utils/buatId");
const { assertCtfCommandChannel } = require("../utils/ctfChannelGuard");
const { findCtfContentChannel } = require("../utils/ctfChannels");
const kirimKeChannel = require("../utils/kirimKeChannel");
const simpanKeSheet = require("../utils/sheet");
const { replyError, replySuccess } = require("../utils/replyEmbed");

async function execute(interaction) {
  if (!(await assertCtfCommandChannel(interaction))) {
    return;
  }

  const id = buatId("ctf");
  const nama = interaction.options.getString("nama", true);
  const platform = interaction.options.getString("platform") || "-";
  const url = interaction.options.getString("url") || "-";
  const kategori = interaction.options.getString("kategori") || "-";
  const catatan = interaction.options.getString("catatan") || "-";
  const targetChannel = findCtfContentChannel(interaction.guild, "ctf-target");

  if (!targetChannel) {
    return replyError(
      interaction,
      "Channel tidak ditemukan",
      "Channel ctf-target tidak ditemukan."
    );
  }

  if (url !== "-") {
    try {
      new URL(url);
    } catch {
      return replyError(
        interaction,
        "URL tidak valid",
        "Contoh URL yang benar: `https://example.com/challenge`."
      );
    }
  }

  const embed = new EmbedBuilder()
    .setColor(0x7c3aed)
    .setTitle(`🎯 ${nama}`)
    .setDescription(catatan)
    .addFields(
      { name: "ID", value: id, inline: true },
      { name: "Platform", value: platform, inline: true },
      { name: "Kategori", value: kategori, inline: true },
      { name: "URL", value: url }
    )
    .setFooter({ text: `Ditambahkan oleh ${interaction.user.tag}` })
    .setTimestamp();

  const hasilKirim = await kirimKeChannel(interaction, targetChannel, {
    embeds: [embed],
  });

  if (!hasilKirim.ok) {
    return replyError(interaction, "Gagal mengirim challenge CTF", hasilKirim.error);
  }

  await simpanKeSheet("ctf_challenge", {
    id,
    user: interaction.user.tag,
    userId: interaction.user.id,
    server: interaction.guild.name,
    channel: targetChannel.name,
    nama,
    platform,
    url,
    kategori,
    catatan,
  });

  await replySuccess(
    interaction,
    "Challenge CTF berhasil",
    `Challenge dikirim ke ${targetChannel}.`,
    [{ name: "ID", value: `\`${id}\`` }]
  );
}

module.exports = { execute };
