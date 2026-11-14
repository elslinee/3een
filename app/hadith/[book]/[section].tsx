import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import GoBack from "@/components/GoBack";
import { toArabicDigits } from "@/components/quranScreen/utils";
import { getHadithBook } from "@/constants/hadithBooks";
import BookDownloadGate from "@/components/hadithScreen/BookDownloadGate";
import HadithCard from "@/components/hadithScreen/HadithCard";
import { getSectionHadiths, HadithRecord } from "@/services/hadith/repository";

export default function HadithSectionScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ book: string; section: string }>();
  const book = getHadithBook(params.book);
  const sectionNumber = Number(params.section);
  const section = book?.sections.find((s) => s.number === sectionNumber);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: color.background, paddingTop: insets.top },
      ]}
    >
      <GoBack />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: color.darkText }]} numberOfLines={2}>
          {section?.title ?? "الباب غير موجود"}
        </Text>
        {book && section && (
          <Text style={[styles.headerSubtitle, { color: color.darkText }]}>
            {book.title} · {toArabicDigits(section.count)} حديث
          </Text>
        )}
      </View>
      {book && section && (
        <BookDownloadGate book={book} color={color}>
          <SectionHadiths
            bookKey={book.key}
            sectionNumber={sectionNumber}
            theme={theme}
            color={color}
          />
        </BookDownloadGate>
      )}
    </View>
  );
}

function SectionHadiths({
  bookKey,
  sectionNumber,
  theme,
  color,
}: {
  bookKey: string;
  sectionNumber: number;
  theme: "light" | "dark";
  color: any;
}) {
  const router = useRouter();
  const [hadiths, setHadiths] = useState<HadithRecord[] | null>(null);

  useEffect(() => {
    let active = true;
    getSectionHadiths(bookKey, sectionNumber)
      .then((rows) => active && setHadiths(rows))
      .catch((error) => {
        console.error("[Hadith] Failed loading section:", error);
        if (active) setHadiths([]);
      });
    return () => {
      active = false;
    };
  }, [bookKey, sectionNumber]);

  const openHadith = useCallback(
    (hadith: HadithRecord) =>
      router.push({
        pathname: "/hadith/[book]/hadith/[number]",
        params: { book: bookKey, number: String(hadith.number) },
      }),
    [router, bookKey],
  );

  if (!hadiths) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={hadiths}
      keyExtractor={(item) => String(item.number)}
      renderItem={({ item }) => (
        <HadithCard hadith={item} theme={theme} color={color} onPress={openHadith} />
      )}
      contentContainerStyle={styles.listContent}
      initialNumToRender={6}
      maxToRenderPerBatch={8}
      windowSize={7}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: color.darkText }]}>
          لا توجد أحاديث في هذا الباب
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 72,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    opacity: 0.8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 15,
    fontFamily: FontFamily.medium,
  },
});
