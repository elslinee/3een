import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  getFavoriteBookKeys,
  getFavoritesVersion,
  isFavoriteHadith,
  setFavoriteBook,
  setFavoriteHadith,
  subscribeToFavorites,
} from "@/services/hadith/favorites";

/** Changes whenever any favorite is added or removed, for re-querying lists. */
export const useFavoritesVersion = () =>
  useSyncExternalStore(subscribeToFavorites, getFavoritesVersion);

export function useFavoriteHadith(book: string, number: number) {
  const version = useFavoritesVersion();
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    let active = true;
    isFavoriteHadith(book, number)
      .then((value) => active && setFavorite(value))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [book, number, version]);

  const toggle = useCallback(() => {
    setFavorite((prev) => !prev);
    return setFavoriteHadith(book, number, !favorite);
  }, [book, number, favorite]);

  return { favorite, toggle };
}

export function useFavoriteBooks() {
  const version = useFavoritesVersion();
  const [keys, setKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    getFavoriteBookKeys()
      .then((value) => active && setKeys(value))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [version]);

  const toggle = useCallback(
    (key: string) => setFavoriteBook(key, !keys.has(key)),
    [keys],
  );

  return { favoriteBooks: keys, toggleFavoriteBook: toggle };
}
