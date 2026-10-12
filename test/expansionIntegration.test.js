const { test } = require("node:test");
const assert = require("node:assert");
const commands = require("../src/commands/definitions");

test("commands definitions include mabar, ticket, hermes, bansos, rolepanel, and stats", () => {
  const commandNames = commands.map((c) => c.name);
  assert.ok(commandNames.includes("mabar"), "Should have /mabar command");
  assert.ok(commandNames.includes("ticket"), "Should have /ticket command");
  assert.ok(commandNames.includes("hermes"), "Should have /hermes command");
  assert.ok(commandNames.includes("bansos"), "Should have /bansos command");
  assert.ok(commandNames.includes("rolepanel"), "Should have /rolepanel command");
  assert.ok(commandNames.includes("stats"), "Should have /stats command");
});
