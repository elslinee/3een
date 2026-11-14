import { getHadithDb } from "./db";
import type { HadithKey } from "./favorites";
import {
  buildSearchQuery,
  countActiveFilters,
  HadithSearchFilters,
  MAX_RESULTS,
} from "./searchQuery";

export {
  DEFAULT_FILTERS,
  countActiveFilters,
  type GradeFilter,
  type HadithSearchFilters,
} from "./searchQuery";

export interface HadithSearchResult {
  keys: HadithKey[];
  /** Normalized text needle for highlighting ("" for number queries). */
  needle: string;
  capped: boolean;
}

/** Null when there is nothing to search for (no query and no filters). */
export const searchHadiths = async (
  query: string,
  filters: HadithSearchFilters,
  downloadedBooks: string[],
): Promise<HadithSearchResult | null> => {
  if (!query.trim() && countActiveFilters(filters) === 0) return null;
  const built = buildSearchQuery(query, filters, downloadedBooks);
  // Criteria given but none of the selected books is downloaded.
  if (!built) return { keys: [], needle: "", capped: false };
  const db = await getHadithDb();
  const rows = await db.getAllAsync<HadithKey>(built.sql, built.params);
  return {
    keys: rows.slice(0, MAX_RESULTS),
    needle: built.needle,
    capped: rows.length > MAX_RESULTS,
  };
};
