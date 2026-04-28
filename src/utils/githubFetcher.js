const config = require("../config");

const GITHUB_API = "https://api.github.com";
const MAX_DISCORD_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

/**
 * Parse berbagai format URL GitHub menjadi komponen owner, repo, path, dan branch.
 *
 * Format yang didukung:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/tree/branch/path
 * - https://github.com/owner/repo/blob/branch/file.md
 */
function parseGithubUrl(url) {
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.hostname !== "github.com") return null;

  // Hapus leading/trailing slash dan split
  const segments = parsed.pathname.replace(/^\/|\/$/g, "").split("/");

  if (segments.length < 2) return null;

  const owner = segments[0];
  const repo = segments[1];

  // github.com/owner/repo
  if (segments.length === 2) {
    return { owner, repo, path: "", branch: null };
  }

  // github.com/owner/repo/tree/branch/... atau /blob/branch/...
  const type = segments[2]; // "tree" atau "blob"

  if ((type === "tree" || type === "blob") && segments.length >= 4) {
    const branch = segments[3];
    const path = segments.slice(4).join("/");

    return { owner, repo, path, branch };
  }

  // Format tidak dikenal, anggap path langsung setelah repo
  return { owner, repo, path: segments.slice(2).join("/"), branch: null };
}

/**
 * Buat headers untuk request ke GitHub API.
 * Sertakan token jika tersedia agar rate limit lebih tinggi.
 */
function makeHeaders() {
  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Novatria-Bot",
  };

  if (config.githubToken) {
    headers.Authorization = `token ${config.githubToken}`;
  }

  return headers;
}

/**
 * Fetch daftar file/directory dari GitHub Contents API.
 * Mengembalikan array berisi metadata setiap file.
 */
async function fetchContents(owner, repo, path = "", branch = null) {
  let apiUrl = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;

  if (branch) {
    apiUrl += `?ref=${encodeURIComponent(branch)}`;
  }

  const response = await fetch(apiUrl, { headers: makeHeaders() });

  if (!response.ok) {
    const body = await response.text();

    if (response.status === 404) {
      throw new Error("Repository atau path tidak ditemukan di GitHub.");
    }

    if (response.status === 403) {
      throw new Error(
        "GitHub API rate limit tercapai. Coba lagi nanti atau tambahkan GITHUB_TOKEN di .env."
      );
    }

    throw new Error(`GitHub API error ${response.status}: ${body}`);
  }

  const data = await response.json();

  // Jika result adalah single file (bukan array), bungkus jadi array
  return Array.isArray(data) ? data : [data];
}

/**
 * Fetch raw content sebuah file dari GitHub.
 * Mengembalikan string isi file.
 */
async function fetchRawContent(owner, repo, filePath, branch = null) {
  const ref = branch || "HEAD";
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Novatria-Bot" },
  });

  if (!response.ok) {
    throw new Error(`Gagal fetch raw file ${filePath}: HTTP ${response.status}`);
  }

  return response.text();
}

/**
 * Download file sebagai Buffer dari URL.
 * Mengembalikan { buffer, size } atau null jika terlalu besar.
 */
async function downloadFile(downloadUrl) {
  const response = await fetch(downloadUrl, {
    headers: { "User-Agent": "Novatria-Bot" },
  });

  if (!response.ok) {
    throw new Error(`Gagal download file: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length > MAX_DISCORD_FILE_SIZE) {
    return null; // Terlalu besar untuk Discord
  }

  return buffer;
}

/**
 * Cek apakah file adalah markdown berdasarkan ekstensi.
 */
function isMarkdownFile(filename) {
  return /\.md$/i.test(filename);
}

module.exports = {
  parseGithubUrl,
  fetchContents,
  fetchRawContent,
  downloadFile,
  isMarkdownFile,
  MAX_DISCORD_FILE_SIZE,
};
