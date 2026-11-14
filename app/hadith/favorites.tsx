import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import GoBack from "@/components/GoBack";
import { toArabicDigits } from "@/components/quranScreen/utils";
import { getHadithBook, HADITH_BOOKS } from "@/constants/hadithBooks";
import HadithCard from "@/components/hadithScreen/HadithCard";
import { useFavoriteBooks, useFavoritesVersion } from "@/hooks/useHadithFavorites";
import { getFavoriteHadithKeys } from "@/services/hadith/favorites";
import { getHadithsByKeys, HadithRecord } from "@/services/hadith/repository";

export default function HadithFavoritesScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const version = useFavoritesVersion();
  const { favoriteBooks } = useFavoriteBooks();
  const [hadiths, setHadiths] = useState<HadithRecord[] | null>(null);

  useEffect(() => {
    let active = true;
    getFavoriteHadithKeys()
      .then(getHadithsByKeys)
      .then((records) => active && setHadiths(records))
      .catch((error) => {
        console.error("[Hadith] Failed loading favorites:", error);
        if (active) setHadiths([]);
      });
    return () => {
      active = false;
    };
  }, [version]);

  const openHadith = useCallback(
    (hadith: HadithRecord) =>
      router.push({
        pathname: "/hadith/[book]/hadith/[number]",
        params: { book: hadith.book, number: String(hadith.number) },
      }),
    [router],
  );

  const books = HADITH_BOOKS.filter((b) => favoriteBooks.has(b.key));
  const isEmpty = hadiths !== null && hadiths.length === 0 && books.length === 0;

  const subtitleFor = (hadith: HadithRecord) => {
    const book = getHadithBook(hadith.book);
    const section = book?.sections.find((s) => s.number === hadith.section);
    return [book?.title, section?.title].filter(Boolean).join(" · ");
  };

  return (
    <View style={[styles.container, { backgroundColor: color.background, paddingTop: insets.top }]}>
      <GoBack />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: color.darkText }]}>المفضلة</Text>
        <Text style={[styles.headerSubtitle, { color: color.darkText }]}>
          الكتب والأحاديث المحفوظة
        </Text>
      </View>

      {hadiths === null ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      ) : isEmpty ? (
        <View style={styles.center}>
          <MaterialIcons name="favorite-border" size={56} color={color.text20} />
          <Text style={[styles.emptyTitle, { color: color.darkText }]}>لا توجد عناصر محفوظة</Text>
          <Text style={[styles.emptyText, { color: color.darkText }]}>
            اضغط على أيقونة القلب في صفحة أي حديث، أو النجمة في صفحة أي كتاب لإضافته هنا.
          </Text>
        </View>
      ) : (
        <FlatList
          data={hadiths}
          keyExtractor={(item) => `${item.book}|${item.number}`}
          renderItem={({ item }) => (
            <HadithCard
              hadith={item}
              theme={theme}
              color={color}
              onPress={openHadith}
              subtitle={subtitleFor(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {books.length > 0 && (
                <>
                  <Text style={[styles.groupTitle, { color: color.primary }]}>الكتب</Text>
                  {books.map((book) => (
                    <TouchableOpacity
                      key={book.key}
                      onPress={() =>
                        router.push({ pathname: "/hadith/[book]", params: { book: book.key } })
                      }
                      style={[styles.bookRow, { backgroundColor: color.bg20 }]}
                    >
                      <MaterialIcons name="star" size={22} color={color.primary} />
                      <View style={styles.bookBody}>
                        <Text style={[styles.bookTitle, { color: color.text }]}>{book.title}</Text>
                        <Text style={[styles.bookMeta, { color: color.darkText }]}>
                          {toArabicDigits(book.hadithCount)} حديث
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-left" size={22} color={color.text20} />
                    </TouchableOpacity>
                  ))}
                </>
              )}
              {hadiths.length > 0 && (
                <Text style={[styles.groupTitle, { color: color.primary }]}>
                  الأحاديث ({toArabicDigits(hadiths.length)})
                </Text>
              )}
            </View>
          }
        />
      )}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  listHeader: {
    gap: 10,
  },
  groupTitle: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    marginTop: 4,
  },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: 14,
  },
  bookBody: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
  },
  bookMeta: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    opacity: 0.7,
  },
});
