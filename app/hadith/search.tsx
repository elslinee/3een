import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import GoBack from "@/components/GoBack";
import { toArabicDigits } from "@/components/quranScreen/utils";
import { getHadithBook } from "@/constants/hadithBooks";
import HadithCard from "@/components/hadithScreen/HadithCard";
import FilterSheet, { describeNumberRange } from "@/components/hadithScreen/FilterSheet";
import { useFavoritesVersion } from "@/hooks/useHadithFavorites";
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  HadithSearchFilters,
  searchHadiths,
} from "@/services/hadith/search";
import {
  getDownloadedBookKeys,
  getHadithsByKeys,
  HadithRecord,
} from "@/services/hadith/repository";
import type { HadithKey } from "@/services/hadith/favorites";
import { GRADE_CATEGORY_LABELS, translateGrader } from "@/services/hadith/grades";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from "@/services/hadith/recentSearches";
import { clearRecentHadiths, getRecentHadiths } from "@/services/hadith/recentHadiths";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

interface Results {
  keys: HadithKey[];
  records: HadithRecord[];
  needle: string;
  capped: boolean;
}

export default function HadithSearchScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ book?: string }>();
  const favoritesVersion = useFavoritesVersion();

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<HadithSearchFilters>(() => ({
    ...DEFAULT_FILTERS,
    books: params.book ? [params.book] : [],
  }));
  const [sheetVisible, setSheetVisible] = useState(false);
  const [downloaded, setDownloaded] = useState<string[] | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [results, setResults] = useState<Results | null>(null);
  const [searching, setSearching] = useState(false);
  const [recentKeys, setRecentKeys] = useState<HadithKey[]>([]);
  const [recentHadiths, setRecentHadiths] = useState<HadithRecord[]>([]);
  const latestId = useRef(0);
  const loadingMore = useRef(false);

  // Choosing books only scopes the search; something to look for (text or another
  // filter) is needed before listing results, otherwise show recent activity.
  const hasCriteria =
    query.trim().length > 0 || countActiveFilters({ ...filters, books: [] }) > 0;

  useFocusEffect(
    useCallback(() => {
      getDownloadedBookKeys()
        .then((keys) => setDownloaded([...keys]))
        .catch(() => setDownloaded([]));
      getRecentSearches().then(setRecent);
      getRecentHadiths().then(setRecentKeys);
    }, []),
  );

  // Recently viewed hadiths, limited to the books in scope.
  useEffect(() => {
    let active = true;
    const scoped =
      filters.books.length > 0
        ? recentKeys.filter((k) => filters.books.includes(k.book))
        : recentKeys;
    getHadithsByKeys(scoped)
      .then((records) => active && setRecentHadiths(records))
      .catch(() => active && setRecentHadiths([]));
    return () => {
      active = false;
    };
  }, [recentKeys, filters.books]);

  useEffect(() => {
    if (downloaded === null) return;
    const id = ++latestId.current;
    if (!hasCriteria) {
      setResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchHadiths(query, filters, downloaded);
        const keys = found?.keys ?? [];
        const records = await getHadithsByKeys(keys.slice(0, PAGE_SIZE));
        if (id !== latestId.current) return;
        setResults({
          keys,
          records,
          needle: found?.needle ?? "",
          capped: found?.capped ?? false,
        });
      } catch (error) {
        console.error("[Hadith] Global search failed:", error);
        if (id === latestId.current) setResults({ keys: [], records: [], needle: "", capped: false });
      } finally {
        if (id === latestId.current) setSearching(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // favoritesVersion: re-run so "favorites only" reflects changes made elsewhere.
  }, [query, filters, downloaded, favoritesVersion, hasCriteria]);

  const loadMore = useCallback(async () => {
    if (!results || loadingMore.current || results.records.length >= results.keys.length) return;
    loadingMore.current = true;
    const id = latestId.current;
    try {
      const next = results.keys.slice(results.records.length, results.records.length + PAGE_SIZE);
      const more = await getHadithsByKeys(next);
      if (id === latestId.current) {
        setResults((prev) => (prev ? { ...prev, records: [...prev.records, ...more] } : prev));
      }
    } finally {
      loadingMore.current = false;
    }
  }, [results]);

  const rememberQuery = useCallback(() => {
    if (query.trim()) addRecentSearch(query).then(setRecent);
  }, [query]);

  const openHadith = useCallback(
    (hadith: HadithRecord) => {
      rememberQuery();
      router.push({
        pathname: "/hadith/[book]/hadith/[number]",
        params: { book: hadith.book, number: String(hadith.number) },
      });
    },
    [router, rememberQuery],
  );

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; remove: () => void }[] = [];
    for (const key of filters.books) {
      chips.push({
        key: `book-${key}`,
        label: getHadithBook(key)?.title ?? key,
        remove: () =>
          setFilters((f) => ({ ...f, books: f.books.filter((b) => b !== key), section: null })),
      });
    }
    if (filters.section !== null && filters.books.length === 1) {
      const section = getHadithBook(filters.books[0])?.sections.find(
        (s) => s.number === filters.section,
      );
      chips.push({
        key: "section",
        label: section?.title ?? "الباب",
        remove: () => setFilters((f) => ({ ...f, section: null })),
      });
    }
    for (const grade of filters.grades) {
      chips.push({
        key: `grade-${grade}`,
        label: grade === "none" ? "بدون حكم" : GRADE_CATEGORY_LABELS[grade],
        remove: () => setFilters((f) => ({ ...f, grades: f.grades.filter((g) => g !== grade) })),
      });
    }
    for (const grader of filters.graders) {
      chips.push({
        key: `grader-${grader}`,
        label: translateGrader(grader),
        remove: () =>
          setFilters((f) => ({ ...f, graders: f.graders.filter((g) => g !== grader) })),
      });
    }
    if (filters.numberFrom !== null || filters.numberTo !== null) {
      chips.push({
        key: "range",
        label: describeNumberRange(filters.numberFrom, filters.numberTo),
        remove: () => setFilters((f) => ({ ...f, numberFrom: null, numberTo: null })),
      });
    }
    if (filters.favoritesOnly) {
      chips.push({
        key: "fav",
        label: "المفضلة فقط",
        remove: () => setFilters((f) => ({ ...f, favoritesOnly: false })),
      });
    }
    return chips;
  }, [filters]);

  const filterCount = countActiveFilters(filters);
  const showRecent = !hasCriteria;

  const subtitleFor = (hadith: HadithRecord) => {
    const book = getHadithBook(hadith.book);
    const section = book?.sections.find((s) => s.number === hadith.section);
    return [book?.title, section?.title].filter(Boolean).join(" · ");
  };

  const renderEmpty = () => {
    if (searching || downloaded === null) return null;
    if (downloaded.length === 0) {
      return (
        <View style={styles.emptyBox}>
          <MaterialIcons name="cloud-download" size={44} color={color.text20} />
          <Text style={[styles.emptyText, { color: color.darkText }]}>
            البحث يعمل على الكتب المحمّلة فقط. افتح أي كتاب من المكتبة ليتم تحميله.
          </Text>
          <Pressable onPress={() => router.back()}>
            <View style={[styles.emptyButton, { backgroundColor: color.primary }]}>
              <Text style={[styles.emptyButtonText, { color: color.white }]}>العودة للمكتبة</Text>
            </View>
          </Pressable>
        </View>
      );
    }
    if (showRecent) {
      return recent.length === 0 ? (
        <View style={styles.emptyBox}>
          <EvilIcons name="search" size={64} color={color.text20} />
          <Text style={[styles.emptyText, { color: color.darkText }]}>
            اكتب كلمة أو جزءًا من حديث أو رقمه للبحث
          </Text>
        </View>
      ) : null;
    }
    return (
      <View style={styles.emptyBox}>
        <EvilIcons name="search" size={64} color={color.text20} />
        <Text style={[styles.emptyText, { color: color.darkText }]}>لا توجد نتائج مطابقة</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: color.background, paddingTop: insets.top }]}>
      <GoBack />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: color.darkText }]}>البحث في الأحاديث</Text>
        {downloaded !== null && downloaded.length > 0 && (
          <Text style={[styles.headerSubtitle, { color: color.darkText }]}>
            في {toArabicDigits(downloaded.length)} من الكتب المحمّلة
          </Text>
        )}
      </View>

      <View style={styles.searchRow}>
        <View style={[styles.searchContainer, { backgroundColor: `${color.text20}22` }]}>
          <EvilIcons
            name="search"
            size={28}
            color={query.length > 0 ? color.primary : color.text20}
          />
          <TextInput
            style={[styles.searchInput, { color: color.text }]}
            placeholder="كلمة، جزء من حديث، أو رقم..."
            placeholderTextColor={color.text20}
            selectionColor={color.primary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={rememberQuery}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} style={styles.clearButton}>
              <FontAwesome5 name="times" size={15} color={color.text20} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setSheetVisible(true)}
          style={[
            styles.filterButton,
            { backgroundColor: filterCount > 0 ? color.primary : `${color.text20}22` },
          ]}
          accessibilityLabel="تصفية النتائج"
        >
          <MaterialIcons
            name="tune"
            size={22}
            color={filterCount > 0 ? color.white : color.darkText}
          />
          {filterCount > 0 && (
            <Text style={[styles.filterCount, { color: color.white }]}>
              {toArabicDigits(filterCount)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {activeChips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {activeChips.map((chip) => (
            <Pressable
              key={chip.key}
              onPress={chip.remove}
              style={[styles.activeChip, { backgroundColor: color.primary20 }]}
            >
              <Text style={[styles.activeChipText, { color: color.primary }]}>{chip.label}</Text>
              <FontAwesome5 name="times" size={11} color={color.primary} />
            </Pressable>
          ))}
          <Pressable
            onPress={() => setFilters(DEFAULT_FILTERS)}
            style={[styles.activeChip, { backgroundColor: color.bg20 }]}
          >
            <Text style={[styles.activeChipText, { color: color.darkText }]}>مسح الكل</Text>
          </Pressable>
        </ScrollView>
      )}

      <FlatList
        data={showRecent ? recentHadiths : results?.records ?? []}
        keyExtractor={(item) => `${item.book}|${item.number}`}
        renderItem={({ item }) => (
          <HadithCard
            hadith={item}
            theme={theme}
            color={color}
            onPress={openHadith}
            highlight={showRecent ? undefined : results?.needle || undefined}
            subtitle={subtitleFor(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onEndReached={showRecent ? undefined : loadMore}
        onEndReachedThreshold={0.6}
        initialNumToRender={6}
        windowSize={7}
        ListHeaderComponent={
          showRecent ? (
            <View style={styles.recentBlock}>
              {recent.length > 0 && (
                <View>
                  <View style={styles.recentHeader}>
                    <Text style={[styles.recentTitle, { color: color.primary }]}>
                      عمليات البحث الأخيرة
                    </Text>
                    <TouchableOpacity
                      onPress={() => clearRecentSearches().then(() => setRecent([]))}
                    >
                      <Text style={[styles.recentClear, { color: color.darkText }]}>مسح</Text>
                    </TouchableOpacity>
                  </View>
                  {recent.map((item) => (
                    <View key={item} style={styles.recentRow}>
                      <TouchableOpacity style={styles.recentItem} onPress={() => setQuery(item)}>
                        <MaterialIcons name="history" size={18} color={color.text20} />
                        <Text style={[styles.recentText, { color: color.text }]} numberOfLines={1}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeRecentSearch(item).then(setRecent)}
                        style={styles.clearButton}
                      >
                        <FontAwesome5 name="times" size={13} color={color.text20} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {recentHadiths.length > 0 && (
                <View style={styles.recentHeader}>
                  <Text style={[styles.recentTitle, { color: color.primary }]}>
                    شاهدتها مؤخرًا
                  </Text>
                  <TouchableOpacity
                    onPress={() => clearRecentHadiths().then(() => setRecentKeys([]))}
                  >
                    <Text style={[styles.recentClear, { color: color.darkText }]}>مسح</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : results && results.keys.length > 0 ? (
            <Text style={[styles.resultCount, { color: color.primary }]}>
              {results.capped
                ? `أكثر من ${toArabicDigits(results.keys.length)} نتيجة`
                : `${toArabicDigits(results.keys.length)} نتيجة`}
            </Text>
          ) : null
        }
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={
          !showRecent &&
          (searching || (results && results.records.length < results.keys.length)) ? (
            <ActivityIndicator style={styles.footer} color={color.primary} />
          ) : null
        }
      />

      <FilterSheet
        visible={sheetVisible}
        filters={filters}
        downloadedBooks={downloaded ?? []}
        theme={theme}
        color={color}
        onApply={setFilters}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 72,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    opacity: 0.8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    textAlign: "right",
  },
  clearButton: {
    padding: 6,
  },
  filterButton: {
    height: 50,
    minWidth: 50,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
  },
  filterCount: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
  },
  chipsScroll: {
    flexGrow: 0,
    marginTop: 12,
    marginBottom: 12,
  },
  chipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    gap: 8,
    alignItems: "center",
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 99,
    paddingHorizontal: 14,
    height: 34,
  },
  // Explicit lineHeight: Cairo's glyphs overflow its default line box on Android
  // and get clipped at the bottom.
  activeChipText: {
    fontSize: 13,
    lineHeight: 22,
    fontFamily: FontFamily.medium,
  },
  recentBlock: {
    gap: 12,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  recentTitle: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
  },
  recentClear: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    opacity: 0.7,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  recentText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
  resultCount: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
  },
  footer: {
    marginVertical: 16,
  },
  emptyBox: {
    alignItems: "center",
    gap: 12,
    marginTop: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
    textAlign: "center",
    lineHeight: 24,
  },
  emptyButton: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyButtonText: {
    fontFamily: FontFamily.bold,
  },
});
