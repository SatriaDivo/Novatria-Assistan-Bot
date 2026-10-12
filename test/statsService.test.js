const { test } = require("node:test");
const assert = require("node:assert");
const { updateMemberStats, lastRenameTimeMap } = require("../src/services/statsService");

test("updateMemberStats updates channel name when count changes", async () => {
  let newName = "";
  const fakeChannel = {
    id: "channel_stats_1",
    name: "👥 Total Member: 100",
    setName: async (val) => {
      newName = val;
      fakeChannel.name = val;
    },
  };

  const fakeGuild = {
    name: "Novatria Server",
    memberCount: 105,
    channels: {
      cache: new Map([["channel_stats_1", fakeChannel]]),
    },
  };

  lastRenameTimeMap.clear();

  const success = await updateMemberStats(fakeGuild, "channel_stats_1");
  assert.strictEqual(success, true);
  assert.strictEqual(newName, "👥 Total Member: 105");

  // Immediate second call should be blocked by cooldown
  fakeGuild.memberCount = 106;
  const cooldownBlocked = await updateMemberStats(fakeGuild, "channel_stats_1");
  assert.strictEqual(cooldownBlocked, false);
});
