# Security, Backup, Audit, and Persona Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 4 advanced operational features: Auto-Moderation anti-scam/phishing, SQLite database backup to Discord channel, Bansos audit history command (`/bansos history`), and dynamic Hermes AI persona switching (`/hermes mode`).

**Architecture:** Pure service-driven design. `autoModService` handles regex pattern checking on messages before broadcast. `backupService` archives `data/database.sqlite` into Discord attachments on schedule and via command. `bansosService` expands to include historical queries. `hermesChatService` exposes dynamic persona management.

**Tech Stack:** Node.js 20+, `discord.js` v14, `better-sqlite3`, `node:test` + `node:assert`.

**Spec:** `docs/superpowers/specs/2026-10-12-security-backup-persona-spec.md`

## Global Constraints

- Auto-moderation must NEVER intercept or delete messages from server administrators or bots.
- Database backup must not lock or corrupt the active SQLite database during upload.
- Audit history must redact full credentials unless queried by an authorized admin.
- Persona switches must apply immediately to subsequent `/hermes-chat` messages.

## Review Focus

1. Phishing variations with obfuscation (e.g. `discorcl-gift`, `dlscord.gg`): Ensure regex flags them as scams.
2. Legitimate links (e.g. github.com, google.com): Ensure normal links are NOT falsely flagged as scams.
3. Empty database backup: Ensure backup handles missing database file gracefully without crashing.
4. History search with zero results: Ensure `/bansos history` replies with a friendly "Data tidak ditemukan" message.
5. Invalid persona name: Ensure switching to an undefined persona defaults safely to `unrestricted`.

---

### Task 1: Auto-Moderation Anti-Scam Filter

**Files:**
- Create: `src/services/autoModService.js`
- Test: `test/autoModService.test.js`

**Interfaces:**
- Consumes: Message content, Member permissions
- Produces: `autoModService.scanMessage(content, member): { flagged: boolean, reason: string | null }`

- [ ] **Step 1: Write failing test for Auto-Mod service**

```javascript
// test/autoModService.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const autoModService = require('../src/services/autoModService');

test('autoModService detects fake nitro, invite links, and unauthorized mass mentions', () => {
  const fakeMember = { permissions: { has: () => false }, roles: { cache: new Map() } };

  assert.strictEqual(autoModService.scanMessage('Free discord nitro at discorcl-app.com', fakeMember).flagged, true);
  assert.strictEqual(autoModService.scanMessage('Join server saya discord.gg/12345', fakeMember).flagged, true);
  assert.strictEqual(autoModService.scanMessage('@everyone halo', fakeMember).flagged, true);
  assert.strictEqual(autoModService.scanMessage('Halo bro lagi ngapain?', fakeMember).flagged, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/autoModService.test.js`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `src/services/autoModService.js`**

Implement `scanMessage` with pattern matching for phishing links, unauthorized discord invites, and mass mentions. Admins always bypass.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/autoModService.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/autoModService.js test/autoModService.test.js
git commit -m "feat: implement auto-moderation anti-scam and phishing filter"
```

---

### Task 2: SQLite Database Backup Service

**Files:**
- Create: `src/services/backupService.js`
- Test: `test/backupService.test.js`

**Interfaces:**
- Consumes: Database path, Discord client/channel
- Produces: `backupService.createBackupAttachment(dbPath): AttachmentBuilder`, `backupService.sendBackup(channel): Promise<boolean>`

- [ ] **Step 1: Write failing test for Backup service**

```javascript
// test/backupService.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const backupService = require('../src/services/backupService');

test('backupService generates attachment with valid filename and data', () => {
  const dummyPath = path.join(__dirname, 'dummy.sqlite');
  fs.writeFileSync(dummyPath, 'SQLITE DUMMY CONTENT');

  const attachment = backupService.createBackupAttachment(dummyPath);
  assert.ok(attachment.name.startsWith('backup-novatria-'));
  assert.ok(attachment.name.endsWith('.sqlite'));

  fs.unlinkSync(dummyPath);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/backupService.test.js`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `src/services/backupService.js`**

Implement `createBackupAttachment` and `sendBackup` which posts the database snapshot to `config.channels.bansosLog` along with stats.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/backupService.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/backupService.js test/backupService.test.js
git commit -m "feat: implement SQLite database backup service"
```

---

### Task 3: Bansos Audit History Query & Command

**Files:**
- Modify: `src/services/bansosService.js`
- Modify: `src/commands/bansos.js`
- Test: `test/bansosHistory.test.js`

**Interfaces:**
- Consumes: SQLite Database
- Produces: `bansosService.getClaimHistory({ userId, label, limit }): Array<ClaimRecord>`

- [ ] **Step 1: Write failing test for Bansos history query**

```javascript
// test/bansosHistory.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const testDbPath = path.join(__dirname, 'test-history.sqlite');

test('bansosService queries claim history with filters', () => {
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  const db = require('../src/db')(testDbPath);
  const bansosService = require('../src/services/bansosService')(db);

  bansosService.addAccount('Netflix 4K', 'user@netflix.com:pass');
  bansosService.claimItem('user_audit_1', 'account');

  const history = bansosService.getClaimHistory({ userId: 'user_audit_1' });
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].user_id, 'user_audit_1');
  assert.strictEqual(history[0].label, 'Netflix 4K');

  db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/bansosHistory.test.js`
Expected: FAIL with `getClaimHistory is not a function`.

- [ ] **Step 3: Implement `getClaimHistory` in `bansosService.js` and add `/bansos history` handler in `bansos.js`**

Add join query between `bansos_claims` and `bansos_items`. Add subcommand `history` in `src/commands/bansos.js`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/bansosHistory.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/bansosService.js src/commands/bansos.js test/bansosHistory.test.js
git commit -m "feat: implement bansos claim audit history service and command"
```

---

### Task 4: Dynamic Hermes AI Persona Modes

**Files:**
- Modify: `src/services/hermesChatService.js`
- Modify: `src/commands/hermes.js`
- Test: `test/hermesPersona.test.js`

**Interfaces:**
- Consumes: Persona key string
- Produces: `hermesChatService.setPersona(modeKey)`, `hermesChatService.getCurrentPersona(): { key, name, description }`

- [ ] **Step 1: Write failing test for Hermes Persona switcher**

```javascript
// test/hermesPersona.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { setPersona, getCurrentPersona } = require('../src/services/hermesChatService');

test('hermesChatService switches persona and updates system prompt', () => {
  setPersona('coder');
  assert.strictEqual(getCurrentPersona().key, 'coder');

  setPersona('cybersec');
  assert.strictEqual(getCurrentPersona().key, 'cybersec');

  setPersona('unrestricted');
  assert.strictEqual(getCurrentPersona().key, 'unrestricted');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/hermesPersona.test.js`
Expected: FAIL with missing functions.

- [ ] **Step 3: Implement persona definitions and switching in `src/services/hermesChatService.js` and `src/commands/hermes.js`**

Implement personas: `unrestricted`, `coder`, `cybersec`, `researcher`. Add subcommand `mode` to `/hermes`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/hermesPersona.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/hermesChatService.js src/commands/hermes.js test/hermesPersona.test.js
git commit -m "feat: implement dynamic Hermes AI persona modes"
```

---

### Task 5: Main Dispatcher Integration, Scheduler & Documentation

**Files:**
- Modify: `src/commands/definitions.js`
- Modify: `index.js`
- Modify: `README.md`
- Test: `npm test`

**Interfaces:**
- Consumes: All services
- Produces: Auto-moderation event hook in `messageCreate`, 24h backup scheduler in `ready`, new slash subcommands.

- [ ] **Step 1: Update `src/commands/definitions.js` with `/bansos history`, `/hermes backup`, and `/hermes mode`**

- [ ] **Step 2: Wire Auto-Mod and 24h Backup Scheduler in `index.js`**

In `messageCreate`: run `autoModService.scanMessage()`. In `ready`: start `setInterval` every 24h calling `backupService.sendBackup()`.

- [ ] **Step 3: Update `README.md` documentation**

- [ ] **Step 4: Run full test suite**

Run: `npm test`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/commands/definitions.js index.js README.md
git commit -m "feat: wire auto-mod filter, backup scheduler, and update documentation"
```
