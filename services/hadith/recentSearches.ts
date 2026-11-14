import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "hadith_recent_searches_v1";
const LIMIT = 10;

export const getRecentSearches = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/** Most recent first, without duplicates. Returns the updated list. */
export const addRecentSearch = async (query: string): Promise<string[]> => {
  const trimmed = query.trim();
  const current = await getRecentSearches();
  if (!trimmed) return current;
  const next = [trimmed, ...current.filter((q) => q !== trimmed)].slice(0, LIMIT);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
};

export const removeRecentSearch = async (query: string): Promise<string[]> => {
  const next = (await getRecentSearches()).filter((q) => q !== query);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
};

export const clearRecentSearches = async () => {
  await AsyncStorage.removeItem(KEY);
};
