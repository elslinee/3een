import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import GoBack from "@/components/GoBack";
import { toArabicDigits } from "@/components/quranScreen/utils";
import { getHadithBook, HadithSection } from "@/constants/hadithBooks";
import { normalizeArabic, parseHadithNumber } from "@/services/hadith/normalize";
import useBookDownload from "@/hooks/useBookDownload";
import useBookHadithSearch from "@/hooks/useBookHadithSearch";
import { useFavoriteBooks } from "@/hooks/useHadithFavorites";
import HeaderActions from "@/components/hadithScreen/HeaderActions";
import HadithCard from "@/components/hadithScreen/HadithCard";
import type { HadithRecord } from "@/services/hadith/repository";

type ListItem =
  | { kind: "section"; section: HadithSection }
  | { kind: "heading"; title: string }
  | { kind: "hint"; text: string }
  | { kind: "hadith"; hadith: HadithRecord };

export default function HadithBookScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { book: bookKey } = useLocalSearchParams<{ book: string }>();
  const book = getHadithBook(bookKey);
  const [query, setQuery] = useState("");
  const { downloaded, state: downloadState, start: startDownload } =
    useBookDownload(book);
  const search = useBookHadithSearch(book?.key ?? "", query, downloaded === true);
  const { favoriteBooks, toggleFavoriteBook } = useFavoriteBooks();

  const sections = useMemo(() => {
    if (!book) return [];
    const trimmed = query.trim();
    if (!trimmed) return book.sections;
    const number = parseHadithNumber(trimmed);
    if (number !== null) {
      return book.sections.filter((s) => number >= s.first && number <= s.last);
    }
    const needle = normalizeArabic(trimmed);
    return book.sections.filter((s) => normalizeArabic(s.title).includes(needle));
  }, [book, query]);

  const isSearching = query.trim().length > 0;

  const items = useMemo<ListItem[]>(() => {
    const sectionItems: ListItem[] = sections.map((section) => ({
      kind: "section",
      section,
    }));
    if (!isSearching) return sectionItems;

    const list: ListItem[] = [];
    if (sectionItems.length > 0) {
      list.push({ kind: "heading", title: "الكتب" }, ...sectionItems);
    }
    if (downloaded === false) {
      list.push({ kind: "hint", text: "حمّل الكتاب لتتمكن من البحث في نصوص الأحاديث" });
    } else if (search.total > 0) {
      list.push(
        { kind: "heading", title: `الأحاديث (${toArabicDigits(search.total)})` },
        ...search.results.map((hadith) => ({ kind: "hadith" as const, hadith })),
      );
    }
    return list;
  }, [sections, isSearching, downloaded, search.total, search.results]);

  const openHadith = useCallback(
    (hadith: HadithRecord) =>
      router.push({
        pathname: "/hadith/[book]/hadith/[number]",
        params: { book: hadith.book, number: String(hadith.number) },
      }),
    [router],
  );

  if (!book) {
    return (
      <View style={[styles.center, { backgroundColor: color.background }]}>
        <GoBack />
        <Text style={[styles.emptyText, { color: color.darkText }]}>
          الكتاب غير موجود
        </Text>
      </View>
    );
  }

  const openSection = (section: HadithSection) =>
    router.push({
      pathname: "/hadith/[book]/[section]",
      params: { book: book.key, section: String(section.number) },
    });

  const renderDownloadStatus = () => {
    if (downloaded === null) return null;
    if (downloaded) {
      return (
        <View style={styles.statusRow}>
          <MaterialIcons name="offline-pin" size={18} color={color.primary} />
          <Text style={[styles.statusText, { color: color.darkText }]}>
            متاح للقراءة بدون إنترنت
          </Text>
        </View>
      );
    }
    if (downloadState.status === "downloading" || downloadState.status === "saving") {
      return (
        <View style={[styles.note, { backgroundColor: color.bg20 }]}>
          <MaterialIcons name="downloading" size={18} color={color.primary} />
          <Text style={[styles.noteText, { color: color.darkText }]}>
            {downloadState.status === "saving"
              ? `جارٍ الحفظ… ${toArabicDigits(Math.round(downloadState.progress * 100))}٪`
              : "جارٍ تحميل الكتاب…"}
          </Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        onPress={startDownload}
        style={[styles.note, { backgroundColor: color.bg20 }]}
      >
        <MaterialIcons name="file-download" size={18} color={color.primary} />
        <Text style={[styles.noteText, { color: color.darkText }]}>
          {downloadState.status === "error"
            ? downloadState.message
            : "حمّل الكتاب للقراءة بدون إنترنت، أو افتح أي باب وسيُحمّل تلقائيًا"}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    switch (item.kind) {
      case "section":
        return renderSection(item.section);
      case "heading":
        return (
          <Text style={[styles.heading, { color: color.primary }]}>{item.title}</Text>
        );
      case "hint":
        return (
          <TouchableOpacity
            onPress={startDownload}
            style={[styles.note, { backgroundColor: color.bg20 }]}
          >
            <MaterialIcons name="file-download" size={18} color={color.primary} />
            <Text style={[styles.noteText, { color: color.darkText }]}>{item.text}</Text>
          </TouchableOpacity>
        );
      case "hadith":
        return (
          <HadithCard
            hadith={item.hadith}
            theme={theme}
            color={color}
            onPress={openHadith}
            highlight={search.needle || undefined}
          />
        );
    }
  };

  const renderSection = (item: HadithSection) => (
    <TouchableOpacity
      onPress={() => openSection(item)}
      style={[styles.sectionRow, { backgroundColor: color.bg20 }]}
    >
      <View style={[styles.sectionIndex, { backgroundColor: color.primary20 }]}>
        <Text style={[styles.sectionIndexText, { color: color.primary }]}>
          {toArabicDigits(book.sections.indexOf(item) + 1)}
        </Text>
      </View>
      <View style={styles.sectionBody}>
        <Text style={[styles.sectionTitle, { color: color.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.sectionMeta, { color: color.darkText }]}>
          الأحاديث {toArabicDigits(item.first)} – {toArabicDigits(item.last)} ·{" "}
          {toArabicDigits(item.count)} حديث
        </Text>
      </View>
      <MaterialIcons name="chevron-left" size={22} color={color.text20} />
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: color.background, paddingTop: insets.top },
      ]}
    >
      <GoBack />
      <HeaderActions
        color={color}
        actions={[
          {
            icon: favoriteBooks.has(book.key) ? "star" : "star-border",
            active: favoriteBooks.has(book.key),
            accessibilityLabel: "إضافة الكتاب للمفضلة",
            onPress: () => toggleFavoriteBook(book.key),
          },
          {
            icon: "manage-search",
            accessibilityLabel: "بحث متقدم",
            onPress: () =>
              router.push({ pathname: "/hadith/search", params: { book: book.key } }),
          },
        ]}
      />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, styles.titleBesideActions, { color: color.darkText }]}>
          {book.title}
        </Text>
        <Text style={[styles.headerSubtitle, { color: color.darkText }]}>
          {book.author}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, index) =>
          item.kind === "section"
            ? `s-${item.section.number}`
            : item.kind === "hadith"
              ? `h-${item.hadith.number}`
              : `${item.kind}-${index}`
        }
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={search.hasMore ? search.loadMore : undefined}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          search.searching || search.hasMore ? (
            <ActivityIndicator style={styles.footer} color={color.primary} />
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {renderDownloadStatus()}
            {!book.hasGrades && (
              <View style={[styles.note, { backgroundColor: color.primary20 }]}>
                <MaterialIcons name="info-outline" size={18} color={color.primary} />
                <Text style={[styles.noteText, { color: color.darkText }]}>
                  لا تتضمن بيانات المصدر أحكامًا على أحاديث هذا الكتاب.
                </Text>
              </View>
            )}
            <View
              style={[styles.searchContainer, { backgroundColor: `${color.text20}22` }]}
            >
              <EvilIcons
                name="search"
                size={28}
                color={query.length > 0 ? color.primary : color.text20}
              />
              <TextInput
                style={[styles.searchInput, { color: color.text }]}
                placeholder="ابحث في الأحاديث أو برقم الحديث..."
                placeholderTextColor={color.text20}
                selectionColor={color.primary}
                value={query}
                onChangeText={setQuery}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")} style={styles.clearButton}>
                  <FontAwesome5 name="times" size={15} color={color.text20} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          search.searching ? null : (
            <Text style={[styles.emptyText, { color: color.darkText }]}>
              لا توجد نتائج مطابقة
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    opacity: 0.8,
    paddingHorizontal: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },
  listHeader: {
    gap: 12,
    marginBottom: 4,
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    padding: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FontFamily.medium,
  },
  // Keep the title clear of the back button and the two header actions.
  titleBesideActions: {
    marginHorizontal: 96,
  },
  heading: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    marginTop: 8,
  },
  footer: {
    marginVertical: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    opacity: 0.8,
  },
  searchContainer: {
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
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: 14,
  },
  sectionIndex: {
    width: 40,
    height: 40,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionIndexText: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
  },
  sectionBody: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
  },
  sectionMeta: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    opacity: 0.7,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 15,
    fontFamily: FontFamily.medium,
  },
});
