import * as SQLite from "expo-sqlite";

const SCHEMA_VERSION = 2;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const migrate = async (db: SQLite.SQLiteDatabase) => {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const version = row?.user_version ?? 0;
  if (version >= SCHEMA_VERSION) return;

  if (version < 1) await migrateToV1(db);
  if (version < 2) await migrateToV2(db);
};

// Favorites live in SQLite (not AsyncStorage) so search can filter on them with a join.
const migrateToV2 = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS favorite_hadiths (
      book TEXT NOT NULL,
      number REAL NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (book, number)
    );
    CREATE TABLE IF NOT EXISTS favorite_books (
      key TEXT PRIMARY KEY NOT NULL,
      created_at INTEGER NOT NULL
    );
    PRAGMA user_version = 2;
  `);
};

const migrateToV1 = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS books (
      key TEXT PRIMARY KEY NOT NULL,
      downloaded_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hadiths (
      book TEXT NOT NULL,
      number REAL NOT NULL,
      arabic_number REAL,
      section INTEGER NOT NULL,
      text TEXT NOT NULL,
      text_norm TEXT NOT NULL,
      PRIMARY KEY (book, number)
    );
    CREATE INDEX IF NOT EXISTS idx_hadiths_section ON hadiths (book, section, number);
    CREATE TABLE IF NOT EXISTS grades (
      book TEXT NOT NULL,
      number REAL NOT NULL,
      grader TEXT NOT NULL,
      grade TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_grades_hadith ON grades (book, number);
    PRAGMA user_version = 1;
  `);
};

export const getHadithDb = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("hadith.db").then(async (db) => {
      await migrate(db);
      return db;
    });
    // Allow a retry on the next call if opening failed.
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
};
