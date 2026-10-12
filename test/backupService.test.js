const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const backupService = require("../src/services/backupService");

test("backupService generates attachment with valid filename and data", () => {
  const dummyPath = path.join(__dirname, "dummy.sqlite");
  fs.writeFileSync(dummyPath, "SQLITE DUMMY CONTENT");

  const attachment = backupService.createBackupAttachment(dummyPath);
  assert.ok(attachment.name.startsWith("backup-novatria-"));
  assert.ok(attachment.name.endsWith(".sqlite"));

  fs.unlinkSync(dummyPath);
});

test("backupService returns null if database file does not exist", () => {
  const attachment = backupService.createBackupAttachment("non_existent_file.sqlite");
  assert.strictEqual(attachment, null);
});
