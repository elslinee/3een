import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { HadithBook } from "@/constants/hadithBooks";
import {
  downloadBook,
  getDownloadState,
  subscribeToDownloads,
} from "@/services/hadith/download";
import { isBookDownloaded } from "@/services/hadith/repository";

/** Download status of one book; `downloaded` is null until the database has been checked. */
export default function useBookDownload(book: HadithBook | undefined) {
  const key = book?.key ?? "";
  const state = useSyncExternalStore(subscribeToDownloads, () =>
    getDownloadState(key),
  );
  const [downloaded, setDownloaded] = useState<boolean | null>(null);

  useEffect(() => {
    if (!key) return;
    let active = true;
    isBookDownloaded(key)
      .then((value) => active && setDownloaded(value))
      .catch(() => active && setDownloaded(false));
    return () => {
      active = false;
    };
  }, [key]);

  const start = useCallback(async () => {
    if (!book) return false;
    const ok = await downloadBook(book);
    if (ok) setDownloaded(true);
    return ok;
  }, [book]);

  return { downloaded, state, start };
}
