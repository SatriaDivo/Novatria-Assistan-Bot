const { test } = require("node:test");
const assert = require("node:assert");
const mabarService = require("../src/services/mabarService");

test("mabarService manages party slots and participants", () => {
  const session = mabarService.createSession(
    "msg_1",
    "user_host",
    "Valorant",
    5,
    "Ranked gas",
    "20:00"
  );
  assert.strictEqual(session.participants.length, 1);
  assert.strictEqual(session.maxSlots, 5);
  assert.strictEqual(session.hostId, "user_host");

  // User 2 joins
  const joined = mabarService.joinSession("msg_1", "user_player2");
  assert.strictEqual(joined.participants.length, 2);

  // User 2 tries to join again
  assert.throws(() => {
    mabarService.joinSession("msg_1", "user_player2");
  }, /sudah bergabung/i);

  // User 2 leaves
  const left = mabarService.leaveSession("msg_1", "user_player2");
  assert.strictEqual(left.participants.length, 1);

  // Host leaves -> throws (Host cannot leave, only cancel)
  assert.throws(() => {
    mabarService.leaveSession("msg_1", "user_host");
  }, /host tidak bisa keluar/i);
});
