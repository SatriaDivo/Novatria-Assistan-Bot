const { test } = require("node:test");
const assert = require("node:assert");
const { setPersona, getCurrentPersona, PERSONAS } = require("../src/services/hermesChatService");

test("hermesChatService switches persona and updates system prompt", () => {
  assert.ok(PERSONAS.unrestricted);
  assert.ok(PERSONAS.coder);
  assert.ok(PERSONAS.cybersec);
  assert.ok(PERSONAS.researcher);

  setPersona("coder");
  assert.strictEqual(getCurrentPersona().key, "coder");

  setPersona("cybersec");
  assert.strictEqual(getCurrentPersona().key, "cybersec");

  setPersona("unrestricted");
  assert.strictEqual(getCurrentPersona().key, "unrestricted");

  // Invalid persona should fallback safely to unrestricted
  setPersona("invalid_persona_name");
  assert.strictEqual(getCurrentPersona().key, "unrestricted");
});
