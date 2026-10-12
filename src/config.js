require("dotenv").config({ quiet: true });

module.exports = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || "",
  hermesServiceName: process.env.HERMES_SERVICE_NAME || "hermes",
  minAccountAgeDays: parseInt(process.env.MIN_ACCOUNT_AGE_DAYS || "3", 10),
  adminRoleIds: (process.env.ADMIN_ROLE_IDS || "")
    .split(",")
    .map((roleId) => roleId.trim())
    .filter(Boolean),
  channels: {
    admin: process.env.ADMIN_CHANNEL_ID,
    bansosLog: process.env.BANSOS_LOG_CHANNEL_ID,
    welcome: process.env.WELCOME_CHANNEL_ID,
    bansos: process.env.BANSOS_CHANNEL_ID,
    bansosFeed: process.env.BANSOS_FEED_CHANNEL_ID,
    statsMember: process.env.STATS_MEMBER_CHANNEL_ID,
  },
  roles: {
    defaultMember: process.env.DEFAULT_ROLE_ID,
    bansosHunter: process.env.ROLE_BANSOS_ID,
    gamers: process.env.ROLE_GAMERS_ID,
  },
};
