# v1.1.0 - Stability, Usability, and CTF Tracking

Release v1.1.0 focuses on safer operations, better Google Sheet coverage, persistent runtime data, and smoother CTF tracking.

## Highlights

- Added persistent Docker data mount so CTFtime runtime files survive container rebuilds.
- Added `/done` to mark todo items as completed in Google Sheet.
- Added dedicated CTF sheets for challenges, writeups, progress updates, and imported GitHub challenges.
- Added admin permission guard for `/hapus`.
- Improved `/status`, `/help`, `/list`, `/hapus`, `/jadwal`, and `/tantangan`.

## Added

- Added `./data:/app/data` volume in `docker-compose.yml`.
- Added ID prefixes for CTF records:
  - `ctf` → `CTF`
  - `writeup` → `WUP`
  - `progress` → `PRG`
  - `tantangan` → `TNG`
- Added Google Apps Script config for:
  - `ctf_challenge` → `CTF Challenge`
  - `ctf_writeup` → `CTF Writeup`
  - `ctf_progress` → `CTF Progress`
  - `ctf_tantangan` → `CTF Tantangan`
- Added `/done id` command to update todo status to `Selesai`.
- Added Apps Script `update_status` action for todo completion.
- Added optional `ADMIN_ROLE_IDS` environment variable.
- Added permission guard for `/hapus`.

## Changed

- Updated project version to `1.1.0`.
- Updated `/help` with grouped command sections and `/tantangan`.
- Updated `/list` and `/hapus` to support CTF data types.
- Updated `/status` to show main channels, mabar channel, important CTF channels, Google Sheet status, and Apps Script version.
- Updated `/jadwal` to save to Google Sheet and create Calendar event before posting the Discord schedule message.
- Updated `/tantangan` with safe limits: 5 markdown files, 5 attachment files, and 10 markdown chunks.
- Updated README and `.env.example` with v1.1.0 deployment notes.

## Fixed

- CTF records no longer depend on Apps Script fallback `Log` sheet when the updated Apps Script is deployed.
- CTF command IDs no longer fall back to `LOG` prefixes.
- `/jadwal` no longer reports success when Sheet/Calendar integration fails first.
- Runtime CTFtime settings and seen-event data are no longer lost on Docker rebuilds.

## Upgrade Checklist

- Run `npm install`.
- Copy `.env.example` to `.env` if needed.
- Fill optional `ADMIN_ROLE_IDS` for admin roles that may use `/hapus`.
- Paste the latest `google-apps-script.js` into Google Apps Script.
- Deploy Apps Script as a new Web App version.
- Run `docker compose up -d --build`.
