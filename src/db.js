const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

function initDatabase(dbPath) {
  const resolvedPath = dbPath || path.join(__dirname, "../data/database.sqlite");
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(resolvedPath);
  db.pragma("journal_mode = WAL");

  // Buat tabel items dan claims jika belum ada
  db.exec(`
    CREATE TABLE IF NOT EXISTS bansos_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,         -- 'account' atau 'api'
      label TEXT NOT NULL,        -- Misal: 'Canva Pro', 'OpenAI'
      content TEXT NOT NULL,      -- Email:pass atau API Key
      status TEXT NOT NULL DEFAULT 'available', -- 'available' atau 'claimed'
      claimed_by TEXT,            -- Discord User ID
      claimed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bansos_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,         -- 'account' atau 'api'
      item_id INTEGER NOT NULL,
      claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, type)       -- 1 user hanya bisa klaim 1 item per kategori
    );

    CREATE INDEX IF NOT EXISTS idx_items_status ON bansos_items (type, status);
  `);

  return db;
}

module.exports = initDatabase;
