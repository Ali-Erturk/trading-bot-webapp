const Database = require("better-sqlite3");
const { config } = require("../config");

let db;

function initDb() {
  db = new Database(config.dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS ticks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      price REAL NOT NULL,
      ts_ms INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ticks_symbol_ts ON ticks(symbol, ts_ms);

    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      side TEXT NOT NULL,
      qty REAL NOT NULL,
      price REAL NOT NULL,
      status TEXT NOT NULL,
      ts_ms INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_trades_symbol_ts ON trades(symbol, ts_ms);
  `);

  return db;
}

function getDb() {
  if (!db) throw new Error("DB not initialized. Call initDb() first.");
  return db;
}

module.exports = { initDb, getDb };
