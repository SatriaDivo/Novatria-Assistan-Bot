# Novatria-Bot Expansion Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 4 vital community extensions: Anti-Raid account age check for bansos claims, Interactive Mabar party coordinator (`/mabar`), In-house private support ticket system (`/ticket`), and automated `@Bansos Hunter` feed broadcast.

**Architecture:** Services and utility guards decoupled from Discord events. Anti-raid guard checks `user.createdAt` before SQLite transactions. Mabar state tracks participants via SQLite/memory with live embed edits. Ticket system handles dynamic private channel creation with scoped permission overwrites.

**Tech Stack:** Node.js 20+, `discord.js` v14, `better-sqlite3`, `node:test` + `node:assert`.

**Spec:** `docs/superpowers/specs/2026-10-12-expansion-features-spec.md`

## Global Constraints

- Discord rate-limits respected for channel creation and embed edits.
- Ephemeral delivery strictly preserved for all private/sensitive operations.
- All admin commands (`/ticket panel`, `/bansos drop`) guarded by `isAdmin(interaction)`.
- Zero new third-party npm packages; build entirely on existing `discord.js` and `better-sqlite3`.

## Review Focus

1. Account age verification: Ensure users created under `MIN_ACCOUNT_AGE_DAYS` are rejected before any database claim transaction.
2. Concurrent mabar joining: Ensure joining when slot is full (e.g. 5/5) rejects additional users gracefully.
3. Duplicate ticket creation: Ensure a user cannot spawn multiple ticket channels simultaneously.
4. Ticket channel deletion safety: Ensure ticket close button validates guild channel existence and deletes cleanly without throwing uncaught errors.
5. Missing roles/channels: Ensure missing `@Gamers` or `@Bansos Hunter` roles don't crash command executions, gracefully skipping mentions.

---

### Task 1: Anti-Raid Account Age Guard & Bansos Drop Ping

**Files:**
- Create: `src/utils/antiRaidGuard.js`
- Modify: `src/buttons/claimAccount.js`
- Modify: `src/buttons/claimApi.js`
- Modify: `src/commands/bansos.js`
- Modify: `src/config.js`
- Test: `test/antiRaidGuard.test.js`

**Interfaces:**
- Consumes: `user.createdTimestamp`, `config.minAccountAgeDays`
- Produces: `isAccountOldEnough(user, minDays): { allowed: boolean, ageDays: number, requiredDays: number }`

- [ ] **Step 1: Write failing test for anti-raid guard**

```javascript
// test/antiRaidGuard.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { isAccountOldEnough } = require('../src/utils/antiRaidGuard');

test('isAccountOldEnough allows accounts older than min days and rejects newer ones', () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const oldUser = { createdTimestamp: now - (5 * dayMs) };
  const freshUser = { createdTimestamp: now - (1 * dayMs) };

  assert.strictEqual(isAccountOldEnough(oldUser, 3).allowed, true);
  assert.strictEqual(isAccountOldEnough(freshUser, 3).allowed, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/antiRaidGuard.test.js`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `src/utils/antiRaidGuard.js` and integrate into claim buttons & bansos drop**

Implement `isAccountOldEnough`. Wire into `claimAccount.js` and `claimApi.js` before executing `bansosService.claimItem()`. Update `src/commands/bansos.js` to broadcast announcement ping to `config.channels.bansosFeed` if configured.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/antiRaidGuard.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/antiRaidGuard.js src/buttons/claimAccount.js src/buttons/claimApi.js src/commands/bansos.js src/config.js test/antiRaidGuard.test.js
git commit -m "feat: implement anti-raid account age guard and bansos drop feed ping"
```

---

### Task 2: Interactive Mabar Coordinator Service & Command

**Files:**
- Create: `src/services/mabarService.js`
- Create: `src/commands/mabar.js`
- Create: `src/buttons/mabarButtons.js`
- Test: `test/mabarService.test.js`

**Interfaces:**
- Consumes: User ID, Party slot configurations
- Produces: `mabarService.createSession(hostId, game, maxSlots, note, time)`, `mabarService.joinSession(messageId, userId)`, `mabarService.leaveSession(messageId, userId)`

- [ ] **Step 1: Write failing test for mabar service**

```javascript
// test/mabarService.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const mabarService = require('../src/services/mabarService');

test('mabarService manages party slots and participants', () => {
  const session = mabarService.createSession('msg_1', 'user_host', 'Valorant', 5, 'Ranked gas', '20:00');
  assert.strictEqual(session.participants.length, 1);
  assert.strictEqual(session.maxSlots, 5);

  const joined = mabarService.joinSession('msg_1', 'user_player2');
  assert.strictEqual(joined.participants.length, 2);

  // Leave session
  const left = mabarService.leaveSession('msg_1', 'user_player2');
  assert.strictEqual(left.participants.length, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/mabarService.test.js`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `src/services/mabarService.js`, `src/commands/mabar.js`, and `src/buttons/mabarButtons.js`**

Implement mabar party state management with live Embed updates and action row buttons (`btn_mabar_join` and `btn_mabar_leave`).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/mabarService.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/mabarService.js src/commands/mabar.js src/buttons/mabarButtons.js test/mabarService.test.js
git commit -m "feat: implement interactive mabar coordinator command and buttons"
```

---

### Task 3: In-House Support Ticket System

**Files:**
- Create: `src/services/ticketService.js`
- Create: `src/commands/ticket.js`
- Create: `src/buttons/ticketButtons.js`
- Test: `test/ticketService.test.js`

**Interfaces:**
- Consumes: Discord Guild, Member
- Produces: `ticketService.createTicketChannel(guild, member)`, `ticketService.hasOpenTicket(guild, userId)`

- [ ] **Step 1: Write failing test for ticket service**

```javascript
// test/ticketService.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const ticketService = require('../src/services/ticketService');

test('ticketService generates ticket channel name format', () => {
  const channelName = ticketService.formatTicketChannelName('NovatriaUser');
  assert.strictEqual(channelName, 'ticket-novatriauser');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/ticketService.test.js`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `src/services/ticketService.js`, `src/commands/ticket.js`, and `src/buttons/ticketButtons.js`**

Implement ticket panel command `/ticket panel`, ticket creation button `btn_ticket_create` with private channel permissions, and ticket closure `btn_ticket_close`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/ticketService.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/ticketService.js src/commands/ticket.js src/buttons/ticketButtons.js test/ticketService.test.js
git commit -m "feat: implement in-house private support ticket system"
```

---

### Task 4: Interaction Router Wiring & Configuration Update

**Files:**
- Modify: `src/commands/definitions.js`
- Modify: `src/handlers/interactionCreate.js`
- Modify: `.env.example`
- Modify: `README.md`
- Test: `test/expansionIntegration.test.js`

**Interfaces:**
- Consumes: `definitions.js`, `interactionCreate.js`
- Produces: Fully wired Discord bot handling all new slash commands and button routes.

- [ ] **Step 1: Write integration test for new buttons and commands**

```javascript
// test/expansionIntegration.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const commands = require('../src/commands/definitions');

test('commands definition includes mabar and ticket commands', () => {
  const commandNames = commands.map(c => c.name);
  assert.ok(commandNames.includes('mabar'));
  assert.ok(commandNames.includes('ticket'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/expansionIntegration.test.js`
Expected: FAIL with missing commands in definitions.

- [ ] **Step 3: Update `src/commands/definitions.js`, `src/handlers/interactionCreate.js`, and documentation**

Register `/mabar` and `/ticket` slash commands, route `btn_mabar_*` and `btn_ticket_*` in `interactionCreate.js`, update `.env.example` and `README.md`.

- [ ] **Step 4: Run all test suites**

Run: `npm test`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/commands/definitions.js src/handlers/interactionCreate.js .env.example README.md test/expansionIntegration.test.js
git commit -m "feat: wire expansion commands and buttons into main interaction handler"
```
