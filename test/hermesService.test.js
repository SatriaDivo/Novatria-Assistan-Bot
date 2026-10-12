const { test } = require("node:test");
const assert = require("node:assert");
const hermesService = require("../src/services/hermesService");

test("hermesService returns system status object", async () => {
  const status = await hermesService.getSystemStatus();
  assert.ok(status.uptime >= 0);
  assert.ok(status.memoryUsage.totalMb > 0);
  assert.ok(status.memoryUsage.freeMb >= 0);
  assert.ok(typeof status.serviceActive === "boolean");
});

test("hermesService executes safe shell command with timeout and returns output", async () => {
  const result = await hermesService.executeCommand('node -e "console.log(\'Hello Hermes\')"');
  assert.strictEqual(result.stdout.trim(), "Hello Hermes");
  assert.strictEqual(result.exitCode, 0);
});

test("hermesService truncates output exceeding 1900 chars", async () => {
  const result = await hermesService.executeCommand('node -e "console.log(\'a\'.repeat(3000))"');
  assert.ok(result.stdout.length <= 1950);
  assert.ok(result.stdout.includes("... (output dipotong)"));
});
