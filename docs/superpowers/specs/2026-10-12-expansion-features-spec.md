# Novatria-Bot Expansion Features Specification

## 1. Objective
Enhance Novatria-Bot with essential community security, engagement, and support capabilities:
1. **Anti-Raid / Minimum Account Age Guard** for bansos claiming.
2. **Interactive Mabar Coordinator** (`/mabar`) with real-time slot management.
3. **Simple In-House Ticket System** (`/ticket panel` and private channel generation).
4. **Automated Bansos Drop Ping Announcement** notifying `@Bansos Hunter` in `#bansos-feed`.

## 2. Feature Specifications

### 2.1 Anti-Raid / Minimum Account Age Guard
- **Requirement**: Prevent botting/multi-accounting on bansos claims.
- **Rule**: When a user clicks `btn_claim_account` or `btn_claim_api`, evaluate `user.createdTimestamp`. If the account was created less than `MIN_ACCOUNT_AGE_DAYS` (default: 3 days) ago, reject the claim with an ephemeral error embed explaining the age requirement.
- **Config**: `MIN_ACCOUNT_AGE_DAYS` in `.env` (default: 3).

### 2.2 Interactive Mabar Coordinator (`/mabar`)
- **Requirement**: Allow members to organize multiplayer gaming sessions.
- **Command**: `/mabar game:<string> slot:<number: 2-10> [jam:<string>] [catatan:<string>]`.
- **Card**:
  - Embed displaying: Game Title, Host (`<@userId>`), Schedule/Time, Slots (`1 / max`), Participants list (`1. <@host>`).
  - Mentions `@Gamers` role to notify interested players.
  - Interactive Buttons:
    - `[🟢 Ikut Mabar]` (`btn_mabar_join`): Adds user to participants if slot available, updates embed.
    - `[🔴 Batal]` (`btn_mabar_leave`): Removes user (host cannot leave; host can cancel).
- **Storage**: In-memory state or lightweight SQLite table `mabar_sessions`.

### 2.3 Simple Support Ticket System
- **Requirement**: Allow members to request private support from admins without third-party bots.
- **Command**: `/ticket panel [channel]` (Admin only): Sends an embed in support channel with button `[📩 Buka Tiket Bantuan]`.
- **Flow**:
  - User clicks `btn_ticket_create`.
  - Checks if user already has an open ticket. If yes, inform them and reject duplicate ticket.
  - Creates a private text channel `ticket-<username>` in `TICKET_CATEGORY_ID` (or root) with permissions:
    - `@everyone`: Deny `ViewChannel`.
    - User: Allow `ViewChannel`, `SendMessages`, `AttachFiles`.
    - Admin Role: Allow `ViewChannel`, `SendMessages`.
  - Inside ticket channel, bot sends welcome embed with `[🔒 Tutup Tiket]` button.
  - When `btn_ticket_close` is clicked, bot confirms and deletes the ticket channel after 5 seconds.

### 2.4 Bansos Drop Ping Announcement
- **Requirement**: Automatically broadcast new bansos drops to `#bansos-feed`.
- **Behavior**: In `/bansos drop`, bot automatically sends an announcement to `config.channels.bansosFeed` (or `BANSOS_FEED_CHANNEL_ID`) mentioning `<@&ROLE_BANSOS_ID>` with link/reference to the drop channel.

## 3. Technology & Dependencies
- Node.js 20+
- `discord.js` v14
- SQLite `better-sqlite3`
- Node native test runner (`node:test`)
