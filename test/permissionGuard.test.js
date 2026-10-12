const { test } = require("node:test");
const assert = require("node:assert");
const { isAdmin } = require("../src/utils/permissionGuard");

test("isAdmin returns true for members with Administrator permission", () => {
  const interaction = {
    member: {
      permissions: { has: (perm) => perm === "Administrator" },
      roles: { cache: new Map() },
    },
  };
  assert.strictEqual(isAdmin(interaction, ["123"]), true);
});

test("isAdmin returns true for members having configured admin role", () => {
  const rolesMap = new Map();
  rolesMap.set("999", { id: "999" });

  const interaction = {
    member: {
      permissions: { has: () => false },
      roles: { cache: rolesMap },
    },
  };
  assert.strictEqual(isAdmin(interaction, ["999"]), true);
});

test("isAdmin returns false for standard members", () => {
  const interaction = {
    member: {
      permissions: { has: () => false },
      roles: { cache: new Map() },
    },
  };
  assert.strictEqual(isAdmin(interaction, ["999"]), false);
});
