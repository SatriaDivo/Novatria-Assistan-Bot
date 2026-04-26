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

  const id = buatId("writeup");
  const judul = interaction.options.getString("judul", true);
  const challenge = interaction.options.getString("challenge") || "-";
  const ringkasan = interaction.options.getString("ringkasan") || "-";
  const url = interaction.options.getString("url") || "-";
  const writeupChannel = findCtfContentChannel(interaction.guild, "ctf-writeup");

  if (!writeupChannel) {
    return replyError(
      interaction,
      "Channel tidak ditemukan",
      "Channel ctf-writeup tidak ditemukan."
    );
  }

  if (url !== "-") {
    try {
      new URL(url);
    } catch {
      return replyError(
        interaction,
        "URL tidak valid",
        "Contoh URL yang benar: `https://example.com/writeup`."
      );
    }
  }

  const embed = new EmbedBuilder()
    .setColor(0x58a6ff)
    .setTitle(`📝 ${judul}`)
    .setDescription(ringkasan)
    .addFields(
      { name: "ID", value: id, inline: true },
      { name: "Challenge", value: challenge, inline: true },
      { name: "URL", value: url }
    )
    .setFooter({ text: `Ditulis oleh ${interaction.user.tag}` })
    .setTimestamp();

  const hasilKirim = await kirimKeChannel(interaction, writeupChannel, {
    embeds: [embed],
  });

  if (!hasilKirim.ok) {
    return replyError(interaction, "Gagal mengirim writeup", hasilKirim.error);
  }

  await simpanKeSheet("ctf_writeup", {
    id,
    user: interaction.user.tag,
    userId: interaction.user.id,
    server: interaction.guild.name,
    channel: writeupChannel.name,
    judul,
    challenge,
    ringkasan,
    url,
  });

  await replySuccess(interaction, "Writeup berhasil", `Writeup dikirim ke ${writeupChannel}.`, [
    { name: "ID", value: `\`${id}\`` },
  ]);
}

module.exports = { execute };
