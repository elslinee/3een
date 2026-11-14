import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeArabic, parseHadithNumber } from "@/services/hadith/normalize";
import {
  getHadithsByNumbers,
  HadithRecord,
  searchBookHadithNumbers,
} from "@/services/hadith/repository";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;
const MIN_NEEDLE_LENGTH = 2;

interface SearchState {
  needle: string;
  numbers: number[];
  results: HadithRecord[];
  searching: boolean;
}

const EMPTY: SearchState = { needle: "", numbers: [], results: [], searching: false };

/** Full-text search inside one downloaded book (text or a hadith number). */
export default function useBookHadithSearch(
  bookKey: string,
  query: string,
  enabled: boolean,
) {
  const [state, setState] = useState<SearchState>(EMPTY);
  const latestId = useRef(0);
  const loadingMore = useRef(false);

  useEffect(() => {
    const trimmed = query.trim();
    const number = parseHadithNumber(trimmed);
    const needle = number === null ? normalizeArabic(trimmed) : "";
    const id = ++latestId.current;

    if (!enabled || (number === null && needle.length < MIN_NEEDLE_LENGTH)) {
      setState(EMPTY);
      return;
    }

    setState((prev) => ({ ...prev, searching: true }));
    const timer = setTimeout(async () => {
      try {
        const started = Date.now();
        const numbers =
          number !== null ? [number] : await searchBookHadithNumbers(bookKey, needle);
        const results = await getHadithsByNumbers(bookKey, numbers.slice(0, PAGE_SIZE));
        if (id !== latestId.current) return;
        console.log(
          `[Hadith] search "${trimmed}" in ${bookKey}: ${numbers.length} hits in ${Date.now() - started}ms`,
        );
        // A number that doesn't exist yields no row; drop it from the hit list.
        setState({
          needle,
          numbers: number !== null ? results.map((r) => r.number) : numbers,
          results,
          searching: false,
        });
      } catch (error) {
        console.error("[Hadith] Search failed:", error);
        if (id === latestId.current) setState(EMPTY);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [bookKey, query, enabled]);

  const loadMore = useCallback(async () => {
    if (loadingMore.current || state.results.length >= state.numbers.length) return;
    loadingMore.current = true;
    const id = latestId.current;
    try {
      const next = state.numbers.slice(
        state.results.length,
        state.results.length + PAGE_SIZE,
      );
      const more = await getHadithsByNumbers(bookKey, next);
      if (id === latestId.current) {
        setState((prev) => ({ ...prev, results: [...prev.results, ...more] }));
      }
    } finally {
      loadingMore.current = false;
    }
  }, [bookKey, state.numbers, state.results.length]);

  return {
    needle: state.needle,
    total: state.numbers.length,
    results: state.results,
    searching: state.searching,
    hasMore: state.results.length < state.numbers.length,
    loadMore,
  };
}
