const { test } = require("node:test");
const assert = require("node:assert");

test("config module loads required bot, channels, and role variables", () => {
  process.env.TOKEN = "test_token";
  process.env.CLIENT_ID = "test_client_id";
  process.env.GUILD_ID = "test_guild_id";
  process.env.ADMIN_CHANNEL_ID = "123456";
  process.env.BANSOS_LOG_CHANNEL_ID = "234567";
  process.env.WELCOME_CHANNEL_ID = "345678";
  process.env.BANSOS_CHANNEL_ID = "456789";
  process.env.DEFAULT_ROLE_ID = "567890";
  process.env.ROLE_BANSOS_ID = "678901";
  process.env.ROLE_GAMERS_ID = "789012";
  process.env.ADMIN_ROLE_IDS = "role1, role2";
  process.env.HERMES_SERVICE_NAME = "hermes";

  delete require.cache[require.resolve("../src/config")];
  const config = require("../src/config");

  assert.strictEqual(config.token, "test_token");
  assert.strictEqual(config.clientId, "test_client_id");
  assert.strictEqual(config.guildId, "test_guild_id");
  assert.strictEqual(config.channels.admin, "123456");
  assert.strictEqual(config.channels.bansosLog, "234567");
  assert.strictEqual(config.channels.welcome, "345678");
  assert.strictEqual(config.channels.bansos, "456789");
  assert.strictEqual(config.roles.defaultMember, "567890");
  assert.strictEqual(config.roles.bansosHunter, "678901");
  assert.strictEqual(config.roles.gamers, "789012");
  assert.deepStrictEqual(config.adminRoleIds, ["role1", "role2"]);
  assert.strictEqual(config.hermesServiceName, "hermes");
});
