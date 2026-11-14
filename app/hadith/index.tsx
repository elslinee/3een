import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import GoBack from "@/components/GoBack";
import { toArabicDigits } from "@/components/quranScreen/utils";
import {
  HADITH_BOOKS,
  HADITH_BOOK_GROUPS,
  HadithBook,
} from "@/constants/hadithBooks";
import { getDownloadedBookKeys } from "@/services/hadith/repository";
import HeaderActions from "@/components/hadithScreen/HeaderActions";
import { useFavoriteBooks } from "@/hooks/useHadithFavorites";

const TOTAL_HADITHS = HADITH_BOOKS.reduce((sum, b) => sum + b.hadithCount, 0);

export default function HadithLibraryScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [downloadedKeys, setDownloadedKeys] = useState<Set<string>>(new Set());

  // Refresh on focus: a book may have been downloaded from its own screen.
  useFocusEffect(
    useCallback(() => {
      getDownloadedBookKeys()
        .then(setDownloadedKeys)
        .catch(() => {});
    }, []),
  );

  const { favoriteBooks } = useFavoriteBooks();

  const openBook = (book: HadithBook) =>
    router.push({ pathname: "/hadith/[book]", params: { book: book.key } });

  const favorites = HADITH_BOOKS.filter((b) => favoriteBooks.has(b.key));
  const groups = [
    ...(favorites.length > 0
      ? [{ key: "favorites", title: "المفضلة", books: favorites }]
      : []),
    ...HADITH_BOOK_GROUPS.map((g) => ({
      ...g,
      books: HADITH_BOOKS.filter((b) => b.group === g.key),
    })),
  ];

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
            icon: "favorite-border",
            accessibilityLabel: "المفضلة",
            onPress: () => router.push("/hadith/favorites"),
          },
          {
            icon: "search",
            accessibilityLabel: "البحث في الأحاديث",
            onPress: () => router.push("/hadith/search"),
          },
        ]}
      />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: color.darkText }]}>
          مكتبة الحديث
        </Text>
        <Text style={[styles.headerSubtitle, { color: color.darkText }]}>
          {toArabicDigits(HADITH_BOOKS.length)} كتب ·{" "}
          {toArabicDigits(TOTAL_HADITHS)} حديث
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {groups.map(({ books, ...group }) => {
          if (books.length === 0) return null;
          return (
            <View key={group.key} style={styles.group}>
              <Text style={[styles.groupTitle, { color: color.primary }]}>
                {group.title}
              </Text>
              <View style={styles.cards}>
                {books.map((book) => (
                  <TouchableOpacity
                    key={book.key}
                    onPress={() => openBook(book)}
                    style={[styles.card, { backgroundColor: color.bg20 }]}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: color.primary20 },
                      ]}
                    >
                      <MaterialIcons
                        name="menu-book"
                        size={26}
                        color={color.primary}
                      />
                    </View>
                    <View style={styles.cardBody}>
                      <Text
                        style={[styles.cardTitle, { color: color.text }]}
                        numberOfLines={1}
                      >
                        {book.title}
                      </Text>
                      <Text
                        style={[styles.cardAuthor, { color: color.darkText }]}
                        numberOfLines={1}
                      >
                        {book.author}
                      </Text>
                      <View style={styles.metaRow}>
                        <Text style={[styles.cardMeta, { color: color.primary }]}>
                          {toArabicDigits(book.hadithCount)} حديث ·{" "}
                          {toArabicDigits(book.sections.length)} كتاب
                        </Text>
                        {downloadedKeys.has(book.key) && (
                          <View style={styles.offline}>
                            <MaterialIcons
                              name="offline-pin"
                              size={14}
                              color={color.primary}
                            />
                            <Text style={[styles.cardMeta, { color: color.primary }]}>
                              متاح بدون إنترنت
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <MaterialIcons
                      name="chevron-left"
                      size={24}
                      color={color.text20}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    opacity: 0.8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
  },
  cards: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
  cardAuthor: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: 10,
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  offline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
});
