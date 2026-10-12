# Novatria-Bot Advanced Features Specification (Security, Backup, Audit, Persona)

## 1. Objective
Add four critical operational features to Novatria-Bot:
1. **Auto-Moderation Anti-Scam & Link Phishing**: Real-time filtering of malicious links, fake gift scams, and unauthorized discord invite links.
2. **Automated SQLite Database Backup**: Daily automated backup scheduler and manual command (`/hermes backup`) uploading the SQLite database as an attachment to `#bansos-manage`.
3. **Bansos Claim Audit History (`/bansos history`)**: Query and review all past claims by user or item label.
4. **Dynamic Hermes Persona Switching (`/hermes mode`)**: Change the AI system prompt dynamically across Coder, CyberSec, Unrestricted, and Researcher modes.

## 2. Feature Specifications

### 2.1 Auto-Moderation Anti-Scam (`src/services/autoModService.js`)
- **Triggers**: Listens on `messageCreate` in non-bot and non-admin messages.
- **Rules**:
  - `DISCORD_INVITE`: Regex checking `discord.gg/` or `discord.com/invite/` (unless posted by admins).
  - `SCAM_NITRO_PHISHING`: Patterns matching `discorcl`, `dlscord`, `free nitro`, `nitro gift`, `steam-gift`, etc.
  - `UNAUTHORIZED_MASS_MENTION`: Checks if non-admin mentions `@everyone` or `@here`.
- **Action**:
  - Deletes violating message.
  - Sends a temporary ephemeral/self-deleting warning message to the channel (deleted after 6 seconds).
  - Sends an alert log embed to `config.channels.bansosLog` or admin channel with user info, channel, and content.

### 2.2 Database Backup Service (`src/services/backupService.js`)
- **Manual Command**: Subcommand `/hermes backup` (Admin only).
- **Automated Scheduler**: Runs every 24 hours (or at 00:00 UTC/WIB).
- **Action**: Creates a safe snapshot / reads `data/database.sqlite`, attaches as `backup-database-YYYY-MM-DD.sqlite`, and sends an embed to `config.channels.bansosLog`.

### 2.3 Bansos Claim Audit History (`/bansos history`)
- **Command**: `/bansos history [user:<User>] [label:<string>] [limit:<number: 1-25>]` (Admin only).
- **Query**: Selects from `bansos_claims` joined with `bansos_items` filtered by user ID or item label.
- **Output**: Embed listing chronological history: User, Item, Credential preview, Claimed At.

### 2.4 Dynamic Hermes Persona Modes (`/hermes mode`)
- **Command**: `/hermes mode [persona:<choice>]` (Admin only).
- **Available Modes**:
  - `unrestricted`: Default autonomous operator mode (ENI).
  - `coder`: Senior full-stack engineer persona, optimized for clean code, architecture, and syntax.
  - `cybersec`: Offensive security & pentesting expert persona.
  - `researcher`: Deep technical summarizer and analyst persona.
- **Storage**: In-memory state and persisted setting in `hermesChatService.js`.

## 3. Technology Stack
- Node.js 20+
- `discord.js` v14
- `better-sqlite3`
- Node native test runner (`node:test`)
