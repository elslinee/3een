import { getHadithDb } from "./db";
import type { HadithGrade } from "./grades";

export interface HadithRecord {
  book: string;
  number: number;
  arabicNumber: number | null;
  section: number;
  text: string;
  grades: HadithGrade[];
}

interface HadithRowDb {
  book: string;
  number: number;
  arabic_number: number | null;
  section: number;
  text: string;
}

interface GradeRowDb {
  number: number;
  grader: string;
  grade: string;
}

const attachGrades = (rows: HadithRowDb[], grades: GradeRowDb[]): HadithRecord[] => {
  const byNumber = new Map<number, HadithGrade[]>();
  for (const g of grades) {
    const list = byNumber.get(g.number) ?? [];
    list.push({ grader: g.grader, grade: g.grade });
    byNumber.set(g.number, list);
  }
  return rows.map((r) => ({
    book: r.book,
    number: r.number,
    arabicNumber: r.arabic_number,
    section: r.section,
    text: r.text,
    grades: byNumber.get(r.number) ?? [],
  }));
};

export const getDownloadedBookKeys = async (): Promise<Set<string>> => {
  const db = await getHadithDb();
  const rows = await db.getAllAsync<{ key: string }>("SELECT key FROM books");
  return new Set(rows.map((r) => r.key));
};

export const isBookDownloaded = async (book: string): Promise<boolean> => {
  const db = await getHadithDb();
  const row = await db.getFirstAsync("SELECT 1 FROM books WHERE key = ?", book);
  return row != null;
};

export const getSectionHadiths = async (
  book: string,
  section: number,
): Promise<HadithRecord[]> => {
  const db = await getHadithDb();
  const rows = await db.getAllAsync<HadithRowDb>(
    "SELECT book, number, arabic_number, section, text FROM hadiths WHERE book = ? AND section = ? ORDER BY number",
    book,
    section,
  );
  const grades = await db.getAllAsync<GradeRowDb>(
    `SELECT g.number, g.grader, g.grade FROM grades g
     JOIN hadiths h ON h.book = g.book AND h.number = g.number
     WHERE h.book = ? AND h.section = ?`,
    book,
    section,
  );
  return attachGrades(rows, grades);
};

export const getHadith = async (
  book: string,
  number: number,
): Promise<HadithRecord | null> => {
  const db = await getHadithDb();
  const row = await db.getFirstAsync<HadithRowDb>(
    "SELECT book, number, arabic_number, section, text FROM hadiths WHERE book = ? AND number = ?",
    book,
    number,
  );
  if (!row) return null;
  const grades = await db.getAllAsync<GradeRowDb>(
    "SELECT number, grader, grade FROM grades WHERE book = ? AND number = ?",
    book,
    number,
  );
  return attachGrades([row], grades)[0];
};

/**
 * Numbers of every hadith in the book whose normalized text contains the needle, in
 * book order. A single scan; callers page through it with getHadithsByNumbers.
 */
export const searchBookHadithNumbers = async (
  book: string,
  normalizedNeedle: string,
): Promise<number[]> => {
  const db = await getHadithDb();
  const rows = await db.getAllAsync<{ number: number }>(
    "SELECT number FROM hadiths WHERE book = ? AND instr(text_norm, ?) > 0 ORDER BY number",
    book,
    normalizedNeedle,
  );
  return rows.map((r) => r.number);
};

export const getHadithsByNumbers = async (
  book: string,
  numbers: number[],
): Promise<HadithRecord[]> => {
  if (numbers.length === 0) return [];
  const db = await getHadithDb();
  const marks = numbers.map(() => "?").join(",");
  const rows = await db.getAllAsync<HadithRowDb>(
    `SELECT book, number, arabic_number, section, text FROM hadiths
     WHERE book = ? AND number IN (${marks}) ORDER BY number`,
    book,
    ...numbers,
  );
  const grades = await db.getAllAsync<GradeRowDb>(
    `SELECT number, grader, grade FROM grades WHERE book = ? AND number IN (${marks})`,
    book,
    ...numbers,
  );
  return attachGrades(rows, grades);
};

/** Loads hadiths from any mix of books, preserving the order of `keys`. */
export const getHadithsByKeys = async (
  keys: { book: string; number: number }[],
): Promise<HadithRecord[]> => {
  const byBook = new Map<string, number[]>();
  for (const k of keys) {
    const list = byBook.get(k.book) ?? [];
    list.push(k.number);
    byBook.set(k.book, list);
  }
  const loaded = new Map<string, HadithRecord>();
  for (const [book, numbers] of byBook) {
    for (const record of await getHadithsByNumbers(book, numbers)) {
      loaded.set(`${record.book}|${record.number}`, record);
    }
  }
  return keys
    .map((k) => loaded.get(`${k.book}|${k.number}`))
    .filter((r): r is HadithRecord => r !== undefined);
};

export const getAdjacentNumbers = async (
  book: string,
  number: number,
): Promise<{ previous: number | null; next: number | null }> => {
  const db = await getHadithDb();
  const previous = await db.getFirstAsync<{ number: number }>(
    "SELECT number FROM hadiths WHERE book = ? AND number < ? ORDER BY number DESC LIMIT 1",
    book,
    number,
  );
  const next = await db.getFirstAsync<{ number: number }>(
    "SELECT number FROM hadiths WHERE book = ? AND number > ? ORDER BY number ASC LIMIT 1",
    book,
    number,
  );
  return { previous: previous?.number ?? null, next: next?.number ?? null };
};
