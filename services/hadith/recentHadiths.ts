import AsyncStorage from "@react-native-async-storage/async-storage";
import type { HadithKey } from "./favorites";

const KEY = "hadith_recently_viewed_v1";
const LIMIT = 20;

/** Most recently opened first. */
export const getRecentHadiths = async (): Promise<HadithKey[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentHadith = async (key: HadithKey) => {
  const current = await getRecentHadiths();
  const next = [
    key,
    ...current.filter((k) => !(k.book === key.book && k.number === key.number)),
  ].slice(0, LIMIT);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
};

export const clearRecentHadiths = async () => {
  await AsyncStorage.removeItem(KEY);
};
