import { getHadithDb } from "./db";

const listeners = new Set<() => void>();
let version = 0;

const notify = () => {
  version++;
  listeners.forEach((listener) => listener());
};

/** Bumps on every favorites change so screens can re-query. */
export const getFavoritesVersion = () => version;

export const subscribeToFavorites = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export interface HadithKey {
  book: string;
  number: number;
}

export const isFavoriteHadith = async (book: string, number: number) => {
  const db = await getHadithDb();
  const row = await db.getFirstAsync(
    "SELECT 1 FROM favorite_hadiths WHERE book = ? AND number = ?",
    book,
    number,
  );
  return row != null;
};

export const setFavoriteHadith = async (book: string, number: number, favorite: boolean) => {
  const db = await getHadithDb();
  if (favorite) {
    await db.runAsync(
      "INSERT OR IGNORE INTO favorite_hadiths (book, number, created_at) VALUES (?, ?, ?)",
      book,
      number,
      Date.now(),
    );
  } else {
    await db.runAsync(
      "DELETE FROM favorite_hadiths WHERE book = ? AND number = ?",
      book,
      number,
    );
  }
  notify();
};

/** Most recently saved first. */
export const getFavoriteHadithKeys = async (): Promise<HadithKey[]> => {
  const db = await getHadithDb();
  return db.getAllAsync<HadithKey>(
    "SELECT book, number FROM favorite_hadiths ORDER BY created_at DESC",
  );
};

export const getFavoriteBookKeys = async (): Promise<Set<string>> => {
  const db = await getHadithDb();
  const rows = await db.getAllAsync<{ key: string }>(
    "SELECT key FROM favorite_books ORDER BY created_at DESC",
  );
  return new Set(rows.map((r) => r.key));
};

export const setFavoriteBook = async (key: string, favorite: boolean) => {
  const db = await getHadithDb();
  if (favorite) {
    await db.runAsync(
      "INSERT OR IGNORE INTO favorite_books (key, created_at) VALUES (?, ?)",
      key,
      Date.now(),
    );
  } else {
    await db.runAsync("DELETE FROM favorite_books WHERE key = ?", key);
  }
  notify();
};
