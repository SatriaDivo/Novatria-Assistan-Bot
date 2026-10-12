const { test } = require("node:test");
const assert = require("node:assert");
const autoModService = require("../src/services/autoModService");

test("autoModService detects fake nitro, invite links, and unauthorized mass mentions", () => {
  const fakeMember = {
    permissions: { has: () => false },
    roles: { cache: new Map() },
  };

  // 1. Phishing / Fake Nitro
  assert.strictEqual(
    autoModService.scanMessage("Free discord nitro at discorcl-app.com", fakeMember).flagged,
    true
  );
  assert.strictEqual(
    autoModService.scanMessage("Claim free steam gift http://steam-gift-card.ru", fakeMember).flagged,
    true
  );

  // 2. Unauthorized Discord Invite
  assert.strictEqual(
    autoModService.scanMessage("Join server saya discord.gg/abcde", fakeMember).flagged,
    true
  );
  assert.strictEqual(
    autoModService.scanMessage("Link: https://discord.com/invite/xyz", fakeMember).flagged,
    true
  );

  // 3. Unauthorized Mass Mention
  assert.strictEqual(
    autoModService.scanMessage("@everyone ada info penting", fakeMember).flagged,
    true
  );
  assert.strictEqual(
    autoModService.scanMessage("Halo @here semua", fakeMember).flagged,
    true
  );

  // 4. Clean standard message
  assert.strictEqual(
    autoModService.scanMessage("Halo bro lagi ngapain?", fakeMember).flagged,
    false
  );
  assert.strictEqual(
    autoModService.scanMessage("Cek repo saya https://github.com/my-project", fakeMember).flagged,
    false
  );
});

test("autoModService bypasses administrators", () => {
  const adminMember = {
    permissions: { has: (perm) => perm === "Administrator" },
    roles: { cache: new Map() },
  };

  assert.strictEqual(
    autoModService.scanMessage("discord.gg/abc @everyone", adminMember).flagged,
    false
  );
});
