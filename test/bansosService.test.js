const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const testDbPath = path.join(__dirname, "test.sqlite");

test("BansosService adds inventory and claims item atomically", () => {
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  const db = require("../src/db")(testDbPath);
  const bansosService = require("../src/services/bansosService")(db);

  // 1. Add account
  bansosService.addAccount("Canva Pro", "user@test.com:password123");
  const stockBefore = bansosService.getStockSummary();
  assert.strictEqual(stockBefore.accounts.available, 1);
  assert.strictEqual(stockBefore.accounts.claimed, 0);

  // 2. Add API key
  bansosService.addApi("OpenAI", "sk-proj-1234567890");
  const stockApiBefore = bansosService.getStockSummary();
  assert.strictEqual(stockApiBefore.apis.available, 1);
  assert.strictEqual(stockApiBefore.apis.claimed, 0);

  // 3. Claim account
  const claimed = bansosService.claimItem("user_1", "account");
  assert.ok(claimed);
  assert.strictEqual(claimed.label, "Canva Pro");
  assert.strictEqual(claimed.content, "user@test.com:password123");

  const stockAfter = bansosService.getStockSummary();
  assert.strictEqual(stockAfter.accounts.available, 0);
  assert.strictEqual(stockAfter.accounts.claimed, 1);

  // 4. Prevent duplicate claim from the same user
  assert.throws(() => {
    bansosService.claimItem("user_1", "account");
  }, /sudah pernah mengklaim/i);

  // 5. User_2 tries to claim account when stock is empty
  assert.throws(() => {
    bansosService.claimItem("user_2", "account");
  }, /stok.*habis/i);

  // 6. User_1 claims API key (allowed since it is a different type)
  const claimedApi = bansosService.claimItem("user_1", "api");
  assert.ok(claimedApi);
  assert.strictEqual(claimedApi.label, "OpenAI");
  assert.strictEqual(claimedApi.content, "sk-proj-1234567890");

  db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});
