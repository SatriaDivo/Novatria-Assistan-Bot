const { test } = require("node:test");
const assert = require("node:assert");
const { isAccountOldEnough } = require("../src/utils/antiRaidGuard");

test("isAccountOldEnough allows accounts older than min days and rejects newer ones", () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const oldUser = { createdTimestamp: now - 5 * dayMs };
  const freshUser = { createdTimestamp: now - 1 * dayMs };

  assert.strictEqual(isAccountOldEnough(oldUser, 3).allowed, true);
  assert.strictEqual(isAccountOldEnough(freshUser, 3).allowed, false);
});
