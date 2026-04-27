const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { assertCtfCommandChannel } = require("../utils/ctfChannelGuard");
const { findCtfContentChannel } = require("../utils/ctfChannels");
const { replyError, replySuccess } = require("../utils/replyEmbed");
const {
  parseGithubUrl,
  fetchContents,
  fetchRawContent,
  downloadFile,
  isMarkdownFile,
  MAX_DISCORD_FILE_SIZE,
} = require("../utils/githubFetcher");

// Batas karakter embed description Discord
const EMBED_DESC_LIMIT = 4096;
// Batas karakter total embed
const EMBED_TOTAL_LIMIT = 6000;

/**
 * Potong teks markdown agar muat di embed Discord.
 * Bagi jadi beberapa chunk jika perlu.
 */
function splitMarkdown(text, limit = EMBED_DESC_LIMIT) {
  if (text.length <= limit) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= limit) {
      chunks.push(remaining);
      break;
    }

    // Cari titik potong terbaik: newline terakhir sebelum limit
    let cutIndex = remaining.lastIndexOf("\n", limit);

    if (cutIndex <= 0) {
      // Tidak ada newline, potong di spasi terakhir
      cutIndex = remaining.lastIndexOf(" ", limit);
    }

    if (cutIndex <= 0) {
      // Tidak ada spasi juga, potong paksa
      cutIndex = limit;
    }

    chunks.push(remaining.slice(0, cutIndex));
    remaining = remaining.slice(cutIndex).trimStart();
  }

  return chunks;
}

/**
 * Format ukuran file ke satuan yang mudah dibaca.
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function execute(interaction) {
  // Guard: hanya bisa di channel CTF atau area bot command
  if (!(await assertCtfCommandChannel(interaction))) {
    return;
  }

  const url = interaction.options.getString("url", true).trim();
  const judul = interaction.options.getString("judul");
  const hadiah = interaction.options.getString("hadiah");
  const parsed = parseGithubUrl(url);

  if (!parsed) {
    return replyError(
      interaction,
      "URL tidak valid",
      "Harus berupa URL GitHub yang valid.\nContoh: `https://github.com/user/repo` atau `https://github.com/user/repo/tree/main/folder`"
    );
  }

  const { owner, repo, path, branch } = parsed;

  // Fetch daftar file dari GitHub
  let contents;

  try {
    contents = await fetchContents(owner, repo, path, branch);
  } catch (error) {
    return replyError(interaction, "Gagal fetch GitHub", error.message);
  }

  // Pisahkan file markdown dan file lainnya
  const mdFiles = contents.filter((f) => f.type === "file" && isMarkdownFile(f.name));
  const otherFiles = contents.filter((f) => f.type === "file" && !isMarkdownFile(f.name));
  const directories = contents.filter((f) => f.type === "dir");

  if (mdFiles.length === 0 && otherFiles.length === 0) {
    return replyError(
      interaction,
      "Tidak ada file",
      "Tidak ditemukan file di path tersebut. Mungkin hanya folder kosong atau semua isinya adalah sub-directory."
    );
  }

  // Cari channel ctf-info sebagai target pengiriman
  const targetChannel = findCtfContentChannel(interaction.guild, "ctf-info");

  if (!targetChannel) {
    return replyError(
      interaction,
      "Channel tidak ditemukan",
      "Channel **ctf-info** tidak ditemukan di server ini. Buat channel dengan nama yang mengandung `ctf-info` terlebih dahulu."
    );
  }

  // Cek izin kirim ke channel target
  const { cekIzinKirim } = require("../utils/kirimKeChannel");

  if (!cekIzinKirim(interaction, targetChannel)) {
    return replyError(
      interaction,
      "Tidak punya izin",
      `Bot belum punya izin untuk mengirim pesan di ${targetChannel}. Aktifkan **View Channel** dan **Send Messages** untuk role bot.`
    );
  }

  // Header embed — info tantangan
  const headerTitle = judul || `📂 ${repo}${path ? `/${path}` : ""}`;
  const headerEmbed = new EmbedBuilder()
    .setColor(0x7c3aed)
    .setTitle(`🎯 ${headerTitle}`)
    .setURL(url)
    .setDescription(
      [
        `**Repository:** [${owner}/${repo}](${url})`,
        path ? `**Path:** \`${path}\`` : null,
        branch ? `**Branch:** \`${branch}\`` : null,
        hadiah ? `**🏆 Hadiah:** ${hadiah}` : null,
        `**File ditemukan:** ${mdFiles.length} markdown, ${otherFiles.length} file lainnya${directories.length > 0 ? `, ${directories.length} folder` : ""}`,
      ]
        .filter(Boolean)
        .join("\n")
    )
    .setFooter({ text: `Ditambahkan oleh ${interaction.user.tag}` })
    .setTimestamp();

  const channel = targetChannel;

  // Kirim header embed ke ctf-info
  await channel.send({ embeds: [headerEmbed] });

  // Proses setiap file markdown → kirim sebagai embed
  for (const mdFile of mdFiles) {
    try {
      const rawContent = await fetchRawContent(owner, repo, mdFile.path, branch);
      const chunks = splitMarkdown(rawContent);

      for (let i = 0; i < chunks.length; i++) {
        const mdEmbed = new EmbedBuilder()
          .setColor(0x58a6ff)
          .setTitle(chunks.length > 1 ? `📄 ${mdFile.name} (${i + 1}/${chunks.length})` : `📄 ${mdFile.name}`)
          .setDescription(chunks[i])
          .setTimestamp();

        await channel.send({ embeds: [mdEmbed] });
      }
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xf85149)
        .setTitle(`❌ Gagal baca ${mdFile.name}`)
        .setDescription(error.message)
        .setTimestamp();

      await channel.send({ embeds: [errorEmbed] });
    }
  }

  // Proses file non-markdown → kirim sebagai attachment atau link
  for (const file of otherFiles) {
    try {
      if (file.size && file.size > MAX_DISCORD_FILE_SIZE) {
        // File terlalu besar, kirim link saja
        const linkEmbed = new EmbedBuilder()
          .setColor(0xe3b341)
          .setTitle(`📎 ${file.name}`)
          .setDescription(
            `File terlalu besar untuk Discord (${formatSize(file.size)}).\n**Download:** [Klik di sini](${file.download_url || file.html_url})`
          )
          .setTimestamp();

        await channel.send({ embeds: [linkEmbed] });
        continue;
      }

      // Download dan kirim sebagai attachment
      const buffer = await downloadFile(file.download_url);

      if (!buffer) {
        // Gagal download atau terlalu besar setelah download
        const linkEmbed = new EmbedBuilder()
          .setColor(0xe3b341)
          .setTitle(`📎 ${file.name}`)
          .setDescription(`File terlalu besar untuk Discord.\n**Download:** [Klik di sini](${file.download_url || file.html_url})`)
          .setTimestamp();

        await channel.send({ embeds: [linkEmbed] });
        continue;
      }

      const attachment = new AttachmentBuilder(buffer, { name: file.name });

      await channel.send({
        content: `📎 **${file.name}** (${formatSize(buffer.length)})`,
        files: [attachment],
      });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xf85149)
        .setTitle(`❌ Gagal download ${file.name}`)
        .setDescription(error.message)
        .setTimestamp();

      await channel.send({ embeds: [errorEmbed] });
    }
  }

  // Jika ada sub-directory, beri info ke user
  if (directories.length > 0) {
    const dirList = directories.map((d) => `📁 \`${d.name}\``).join("\n");
    const dirEmbed = new EmbedBuilder()
      .setColor(0x8b949e)
      .setTitle("📁 Sub-folder ditemukan")
      .setDescription(`Folder berikut tidak di-download otomatis. Gunakan \`/tantangan\` dengan path spesifik untuk membukanya.\n\n${dirList}`)
      .setTimestamp();

    await channel.send({ embeds: [dirEmbed] });
  }

  await replySuccess(
    interaction,
    "Tantangan berhasil ditambahkan",
    `Tantangan dari [${owner}/${repo}](${url}) berhasil dikirim ke ${targetChannel}.`,
    [
      { name: "Channel", value: `${targetChannel}`, inline: true },
      { name: "Markdown", value: `${mdFiles.length} file`, inline: true },
      { name: "Attachment", value: `${otherFiles.length} file`, inline: true },
    ]
  );
}

module.exports = { execute };
