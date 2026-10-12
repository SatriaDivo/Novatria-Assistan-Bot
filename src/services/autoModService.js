const config = require("../config");

const PHISHING_REGEX =
  /(discorcl|dlscord|disord|discocrd|discord-nitro|nitro-discord|steam-gift|free-nitro|discordgift)[a-z0-9\-_\.]*/i;
const NITRO_PROMO_REGEX = /free\s*(nitro|steam\s*gift)/i;
const DISCORD_INVITE_REGEX =
  /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-z0-9]+/i;

function isMemberAdmin(member) {
  if (!member) return false;

  const permissions = member.permissions;
  if (
    permissions?.has?.("Administrator") ||
    permissions?.has?.("ManageGuild") ||
    permissions?.has?.("ManageMessages")
  ) {
    return true;
  }

  const adminRoles = config.adminRoleIds || [];
  if (adminRoles.length > 0 && member.roles?.cache) {
    return adminRoles.some((roleId) => member.roles.cache.has(roleId));
  }

  return false;
}

function scanMessage(content, member) {
  if (!content) return { flagged: false, reason: null };

  // Admin dan staf bebas dari filter
  if (isMemberAdmin(member)) {
    return { flagged: false, reason: null };
  }

  const text = content.toLowerCase();

  // 1. Cek Unauthorized Mass Mention
  if (text.includes("@everyone") || text.includes("@here")) {
    return {
      flagged: true,
      reason: "Spam Mention Massal (@everyone / @here)",
    };
  }

  // 2. Cek Indikasi Link Phishing & Fake Nitro
  if (PHISHING_REGEX.test(text) || NITRO_PROMO_REGEX.test(text)) {
    return {
      flagged: true,
      reason: "Indikasi Link Phishing / Scam / Fake Nitro",
    };
  }

  // 3. Cek Invite Server Lain
  if (DISCORD_INVITE_REGEX.test(text)) {
    return {
      flagged: true,
      reason: "Promosi / Link Invite Server Lain",
    };
  }

  return { flagged: false, reason: null };
}

module.exports = {
  scanMessage,
  isMemberAdmin,
};
