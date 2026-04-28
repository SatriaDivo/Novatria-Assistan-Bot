# v1.0.0 - Novatria Assistant Initial Stable Release

Initial stable release for Novatria Assistant Bot, a Discord assistant for productivity, scheduling, mabar coordination, and CTF learning workflows.

## Highlights

- Full slash command workflow for notes, todos, important links, schedules, mabar plans, archives, listing data, and deleting saved records.
- Dedicated CTF workflow for event discovery, challenge tracking, writeups, progress updates, and GitHub-based challenge imports.
- Google Sheet integration through Google Apps Script Web App for persistent records.
- Google Calendar integration for `/jadwal` events.
- Discord embed replies for cleaner command feedback and channel posts.
- Docker support, local Windows auto-start helper scripts, GitHub Actions CI, and Prettier formatting.

## Added

### Core Commands

- Added `/ping` to check whether the bot is active.
- Added `/help` to show the available Novatria Assistant commands.
- Added `/status` to validate target channels, bot permissions, and Google Sheet configuration.
- Added `/catat`, `/todo`, `/link`, `/jadwal`, `/mabar`, and `/arsip` for daily productivity workflows.
- Added `/list` to show recent Google Sheet records with IDs.
- Added `/hapus` to delete Google Sheet records by ID.

### Scheduling

- Added `/jadwal` with `judul`, `jam`, optional `tanggal`, `bulan`, `tahun`, `selesai`, and `catatan` fields.
- Added default date handling for `/jadwal`; when date fields are empty, the bot uses today's date in `Asia/Jakarta`.
- Added validation for complete date fields and `HH:mm` time format.
- Added Google Calendar event creation for `/jadwal`.

### Mabar

- Added `/mabar` for game session scheduling with `game`, `jam`, optional date fields, and `catatan`.
- Added default date handling for `/mabar`; empty date fields use today's date in `Asia/Jakarta`.
- Added mabar channel routing with priority for `info-mabar`, then configured or fallback mabar schedule channels.
- Added Google Sheet persistence for mabar records.

### CTF Workflow

- Added `/ctfevent` to show upcoming CTF events from the CTFtime public API.
- Added `/ctfcek` to send upcoming CTF event information into a CTF channel.
- Added `/ctfnotify` to enable or disable automatic CTFtime notifications.
- Added `/ctf` to track CTF challenges in the target CTF channel.
- Added `/tantangan` to import a challenge from GitHub, read markdown files into embeds, and attach downloadable files when possible.
- Added `/writeup` to save CTF writeups.
- Added `/progress` to track challenge progress with structured status values.
- Added CTF channel guard so CTF commands are limited to `ctf-command` or bot command areas.
- Added CTF area protection so non-CTF commands are rejected inside CTF channels or categories.

### Integrations

- Added Google Apps Script support for `Catatan`, `Todo`, `Link`, `Jadwal`, `Mabar`, `Arsip`, and `Log` sheets.
- Added Google Sheet actions for status checks, append, list, and delete.
- Added automatic ID generation for saved records.
- Added activity logging to the configured Discord log channel or `CHANNEL_LOG_ID`.
- Added optional `GITHUB_TOKEN` support for `/tantangan` to reduce GitHub API rate-limit issues.

### Project And Operations

- Added project logo under `assets/logo.png`.
- Added Dockerfile and Docker Compose setup for local deployment.
- Added Windows Startup Folder helper scripts for local auto-run.
- Added script to clear global Discord slash commands.
- Added GitHub Actions CI with formatting checks.
- Added Prettier configuration through npm scripts.
- Added MIT License.

## Changed

- Split `/jadwal` date input into `tanggal`, `bulan`, and `tahun`.
- Updated `/jadwal` and `/mabar` so date fields are optional but must be complete when any date part is provided.
- Updated mabar scheduling to prioritize the dedicated `info-mabar` channel.
- Updated README documentation with grouped feature sections, CTF setup guidance, examples, environment variables, and Docker usage.

## Notes

- Secrets remain outside the repository through `.env`.
- `SHEET_WEBAPP_URL` and `SHEET_SECRET` are required for Google Sheet integration.
- Google Apps Script must define `SECRET_KEY` and `SPREADSHEET_ID` in Script Properties.
- `GITHUB_TOKEN` is optional and only needed to improve GitHub API reliability for `/tantangan`.
- Runtime CTF notification settings are stored under `data/` and should not be committed.
- `google-apps-script.local.js` remains local-only and is ignored by Git.

## Upgrade Checklist

- Run `npm install` after pulling the release.
- Copy the latest `google-apps-script.js` into Google Apps Script and deploy a new Web App version.
- Confirm `.env` contains Discord, Google Sheet, channel, and optional GitHub token values.
- Re-register slash commands by starting the bot once.
- Use `/status` to verify channel access, permissions, and Google Sheet connectivity.
