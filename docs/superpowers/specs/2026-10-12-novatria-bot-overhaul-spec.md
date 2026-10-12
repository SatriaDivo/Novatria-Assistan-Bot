# Novatria-Bot Architecture Overhaul Specification

## 1. Objective
Transform Novatria-Bot from a legacy productivity/CTF/voice bot into a lightweight, high-performance community & administration bot deployed on the same VPS as Hermes.

## 2. Core Functional Requirements
1. **Hermes VPS Controller (Admin Only)**:
   - Command `/hermes status`: Query system specs (CPU, memory, uptime) and check if Hermes process/daemon is active.
   - Command `/hermes cmd <command>`: Execute shell/CLI commands safely on the host VPS (limited to authorized admins in `#hermes-control`).
   - Command `/hermes restart`: Restart the Hermes systemd service or background process.

2. **Bansos Distribution System (Accounts & API Keys)**:
   - Storage in local SQLite (`data/database.sqlite`) via `better-sqlite3` with atomic transactions.
   - Admin command `/bansos add account <label> <credentials>`: Add one or more accounts.
   - Admin command `/bansos add api <provider> <key>`: Add one or more API keys.
   - Admin command `/bansos stock`: Check available vs claimed inventory.
   - Admin command `/bansos drop <type> <channel>`: Send interactive embed panel with claim button (`[🎁 Klaim Akun]` / `[🔑 Klaim API]`).
   - Interactive Buttons:
     - User clicks claim button.
     - Bot runs atomic SQLite transaction (`SELECT ... LIMIT 1 ... UPDATE status = 'claimed'`).
     - Bot replies **Ephemerally** with the credentials so only the claimer sees it.
     - Enforce 1 claim per user per drop or cooldown to prevent hoarding.
     - Send notification log to `#bansos-manage` or admin log.

3. **Community & Welcome System**:
   - Event `guildMemberAdd`: Automatically greet new users in `#welcome` with an embed card, and automatically assign the default `Member` role.
   - Self-Role Panel (`/rolepanel`): Interactive button panel in `#ambil-role` allowing members to toggle roles (`Bansos Hunter`, `Gamers`).

4. **Legacy Cleanup**:
   - Delete legacy Google Sheets & Apps script code, CTF commands and utilities, voice interrupter audio files and handlers.
   - Remove heavy dependencies: `@discordjs/voice`, `ffmpeg-static`, `libsodium-wrappers`.

## 3. Technology Stack & Constraints
- **Runtime**: Node.js 20+
- **Module System**: CommonJS (consistent with existing Node setup) or ES Modules. We keep CommonJS for maximum stability with native bindings like `better-sqlite3`.
- **Bot Library**: `discord.js` v14.
- **Database**: `better-sqlite3` (synchronous, in-process, transaction-safe).
- **Process Execution**: Node.js `child_process.exec` with timeout.
- **Node Test Runner**: Built-in `node:test` and `node:assert` (zero extra test dependencies).

## 4. Environment Variables
- `TOKEN`: Discord bot token.
- `CLIENT_ID`: Discord bot application client ID.
- `GUILD_ID`: Discord guild/server ID.
- `ADMIN_CHANNEL_ID`: Channel ID for `#hermes-control`.
- `BANSOS_LOG_CHANNEL_ID`: Channel ID for `#bansos-manage` (or logs).
- `WELCOME_CHANNEL_ID`: Channel ID for `#welcome`.
- `DEFAULT_ROLE_ID`: Role ID for auto-assigned `Member` role.
- `ROLE_BANSOS_ID`: Role ID for `Bansos Hunter`.
- `ROLE_GAMERS_ID`: Role ID for `Gamers`.
- `ADMIN_ROLE_IDS`: Comma-separated list of admin role IDs.
- `HERMES_SERVICE_NAME`: systemd service or binary name for Hermes (default: `hermes`).
