import Database from "better-sqlite3";
import { config } from "./config";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  db = new Database(config.databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  migrate(db);
  return db;
}

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      name TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      plan_status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      folder_hint TEXT,
      live_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, slug)
    );

    CREATE TABLE IF NOT EXISTS hosting_connections (
      project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      display_name TEXT,
      credentials_enc TEXT NOT NULL,
      target_json TEXT NOT NULL DEFAULT '{}',
      last_test_status TEXT,
      last_test_message TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS project_database (
      project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
      mode TEXT NOT NULL DEFAULT 'none',
      connection_enc TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS env_vars (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      value_enc TEXT NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'secret',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(project_id, key)
    );

    CREATE TABLE IF NOT EXISTS snippets (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'custom',
      placement TEXT NOT NULL DEFAULT 'marker',
      content TEXT NOT NULL DEFAULT '',
      last_applied_content TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(project_id, slug)
    );

    CREATE TABLE IF NOT EXISTS affiliate_links (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      slug TEXT NOT NULL,
      destination_url TEXT NOT NULL,
      last_applied_url TEXT,
      mode TEXT NOT NULL DEFAULT 'replace',
      find_url_on_create TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(project_id, slug)
    );

    CREATE TABLE IF NOT EXISTS saves (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      label TEXT,
      storage_key TEXT NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS deploys (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      save_id TEXT REFERENCES saves(id) ON DELETE SET NULL,
      status TEXT NOT NULL,
      log TEXT NOT NULL DEFAULT '',
      provider_ref TEXT,
      live_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      finished_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_saves_project ON saves(project_id);
    CREATE INDEX IF NOT EXISTS idx_deploys_project ON deploys(project_id);
    CREATE INDEX IF NOT EXISTS idx_env_project ON env_vars(project_id);

    CREATE TABLE IF NOT EXISTS agent_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL DEFAULT 'Tray',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Lightweight migrations for existing DBs
  const cols = database
    .prepare("PRAGMA table_info(users)")
    .all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("plan")) {
    database.exec(
      `ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'`
    );
  }
  if (!names.has("stripe_customer_id")) {
    database.exec(`ALTER TABLE users ADD COLUMN stripe_customer_id TEXT`);
  }
  if (!names.has("stripe_subscription_id")) {
    database.exec(`ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT`);
  }
  if (!names.has("plan_status")) {
    database.exec(
      `ALTER TABLE users ADD COLUMN plan_status TEXT NOT NULL DEFAULT 'active'`
    );
  }
  if (!names.has("razorpay_customer_id")) {
    database.exec(`ALTER TABLE users ADD COLUMN razorpay_customer_id TEXT`);
  }
  if (!names.has("razorpay_subscription_id")) {
    database.exec(`ALTER TABLE users ADD COLUMN razorpay_subscription_id TEXT`);
  }
  if (!names.has("email_verified")) {
    database.exec(
      `ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0`
    );
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS email_verify_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      user_agent TEXT,
      ip TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
      revoked_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
  `);
}

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  razorpay_customer_id: string | null;
  razorpay_subscription_id: string | null;
  plan_status: string;
  email_verified: number;
  created_at: string;
};

export type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  folder_hint: string | null;
  live_url: string | null;
  created_at: string;
  updated_at: string;
};
