const { updateMemberStats } = require("../services/statsService");

async function handleGuildMemberRemove(member) {
  try {
    await updateMemberStats(member.guild);
  } catch (error) {
    console.error("Error pada event guildMemberRemove:", error);
  }
}

module.exports = handleGuildMemberRemove;
