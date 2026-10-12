# Novatria-Bot Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul Novatria-Bot into a lightweight, high-performance Discord bot featuring Hermes VPS remote control, atomic bansos claim system (accounts & API keys) via SQLite, and community features (welcome, auto-role, reaction-roles).

**Architecture:** A modular event-and-service pattern using `discord.js` v14. Business logic is separated into `bansosService` (backed by synchronous ACID `better-sqlite3` transactions to eliminate claim race conditions) and `hermesService` (safely managing VPS daemon status and CLI execution). User interactions route through a centralized interaction dispatcher handling slash commands, ephemeral claim buttons, and role toggles.

**Tech Stack:** Node.js 20+, CommonJS, `discord.js` v14, `better-sqlite3`, `node:test` + `node:assert` for testing.

**Spec:** `docs/superpowers/specs/2026-10-12-novatria-bot-overhaul-spec.md`

## Global Constraints

- Runtime version: Node.js 20.x or higher.
- Storage: Single-file SQLite database located at `data/database.sqlite`.
- Security: All admin Hermes and Bansos commands restricted to configured `ADMIN_ROLE_IDS` and channels.
- Privacy: All claims (account credentials and API keys) MUST be delivered as ephemeral Discord responses to prevent leakages and hoarding.
- Testing: Automated tests run with Node's native test runner (`node --test`).

## Review Focus

1. Concurrent claims on the last remaining stock item: Ensure atomic SQLite transaction prevents two users from receiving the same account/API key.
2. User trying to claim repeatedly: Ensure cooldown / duplicate claim prevention correctly blocks multiple claims per drop.
3. Shell command timeout / malicious input in `/hermes cmd`: Ensure timeout kills long-running processes (10s limit) and returns stdout/stderr safely truncated to 1900 characters.
4. Non-admin trying to invoke `/hermes` or `/bansos`: Ensure command rejects execution before invoking system services.
5. Missing database directory: Ensure `data/` directory and SQLite tables auto-initialize if not already present.

---

### Task 1: Clean Legacy Dependencies and Setup Environment Config

**Files:**
- Modify: `package.json`
- Modify: `src/config.js`
- Delete: `google-apps-script.js`, `assets/sounds/`
- Test: `test/config.test.js`

**Interfaces:**
- Consumes: `process.env`
- Produces: `config` object with `token`, `clientId`, `guildId`, `adminChannelId`, `bansosLogChannelId`, `welcomeChannelId`, `defaultRoleId`, `roleBansosId`, `roleGamersId`, `adminRoleIds`, `hermesServiceName`.

- [ ] **Step 1: Write failing test for config loader**

```javascript
// test/config.test.js
const { test } = require('node:test');
const assert = require('node:assert');

test('config module loads required bot and community channel variables', () => {
  process.env.TOKEN = 'test_token';
  process.env.CLIENT_ID = 'test_client_id';
  process.env.ADMIN_CHANNEL_ID = '123456';
  process.env.ADMIN_ROLE_IDS = 'role1,role2';
  
  delete require.cache[require.resolve('../src/config')];
  const config = require('../src/config');
  
  assert.strictEqual(config.token, 'test_token');
  assert.strictEqual(config.clientId, 'test_client_id');
  assert.strictEqual(config.channels.admin, '123456');
  assert.deepStrictEqual(config.adminRoleIds, ['role1', 'role2']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/config.test.js`
Expected: FAIL due to missing properties in `src/config.js`.

- [ ] **Step 3: Update `package.json` and `src/config.js`**

Install `better-sqlite3` and remove unused packages (`@discordjs/voice`, `ffmpeg-static`, `libsodium-wrappers`). Refactor `src/config.js` to map new channels and roles cleanly.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/config.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json src/config.js test/config.test.js
git commit -m "chore: purge legacy dependencies and update configuration loader"
```

---

### Task 2: SQLite Schema & Atomic Bansos Service

**Files:**
- Create: `src/db.js`
- Create: `src/services/bansosService.js`
- Test: `test/bansosService.test.js`

**Interfaces:**
- Consumes: `better-sqlite3`
- Produces: `bansosService.addAccount(label, credentials)`, `bansosService.addApi(provider, apiKey)`, `bansosService.claimItem(userId, type)`, `bansosService.getStockSummary()`, `bansosService.hasUserClaimed(userId, type)`

- [ ] **Step 1: Write failing test for SQLite Bansos Service**

```javascript
// test/bansosService.test.js
const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const testDbPath = path.join(__dirname, 'test.sqlite');

test('BansosService adds inventory and claims item atomically', () => {
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  const db = require('../src/db')(testDbPath);
  const bansosService = require('../src/services/bansosService')(db);

  bansosService.addAccount('Canva Pro', 'user@test.com:password123');
  const stockBefore = bansosService.getStockSummary();
  assert.strictEqual(stockBefore.accounts.available, 1);

  const claimed = bansosService.claimItem('user_1', 'account');
  assert.ok(claimed);
  assert.strictEqual(claimed.item.credentials, 'user@test.com:password123');

  const stockAfter = bansosService.getStockSummary();
  assert.strictEqual(stockAfter.accounts.available, 0);
  assert.strictEqual(stockAfter.accounts.claimed, 1);

  // Prevent double claim
  assert.throws(() => {
    bansosService.claimItem('user_1', 'account');
  }, /sudah pernah mengklaim/i);

  db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/bansosService.test.js`
Expected: FAIL with module not found or function undefined.

- [ ] **Step 3: Implement `src/db.js` and `src/services/bansosService.js`**

Implement tables:
- `bansos_items (id INTEGER PRIMARY KEY, type TEXT, label TEXT, content TEXT, status TEXT, claimed_by TEXT, claimed_at DATETIME)`
- `bansos_claims (id INTEGER PRIMARY KEY, user_id TEXT, type TEXT, item_id INTEGER, claimed_at DATETIME)`
Wrap `claimItem` inside `db.transaction()` to ensure atomicity.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/bansosService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/db.js src/services/bansosService.js test/bansosService.test.js
git commit -m "feat: implement atomic bansos SQLite storage and service"
```

---

### Task 3: Hermes VPS Controller Service

**Files:**
- Create: `src/services/hermesService.js`
- Test: `test/hermesService.test.js`

**Interfaces:**
- Consumes: Node `node:child_process`, `node:os`
- Produces: `hermesService.getSystemStatus()`, `hermesService.executeCommand(cmd)`, `hermesService.restartService()`

- [ ] **Step 1: Write failing test for Hermes Service**

```javascript
// test/hermesService.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const hermesService = require('../src/services/hermesService');

test('hermesService returns system status object', async () => {
  const status = await hermesService.getSystemStatus();
  assert.ok(status.uptime >= 0);
  assert.ok(status.memoryUsage.totalMb > 0);
  assert.ok(typeof status.serviceActive === 'boolean');
});

test('hermesService executes safe shell command with timeout', async () => {
  const result = await hermesService.executeCommand('echo "Hello Hermes"');
  assert.strictEqual(result.stdout.trim(), 'Hello Hermes');
  assert.strictEqual(result.exitCode, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/hermesService.test.js`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `src/services/hermesService.js`**

Implement `getSystemStatus()` inspecting `os.totalmem()`, `os.freemem()`, `os.uptime()`, and running `systemctl is-active <service>`. Implement `executeCommand(cmd)` wrapping `exec` with a 10s timeout and output clipping.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/hermesService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/hermesService.js test/hermesService.test.js
git commit -m "feat: implement Hermes VPS monitoring and command service"
```

---

### Task 4: Slash Command Definitions & Admin Guard

**Files:**
- Create: `src/commands/definitions.js`
- Create: `src/utils/permissionGuard.js`
- Test: `test/permissionGuard.test.js`

**Interfaces:**
- Consumes: `discord.js` SlashCommandBuilder
- Produces: `commands` array containing `/hermes`, `/bansos`, and `/rolepanel`; `isAdmin(interaction)` check.

- [ ] **Step 1: Write failing test for permission guard**

```javascript
// test/permissionGuard.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { isAdmin } = require('../src/utils/permissionGuard');

test('isAdmin returns true for members with admin role or admin permissions', () => {
  const fakeMemberAdmin = {
    permissions: { has: (perm) => perm === 'Administrator' },
    roles: { cache: new Map() }
  };
  const fakeInteraction = { member: fakeMemberAdmin };
  assert.strictEqual(isAdmin(fakeInteraction, ['role_admin']), true);

  const fakeMemberUser = {
    permissions: { has: () => false },
    roles: { cache: new Map() }
  };
  assert.strictEqual(isAdmin({ member: fakeMemberUser }, ['role_admin']), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/permissionGuard.test.js`
Expected: FAIL with missing module.

- [ ] **Step 3: Implement `src/utils/permissionGuard.js` and `src/commands/definitions.js`**

Implement `/hermes` (subcommands: `status`, `cmd`, `restart`), `/bansos` (subcommands: `add`, `stock`, `drop`), and `/rolepanel` slash commands.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/permissionGuard.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/commands/definitions.js src/utils/permissionGuard.js test/permissionGuard.test.js
git commit -m "feat: define overhauled slash commands and permission guard"
```

---

### Task 5: Slash Command Handlers (`/hermes`, `/bansos`, `/rolepanel`)

**Files:**
- Create: `src/commands/hermes.js`
- Create: `src/commands/bansos.js`
- Create: `src/commands/rolepanel.js`
- Test: Manual / Unit integration tests

**Interfaces:**
- Consumes: `hermesService`, `bansosService`, `permissionGuard`
- Produces: Command execution handlers responding with Discord embed cards and ActionRow buttons.

- [ ] **Step 1: Implement `/hermes` command handler**
Handle `/hermes status`, `/hermes cmd <command>`, and `/hermes restart` with permission validation against `config.adminRoleIds` and channel checks.

- [ ] **Step 2: Implement `/bansos` command handler**
Handle `/bansos add account`, `/bansos add api`, `/bansos stock`, and `/bansos drop` (which posts interactive panels with Claim buttons).

- [ ] **Step 3: Implement `/rolepanel` command handler**
Sends a stylish embed to `#ambil-role` containing buttons for `[🎮 Gamer / Mabar]` and `[🎁 Bansos Hunter]`.

- [ ] **Step 4: Verify syntax and linting**
Run: `node -c src/commands/hermes.js src/commands/bansos.js src/commands/rolepanel.js`
Expected: Syntax check passes without error.

- [ ] **Step 5: Commit**

```bash
git add src/commands/hermes.js src/commands/bansos.js src/commands/rolepanel.js
git commit -m "feat: implement handlers for /hermes, /bansos, and /rolepanel"
```

---

### Task 6: Button Interaction Handlers (Claims & Self-Roles)

**Files:**
- Create: `src/buttons/claimAccount.js`
- Create: `src/buttons/claimApi.js`
- Create: `src/buttons/toggleRole.js`
- Modify: `src/handlers/interactionCreate.js`

**Interfaces:**
- Consumes: Button clicks (`interaction.customId`)
- Produces: Ephemeral claim delivery, database update, and role grant/removal.

- [ ] **Step 1: Implement `claimAccount.js` and `claimApi.js`**
When user clicks `btn_claim_account` or `btn_claim_api`:
1. Call `bansosService.claimItem(userId, type)`.
2. Reply **Ephemerally** with credentials and safety guidelines.
3. Post log notification to `#bansos-manage` or admin log.

- [ ] **Step 2: Implement `toggleRole.js`**
When user clicks `btn_role_bansos` or `btn_role_gamers`:
Toggle the role on `interaction.member.roles` and reply ephemerally confirming the role state.

- [ ] **Step 3: Wire buttons into `src/handlers/interactionCreate.js`**
Route `interaction.isButton()` to the appropriate button handler.

- [ ] **Step 4: Verify syntax**
Run: `node -c src/buttons/*.js src/handlers/interactionCreate.js`
Expected: Pass without error.

- [ ] **Step 5: Commit**

```bash
git add src/buttons/ src/handlers/interactionCreate.js
git commit -m "feat: implement interactive button handlers for bansos claims and roles"
```

---

### Task 7: Welcome System, Clean Up Legacy Code & Main Bootstrapping

**Files:**
- Create: `src/events/guildMemberAdd.js`
- Modify: `index.js`
- Delete: Legacy command files in `src/commands/` (`catat.js`, `ctf.js`, `jadwal.js`, etc.)
- Delete: Legacy utility files (`ctftimeApi.js`, `interrupterService.js`, etc.)
- Test: Full integration test `test/integration.test.js`

**Interfaces:**
- Consumes: Discord Client events (`clientReady`, `guildMemberAdd`, `interactionCreate`)
- Produces: Operational, lean bot.

- [ ] **Step 1: Implement `src/events/guildMemberAdd.js`**
Sends welcome embed with user avatar, server rules summary to `config.channels.welcome`, and automatically adds `config.roles.defaultMember`.

- [ ] **Step 2: Purge all remaining legacy files**
Remove `src/commands/{catat,todo,done,link,jadwal,mabar,arsip,ctf,ctfcek,ctfevent,ctfnotify,tantangan,writeup,progress,interrupter}.js` and legacy utils.

- [ ] **Step 3: Update `index.js`**
Initialize SQLite DB, register slash commands cleanly, bind `guildMemberAdd` and `interactionCreate` events.

- [ ] **Step 4: Run all automated tests**
Run: `node --test`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: complete overhaul of Novatria-Bot with welcome system and clean bootstrap"
```
