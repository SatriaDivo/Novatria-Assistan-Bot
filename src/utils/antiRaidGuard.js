const config = require("../config");

function isAccountOldEnough(user, minDays) {
  const requiredDays =
    typeof minDays === "number" ? minDays : config.minAccountAgeDays || 3;
  const createdTimestamp = user?.createdTimestamp || 0;
  const now = Date.now();
  const ageMs = now - createdTimestamp;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  return {
    allowed: ageDays >= requiredDays,
    ageDays: Math.floor(ageDays),
    requiredDays,
  };
}

module.exports = { isAccountOldEnough };
