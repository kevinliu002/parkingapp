import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dataDir = process.env.DATA_DIR ?? path.join(__dirname, '../../');
mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, 'parking.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS spots (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    address    TEXT NOT NULL DEFAULT '',
    notes      TEXT NOT NULL DEFAULT '',
    lat        REAL NOT NULL,
    lng        REAL NOT NULL,
    is_paid    INTEGER NOT NULL DEFAULT 0,
    price      TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Migrate existing tables that don't have the new columns yet
for (const col of [
  'ALTER TABLE spots ADD COLUMN is_paid INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE spots ADD COLUMN price TEXT NOT NULL DEFAULT ""',
]) {
  try { db.exec(col); } catch { /* column already exists */ }
}

export default db;
