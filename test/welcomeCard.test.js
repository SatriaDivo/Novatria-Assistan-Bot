const { test } = require("node:test");
const assert = require("node:assert");
const { generateWelcomeCard } = require("../src/utils/welcomeCard");

test("generateWelcomeCard returns a valid PNG image buffer", async () => {
  const fakeMember = {
    user: {
      username: "TesterUser",
      displayAvatarURL: () => "invalid_url_to_trigger_fallback",
    },
    guild: {
      name: "Novatria Server",
      memberCount: 150,
    },
  };

  const buffer = await generateWelcomeCard(fakeMember);
  assert.ok(Buffer.isBuffer(buffer), "Expected a Buffer");
  assert.ok(buffer.length > 1000, "Buffer size should be realistic for PNG");
  // Check PNG magic bytes: 89 50 4E 47
  assert.strictEqual(buffer[0], 0x89);
  assert.strictEqual(buffer[1], 0x50);
  assert.strictEqual(buffer[2], 0x4e);
  assert.strictEqual(buffer[3], 0x47);
});
