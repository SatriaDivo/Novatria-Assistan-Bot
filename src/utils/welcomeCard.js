const { createCanvas, loadImage } = require("@napi-rs/canvas");

async function generateWelcomeCard(member) {
  const width = 800;
  const height = 360;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Background Gradient Modern Dark
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, "#0d1117");
  bgGradient.addColorStop(0.5, "#161b22");
  bgGradient.addColorStop(1, "#21262d");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Aksen Kotak / Glow Card di Tengah
  ctx.save();
  ctx.fillStyle = "rgba(30, 41, 59, 0.7)";
  ctx.strokeStyle = "rgba(88, 101, 242, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(20, 20, width - 40, height - 40, 20);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 3. Avatar Lingkaran dengan Border Neon
  const avatarSize = 130;
  const avatarX = 70;
  const avatarY = (height - avatarSize) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2 + 5,
    0,
    Math.PI * 2
  );
  ctx.strokeStyle = "#5865F2";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Clip avatar
  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2,
    0,
    Math.PI * 2
  );
  ctx.closePath();
  ctx.clip();

  try {
    const avatarUrl = member.user.displayAvatarURL({
      extension: "png",
      size: 256,
      forceStatic: true,
    });
    const avatarImg = await loadImage(avatarUrl);
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
  } catch {
    // Fallback warna jika avatar gagal di-load
    ctx.fillStyle = "#5865F2";
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
  }
  ctx.restore();

  // 4. Tulisan Sambutan
  const textX = avatarX + avatarSize + 40;

  // Header Subtitle
  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = "#58a6ff";
  ctx.fillText("SELAMAT DATANG DI SERVER", textX, 130);

  // Username
  ctx.font = "bold 36px sans-serif";
  ctx.fillStyle = "#ffffff";
  const rawName = member.user.username;
  const displayName = rawName.length > 18 ? rawName.slice(0, 15) + "..." : rawName;
  ctx.fillText(displayName, textX, 180);

  // Member Count Badge
  ctx.font = "500 22px sans-serif";
  ctx.fillStyle = "#8b949e";
  ctx.fillText(
    `Member #${member.guild.memberCount} • ${member.guild.name}`,
    textX,
    225
  );

  return canvas.toBuffer("image/png");
}

module.exports = { generateWelcomeCard };
