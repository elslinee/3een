import type { HadithBook } from "@/constants/hadithBooks";
import { getHadithDb } from "./db";
import { normalizeArabic } from "./normalize";
import { createSectionResolver } from "./sections";

export type DownloadState =
  | { status: "idle" }
  | { status: "downloading" }
  | { status: "saving"; progress: number }
  | { status: "error"; message: string };

interface EditionHadith {
  hadithnumber: number;
  arabicnumber: number | null;
  text: string;
  grades: { name: string; grade: string }[];
  reference: { book: number; hadith: number };
}

// jsDelivr is fastest; raw GitHub is the fallback when the CDN refuses a file.
const SOURCES = [
  (edition: string) =>
    `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${edition}.min.json`,
  (edition: string) =>
    `https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/${edition}.min.json`,
];

const HADITH_CHUNK = 150;
const GRADE_CHUNK = 200;

const states = new Map<string, DownloadState>();
const inFlight = new Map<string, Promise<boolean>>();
const listeners = new Set<() => void>();

const setState = (key: string, state: DownloadState) => {
  states.set(key, state);
  listeners.forEach((listener) => listener());
};

// Stable reference: useSyncExternalStore re-renders whenever the snapshot identity changes.
const IDLE: DownloadState = { status: "idle" };

export const getDownloadState = (key: string): DownloadState =>
  states.get(key) ?? IDLE;

export const subscribeToDownloads = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const fetchEdition = async (edition: string): Promise<EditionHadith[]> => {
  let lastError: unknown;
  for (const source of SOURCES) {
    try {
      const response = await fetch(source(edition));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (!Array.isArray(json?.hadiths)) throw new Error("Unexpected payload");
      return json.hadiths;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

const placeholders = (rows: number, columns: number) =>
  Array.from({ length: rows }, () => `(${Array(columns).fill("?").join(",")})`).join(",");

const saveBook = async (book: HadithBook, hadiths: EditionHadith[]) => {
  const db = await getHadithDb();
  const resolveSection = createSectionResolver(book);
  const grades = hadiths.flatMap((h) =>
    (h.grades ?? []).map((g) => [book.key, h.hadithnumber, g.name, g.grade]),
  );
  const totalSteps =
    Math.ceil(hadiths.length / HADITH_CHUNK) + Math.ceil(grades.length / GRADE_CHUNK);
  let step = 0;
  const advance = () => {
    step++;
    setState(book.key, { status: "saving", progress: step / totalSteps });
  };

  // One transaction: an interrupted import leaves no half-saved book behind.
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync("DELETE FROM hadiths WHERE book = ?", book.key);
    await txn.runAsync("DELETE FROM grades WHERE book = ?", book.key);
    await txn.runAsync("DELETE FROM books WHERE key = ?", book.key);

    for (let i = 0; i < hadiths.length; i += HADITH_CHUNK) {
      const chunk = hadiths.slice(i, i + HADITH_CHUNK);
      const params = chunk.flatMap((h) => {
        const text = h.text ?? "";
        return [
          book.key,
          h.hadithnumber,
          h.arabicnumber ?? null,
          resolveSection(h.hadithnumber, h.reference.book),
          text,
          normalizeArabic(text),
        ];
      });
      await txn.runAsync(
        `INSERT INTO hadiths (book, number, arabic_number, section, text, text_norm) VALUES ${placeholders(chunk.length, 6)}`,
        params,
      );
      advance();
    }

    for (let i = 0; i < grades.length; i += GRADE_CHUNK) {
      const chunk = grades.slice(i, i + GRADE_CHUNK);
      await txn.runAsync(
        `INSERT INTO grades (book, number, grader, grade) VALUES ${placeholders(chunk.length, 4)}`,
        chunk.flat(),
      );
      advance();
    }

    await txn.runAsync(
      "INSERT INTO books (key, downloaded_at) VALUES (?, ?)",
      book.key,
      Date.now(),
    );
  });
};

/** Downloads and stores a whole book. Concurrent calls for the same book share one run. */
export const downloadBook = (book: HadithBook): Promise<boolean> => {
  const existing = inFlight.get(book.key);
  if (existing) return existing;

  const run = (async () => {
    try {
      setState(book.key, { status: "downloading" });
      const hadiths = await fetchEdition(book.edition);
      setState(book.key, { status: "saving", progress: 0 });
      await saveBook(book, hadiths);
      setState(book.key, IDLE);
      return true;
    } catch (error) {
      console.error(`[Hadith] Failed downloading ${book.key}:`, error);
      setState(book.key, {
        status: "error",
        message: "تعذر تحميل الكتاب، تأكد من اتصالك بالإنترنت وحاول مرة أخرى",
      });
      return false;
    } finally {
      inFlight.delete(book.key);
    }
  })();

  inFlight.set(book.key, run);
  return run;
};
