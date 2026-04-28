const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { assertCtfCommandChannel } = require("../utils/ctfChannelGuard");
const { findCtfContentChannel } = require("../utils/ctfChannels");
const { replyError, replySuccess } = require("../utils/replyEmbed");
const simpanKeSheet = require("../utils/sheet");
const buatId = require("../utils/buatId");
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
const MAX_MARKDOWN_FILES = 5;
const MAX_ATTACHMENT_FILES = 5;
const MAX_MARKDOWN_CHUNKS = 10;

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

  const id = buatId("tantangan");
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
  const mdFilesToProcess = mdFiles.slice(0, MAX_MARKDOWN_FILES);
  const otherFilesToProcess = otherFiles.slice(0, MAX_ATTACHMENT_FILES);
  const skippedSummary = [];
  let sentMarkdownChunks = 0;
  let skippedMarkdownChunks = 0;
  let skippedMarkdownFilesByChunkLimit = 0;
  let processedMarkdownFiles = 0;
  let processedAttachmentFiles = 0;

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
        `**ID:** \`${id}\``,
        path ? `**Path:** \`${path}\`` : null,
        branch ? `**Branch:** \`${branch}\`` : null,
        hadiah ? `**🏆 Hadiah:** ${hadiah}` : null,
        `**File ditemukan:** ${mdFiles.length} markdown, ${otherFiles.length} file lainnya${directories.length > 0 ? `, ${directories.length} folder` : ""}`,
        `**Limit proses:** ${MAX_MARKDOWN_FILES} markdown, ${MAX_ATTACHMENT_FILES} attachment, ${MAX_MARKDOWN_CHUNKS} chunk markdown.`,
      ]
        .filter(Boolean)
        .join("\n")
    )
    .setFooter({ text: `Ditambahkan oleh ${interaction.user.tag}` })
    .setTimestamp();

  const channel = targetChannel;

  // Kirim header embed ke ctf-info
  await channel.send({ embeds: [headerEmbed] });

  // Proses file markdown dengan batas aman agar folder besar tidak spam channel.
  for (const mdFile of mdFilesToProcess) {
    try {
      const rawContent = await fetchRawContent(owner, repo, mdFile.path, branch);
      const chunks = splitMarkdown(rawContent);
      const remainingChunks = MAX_MARKDOWN_CHUNKS - sentMarkdownChunks;

      if (remainingChunks <= 0) {
        skippedMarkdownFilesByChunkLimit += 1;
        continue;
      }

      const chunksToSend = chunks.slice(0, remainingChunks);
      skippedMarkdownChunks += chunks.length - chunksToSend.length;
      processedMarkdownFiles += 1;

      for (let i = 0; i < chunksToSend.length; i++) {
        const mdEmbed = new EmbedBuilder()
          .setColor(0x58a6ff)
          .setTitle(
            chunks.length > 1
              ? `📄 ${mdFile.name} (${i + 1}/${chunks.length})`
              : `📄 ${mdFile.name}`
          )
          .setDescription(chunksToSend[i])
          .setTimestamp();

        await channel.send({ embeds: [mdEmbed] });
        sentMarkdownChunks += 1;
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
  for (const file of otherFilesToProcess) {
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
        processedAttachmentFiles += 1;
        continue;
      }

      // Download dan kirim sebagai attachment
      const buffer = await downloadFile(file.download_url);

      if (!buffer) {
        // Gagal download atau terlalu besar setelah download
        const linkEmbed = new EmbedBuilder()
          .setColor(0xe3b341)
          .setTitle(`📎 ${file.name}`)
          .setDescription(
            `File terlalu besar untuk Discord.\n**Download:** [Klik di sini](${file.download_url || file.html_url})`
          )
          .setTimestamp();

        await channel.send({ embeds: [linkEmbed] });
        processedAttachmentFiles += 1;
        continue;
      }

      const attachment = new AttachmentBuilder(buffer, { name: file.name });

      await channel.send({
        content: `📎 **${file.name}** (${formatSize(buffer.length)})`,
        files: [attachment],
      });
      processedAttachmentFiles += 1;
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
      .setDescription(
        `Folder berikut tidak di-download otomatis. Gunakan \`/tantangan\` dengan path spesifik untuk membukanya.\n\n${dirList}`
      )
      .setTimestamp();

    await channel.send({ embeds: [dirEmbed] });
  }

  const skippedMarkdownFilesByFileLimit = mdFiles.length - mdFilesToProcess.length;
  const skippedAttachmentFilesByFileLimit = otherFiles.length - otherFilesToProcess.length;

  if (skippedMarkdownFilesByFileLimit > 0) {
    skippedSummary.push(
      `${skippedMarkdownFilesByFileLimit} markdown file dilewati karena limit ${MAX_MARKDOWN_FILES} file.`
    );
  }

  if (skippedAttachmentFilesByFileLimit > 0) {
    skippedSummary.push(
      `${skippedAttachmentFilesByFileLimit} attachment file dilewati karena limit ${MAX_ATTACHMENT_FILES} file.`
    );
  }

  if (skippedMarkdownFilesByChunkLimit > 0) {
    skippedSummary.push(
      `${skippedMarkdownFilesByChunkLimit} markdown file dilewati karena limit chunk sudah habis.`
    );
  }

  if (skippedMarkdownChunks > 0) {
    skippedSummary.push(
      `${skippedMarkdownChunks} chunk markdown dilewati karena limit total ${MAX_MARKDOWN_CHUNKS} chunk.`
    );
  }

  let sheetStatus = "Disimpan";

  try {
    const sheetResult = await simpanKeSheet("ctf_tantangan", {
      id,
      user: interaction.user.tag,
      userId: interaction.user.id,
      server: interaction.guild.name,
      channel: targetChannel.name,
      judul: headerTitle,
      repository: `${owner}/${repo}`,
      path: path || "",
      branch: branch || "",
      url,
      hadiah: hadiah || "",
      markdownFiles: `${processedMarkdownFiles}/${mdFiles.length}`,
      attachmentFiles: `${processedAttachmentFiles}/${otherFiles.length}`,
      skippedSummary: skippedSummary.join("; ") || "-",
    });

    if (sheetResult.skipped) {
      sheetStatus = "Dilewati karena SHEET_WEBAPP_URL belum dikonfigurasi.";
    } else if (sheetResult.sheet && sheetResult.sheet !== "CTF Tantangan") {
      sheetStatus = `Tersimpan ke ${sheetResult.sheet}. Update Apps Script agar memakai sheet CTF Tantangan.`;
    }
  } catch (error) {
    sheetStatus = `Gagal menyimpan: ${error.message}`;
  }

  if (skippedSummary.length > 0) {
    const summaryEmbed = new EmbedBuilder()
      .setColor(0xe3b341)
      .setTitle("⚠️ Sebagian file dilewati")
      .setDescription(skippedSummary.join("\n"))
      .setTimestamp();

    await channel.send({ embeds: [summaryEmbed] });
  }

  await replySuccess(
    interaction,
    "Tantangan berhasil ditambahkan",
    `Tantangan dari [${owner}/${repo}](${url}) berhasil dikirim ke ${targetChannel}.`,
    [
      { name: "ID", value: `\`${id}\``, inline: true },
      { name: "Channel", value: `${targetChannel}`, inline: true },
      { name: "Markdown", value: `${processedMarkdownFiles}/${mdFiles.length} file`, inline: true },
      {
        name: "Attachment",
        value: `${processedAttachmentFiles}/${otherFiles.length} file`,
        inline: true,
      },
      { name: "Google Sheet", value: sheetStatus },
    ]
  );
}

module.exports = { execute };
