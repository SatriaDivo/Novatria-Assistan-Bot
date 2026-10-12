const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const testDbPath = path.join(__dirname, "test-integration.sqlite");

test("Full interaction pipeline handles command and buttons correctly", async () => {
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

  const initDb = require("../src/db");
  const createBansos = require("../src/services/bansosService");
  const createInteractionHandler = require("../src/handlers/interactionCreate");

  const db = initDb(testDbPath);
  const bansos = createBansos(db);
  const handler = createInteractionHandler(bansos);

  // 1. Add account to inventory
  bansos.addAccount("Canva Pro", "canva@user.com:secretPass");

  // 2. Simulate User clicking "btn_claim_account"
  let repliedEmbed = null;
  let isEphemeral = false;

  const fakeClaimInteraction = {
    isChatInputCommand: () => false,
    isButton: () => true,
    customId: "btn_claim_account",
    user: { id: "discord_user_123", tag: "tester#0001" },
    guild: {
      channels: {
        cache: new Map(),
      },
    },
    reply: async (options) => {
      repliedEmbed = options.embeds?.[0];
      isEphemeral = options.ephemeral;
    },
  };

  await handler(fakeClaimInteraction);

  assert.ok(repliedEmbed, "Expected an embed reply upon claim");
  assert.strictEqual(isEphemeral, true, "Claim response must be ephemeral");
  assert.ok(
    repliedEmbed.data.description.includes("Canva Pro"),
    "Embed must state the account label"
  );

  // 3. Simulate Same User trying to claim again
  let errorReplyContent = "";
  const fakeRepeatClaimInteraction = {
    isChatInputCommand: () => false,
    isButton: () => true,
    customId: "btn_claim_account",
    user: { id: "discord_user_123", tag: "tester#0001" },
    reply: async (options) => {
      errorReplyContent = options.content;
    },
  };

  await handler(fakeRepeatClaimInteraction);
  assert.ok(
    errorReplyContent.includes("sudah pernah mengklaim"),
    "Must reject duplicate claims"
  );

  db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});
