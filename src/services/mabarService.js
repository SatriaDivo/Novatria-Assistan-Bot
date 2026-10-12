const { EmbedBuilder } = require("discord.js");

const sessions = new Map();

function createSession(messageId, hostId, game, maxSlots, note, time) {
  const session = {
    messageId,
    hostId,
    game,
    maxSlots: parseInt(maxSlots, 10),
    note: note || "-",
    time: time || "Sekarang / Langsung Gas",
    participants: [hostId],
    createdAt: Date.now(),
  };

  sessions.set(messageId, session);
  return session;
}

function getSession(messageId) {
  return sessions.get(messageId);
}

function joinSession(messageId, userId) {
  const session = sessions.get(messageId);
  if (!session) {
    throw new Error("Sesi mabar tidak ditemukan atau sudah berakhir.");
  }

  if (session.participants.includes(userId)) {
    throw new Error("Kamu sudah bergabung dalam mabar ini!");
  }

  if (session.participants.length >= session.maxSlots) {
    throw new Error("Slot mabar sudah penuh!");
  }

  session.participants.push(userId);
  return session;
}

function leaveSession(messageId, userId) {
  const session = sessions.get(messageId);
  if (!session) {
    throw new Error("Sesi mabar tidak ditemukan atau sudah berakhir.");
  }

  if (userId === session.hostId) {
    throw new Error("Host tidak bisa keluar! Gunakan tombol batalkan mabar jika ingin mengakhiri sesi.");
  }

  const index = session.participants.indexOf(userId);
  if (index === -1) {
    throw new Error("Kamu belum bergabung dalam mabar ini.");
  }

  session.participants.splice(index, 1);
  return session;
}

function cancelSession(messageId, userId) {
  const session = sessions.get(messageId);
  if (!session) {
    throw new Error("Sesi mabar tidak ditemukan.");
  }

  if (userId !== session.hostId) {
    throw new Error("Hanya host mabar yang bisa membatalkan sesi ini.");
  }

  sessions.delete(messageId);
  return session;
}

function buildMabarEmbed(session) {
  const isFull = session.participants.length >= session.maxSlots;
  const participantList = session.participants
    .map((id, index) => `${index + 1}. <@${id}>${id === session.hostId ? " 👑 *(Host)*" : ""}`)
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor(isFull ? 0xf85149 : 0x3fb950)
    .setTitle(`🎮 AJAKAN MABAR: ${session.game}`)
    .setDescription(
      `**Host:** <@${session.hostId}>\n` +
        `**Waktu / Jam:** ${session.time}\n` +
        `**Catatan:** ${session.note}\n\n` +
        `**👥 Slot Pemain (${session.participants.length}/${session.maxSlots}):**\n` +
        `${participantList}`
    )
    .setFooter({
      text: isFull
        ? "⛔ Slot Penuh! Siap gas bermain!"
        : "Klik tombol di bawah untuk bergabung mabar!",
    })
    .setTimestamp();

  return embed;
}

module.exports = {
  createSession,
  getSession,
  joinSession,
  leaveSession,
  cancelSession,
  buildMabarEmbed,
  sessions,
};
