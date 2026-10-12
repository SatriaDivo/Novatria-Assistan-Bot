const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const testDbPath = path.join(__dirname, "test-history.sqlite");

test("bansosService queries claim history with filters", () => {
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  const db = require("../src/db")(testDbPath);
  const bansosService = require("../src/services/bansosService")(db);

  bansosService.addAccount("Netflix 4K", "user@netflix.com:pass");
  bansosService.addApi("OpenAI", "sk-proj-testkey");

  bansosService.claimItem("user_audit_1", "account");
  bansosService.claimItem("user_audit_2", "api");

  // 1. Query by userId
  const userHistory = bansosService.getClaimHistory({ userId: "user_audit_1" });
  assert.strictEqual(userHistory.length, 1);
  assert.strictEqual(userHistory[0].user_id, "user_audit_1");
  assert.strictEqual(userHistory[0].label, "Netflix 4K");

  // 2. Query all with limit
  const allHistory = bansosService.getClaimHistory({ limit: 10 });
  assert.strictEqual(allHistory.length, 2);

  // 3. Query non-existent user
  const emptyHistory = bansosService.getClaimHistory({ userId: "user_non_existent" });
  assert.strictEqual(emptyHistory.length, 0);

  db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});
