import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await client.execute(`
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
  try { await client.execute(col); } catch { /* column already exists */ }
}

export default client;
