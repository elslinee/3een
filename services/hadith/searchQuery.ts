import { HADITH_BOOKS } from "@/constants/hadithBooks";
import type { GradeCategory } from "./grades";
import { normalizeArabic, parseHadithNumber } from "./normalize";

export type GradeFilter = GradeCategory | "none";

export interface HadithSearchFilters {
  /** Empty = every downloaded book. */
  books: string[];
  grades: GradeFilter[];
  /** Grader names as they appear in the source data. */
  graders: string[];
  /** Only meaningful when exactly one book is selected. */
  section: number | null;
  numberFrom: number | null;
  numberTo: number | null;
  favoritesOnly: boolean;
  sort: "number" | "relevance";
}

export const DEFAULT_FILTERS: HadithSearchFilters = {
  books: [],
  grades: [],
  graders: [],
  section: null,
  numberFrom: null,
  numberTo: null,
  favoritesOnly: false,
  sort: "number",
};

export const MAX_RESULTS = 1000;

export const countActiveFilters = (f: HadithSearchFilters) =>
  (f.books.length > 0 ? 1 : 0) +
  (f.grades.length > 0 ? 1 : 0) +
  (f.graders.length > 0 ? 1 : 0) +
  (f.section !== null ? 1 : 0) +
  (f.numberFrom !== null || f.numberTo !== null ? 1 : 0) +
  (f.favoritesOnly ? 1 : 0);

// Same rules as categorizeGrade() in grades.ts, expressed in SQL for filtering.
const GRADE_CATEGORY_SQL = `CASE
  WHEN g.grade LIKE '%mawdu%' OR g.grade LIKE '%batil%' THEN 'mawdu'
  WHEN g.grade LIKE '%daif%' OR g.grade LIKE '%da''if%' OR g.grade LIKE '%munkar%'
    OR g.grade LIKE '%shadh%' OR g.grade LIKE '%malool%' THEN 'daif'
  WHEN g.grade LIKE '%sahih%' THEN 'sahih'
  WHEN g.grade LIKE '%hasan%' THEN 'hasan'
  ELSE 'other' END`;
const MEANINGFUL_GRADE_SQL = "trim(g.grade) <> '' AND trim(g.grade) <> '-'";

const BOOK_ORDER_SQL = `CASE h.book ${HADITH_BOOKS.map(
  (b, i) => `WHEN '${b.key}' THEN ${i}`,
).join(" ")} ELSE 99 END`;

const marks = (n: number) => Array(n).fill("?").join(",");

export interface SearchQuery {
  sql: string;
  params: (string | number)[];
  needle: string;
}

/**
 * Builds the SQL for searching downloaded books. A pure number query matches hadith
 * numbers; any other text matches the normalized hadith text. Returns null when there
 * is nothing to search for (no query and no filters) or no book to search in.
 */
export const buildSearchQuery = (
  query: string,
  filters: HadithSearchFilters,
  downloadedBooks: string[],
): SearchQuery | null => {
  const trimmed = query.trim();
  const number = parseHadithNumber(trimmed);
  const needle = number === null ? normalizeArabic(trimmed) : "";
  if (!trimmed && countActiveFilters(filters) === 0) return null;

  const books =
    filters.books.length > 0
      ? filters.books.filter((b) => downloadedBooks.includes(b))
      : downloadedBooks;
  if (books.length === 0) return null;

  const where: string[] = [`h.book IN (${marks(books.length)})`];
  const params: (string | number)[] = [...books];

  if (number !== null) {
    where.push("h.number = ?");
    params.push(number);
  } else if (needle) {
    where.push("instr(h.text_norm, ?) > 0");
    params.push(needle);
  }

  if (filters.section !== null && books.length === 1) {
    where.push("h.section = ?");
    params.push(filters.section);
  }
  if (filters.numberFrom !== null) {
    where.push("h.number >= ?");
    params.push(filters.numberFrom);
  }
  if (filters.numberTo !== null) {
    where.push("h.number <= ?");
    params.push(filters.numberTo);
  }
  if (filters.favoritesOnly) {
    where.push(
      "EXISTS (SELECT 1 FROM favorite_hadiths f WHERE f.book = h.book AND f.number = h.number)",
    );
  }

  const graderClause =
    filters.graders.length > 0 ? ` AND g.grader IN (${marks(filters.graders.length)})` : "";
  const gradeSubquery = (extra: string) =>
    `SELECT 1 FROM grades g WHERE g.book = h.book AND g.number = h.number AND ${MEANINGFUL_GRADE_SQL}${graderClause}${extra}`;
  const categories = filters.grades.filter((g): g is GradeCategory => g !== "none");
  const includeUngraded = filters.grades.includes("none");
  const gradeConditions: string[] = [];
  if (categories.length > 0) {
    gradeConditions.push(
      `EXISTS (${gradeSubquery(` AND (${GRADE_CATEGORY_SQL}) IN (${marks(categories.length)})`)})`,
    );
    params.push(...filters.graders, ...categories);
  }
  if (includeUngraded) {
    gradeConditions.push(`NOT EXISTS (${gradeSubquery("")})`);
    params.push(...filters.graders);
  }
  if (gradeConditions.length > 0) {
    where.push(`(${gradeConditions.join(" OR ")})`);
  } else if (filters.graders.length > 0) {
    where.push(`EXISTS (${gradeSubquery("")})`);
    params.push(...filters.graders);
  }

  let orderBy = `${BOOK_ORDER_SQL}, h.number`;
  if (needle && filters.sort === "relevance") {
    // Occurrence count of the needle, then shorter hadiths first.
    orderBy = `(length(h.text_norm) - length(replace(h.text_norm, ?, ''))) / length(?) DESC, length(h.text_norm), ${orderBy}`;
    params.push(needle, needle);
  }

  return {
    sql: `SELECT h.book, h.number FROM hadiths h WHERE ${where.join(" AND ")} ORDER BY ${orderBy} LIMIT ${MAX_RESULTS + 1}`,
    params,
    needle,
  };
};
