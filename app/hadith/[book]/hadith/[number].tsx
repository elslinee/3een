import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Share,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import GoBack from "@/components/GoBack";
import { toArabicDigits } from "@/components/quranScreen/utils";
import { getHadithBook, HadithBook } from "@/constants/hadithBooks";
import BookDownloadGate from "@/components/hadithScreen/BookDownloadGate";
import GradeBadge from "@/components/hadithScreen/GradeBadge";
import { useFavoriteHadith } from "@/hooks/useHadithFavorites";
import { addRecentHadith } from "@/services/hadith/recentHadiths";
import {
  getAdjacentNumbers,
  getHadith,
  HadithRecord,
} from "@/services/hadith/repository";
import {
  meaningfulGrades,
  translateGrade,
  translateGrader,
} from "@/services/hadith/grades";

export default function HadithDetailsScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ book: string; number: string }>();
  const book = getHadithBook(params.book);
  const number = Number(params.number);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: color.background, paddingTop: insets.top },
      ]}
    >
      <GoBack />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: color.darkText }]}>
          {book ? book.title : "الكتاب غير موجود"}
        </Text>
        <Text style={[styles.headerSubtitle, { color: color.darkText }]}>
          حديث رقم {toArabicDigits(number)}
        </Text>
      </View>
      {book && (
        <BookDownloadGate book={book} color={color}>
          <HadithDetails book={book} number={number} theme={theme} color={color} />
        </BookDownloadGate>
      )}
    </View>
  );
}

function HadithDetails({
  book,
  number,
  theme,
  color,
}: {
  book: HadithBook;
  number: number;
  theme: "light" | "dark";
  color: any;
}) {
  const router = useRouter();
  const [hadith, setHadith] = useState<HadithRecord | null | undefined>(undefined);
  const [adjacent, setAdjacent] = useState<{ previous: number | null; next: number | null }>({
    previous: null,
    next: null,
  });
  const [copied, setCopied] = useState(false);
  const { favorite, toggle: toggleFavorite } = useFavoriteHadith(book.key, number);

  useEffect(() => {
    let active = true;
    Promise.all([getHadith(book.key, number), getAdjacentNumbers(book.key, number)])
      .then(([record, around]) => {
        if (!active) return;
        setHadith(record);
        setAdjacent(around);
        if (record) addRecentHadith({ book: book.key, number }).catch(() => {});
      })
      .catch((error) => {
        console.error("[Hadith] Failed loading hadith:", error);
        if (active) setHadith(null);
      });
    return () => {
      active = false;
    };
  }, [book.key, number]);

  if (hadith === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  if (hadith === null) {
    return (
      <View style={styles.center}>
        <Text style={[styles.emptyText, { color: color.darkText }]}>
          الحديث غير موجود في هذا الكتاب
        </Text>
      </View>
    );
  }

  const section = book.sections.find((s) => s.number === hadith.section);
  const grades = meaningfulGrades(hadith.grades);
  const hasText = hadith.text.trim().length > 0;
  const source = [book.title, section?.title, `حديث رقم ${hadith.number}`]
    .filter(Boolean)
    .join(" · ");

  const shareText = () =>
    [
      hadith.text.trim(),
      "",
      source,
      ...grades.map((g) => `${translateGrade(g.grade)} (${translateGrader(g.grader)})`),
    ].join("\n");

  const handleCopy = async () => {
    await Clipboard.setStringAsync(shareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = () => Share.share({ message: shareText() });

  const goTo = (target: number | null) => {
    if (target === null) return;
    router.replace({
      pathname: "/hadith/[book]/hadith/[number]",
      params: { book: book.key, number: String(target) },
    });
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.textCard, { backgroundColor: color.bg20 }]}>
          {hasText ? (
            <Text selectable style={[styles.hadithText, { color: color.text }]}>
              {hadith.text}
            </Text>
          ) : (
            <Text style={[styles.emptyText, { color: color.darkText }]}>
              لا يتوفر نص هذا الحديث في المصدر
            </Text>
          )}
        </View>

        {grades.length > 0 && (
          <View style={styles.block}>
            <Text style={[styles.blockTitle, { color: color.primary }]}>الحكم</Text>
            <View style={[styles.gradesCard, { backgroundColor: color.bg20 }]}>
              {grades.map((g, i) => (
                <GradeBadge key={`${g.grader}-${i}`} grade={g} theme={theme} color={color} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.block}>
          <Text style={[styles.blockTitle, { color: color.primary }]}>المصدر</Text>
          <Text style={[styles.sourceText, { color: color.darkText }]}>
            {book.title}
            {section ? ` · ${section.title}` : ""} · حديث رقم {toArabicDigits(hadith.number)}
          </Text>
        </View>

        <View style={styles.actions}>
          <ActionButton
            icon={favorite ? "favorite" : "favorite-border"}
            label="المفضلة"
            color={color}
            onPress={toggleFavorite}
          />
          <ActionButton
            icon={copied ? "check" : "content-copy"}
            label={copied ? "تم النسخ" : "نسخ"}
            color={color}
            onPress={handleCopy}
            disabled={!hasText}
          />
          <ActionButton
            icon="share"
            label="مشاركة"
            color={color}
            onPress={handleShare}
            disabled={!hasText}
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.navBar,
          { borderTopColor: `${color.text20}33` },
        ]}
      >
        <NavButton
          label="الحديث السابق"
          icon="chevron-right"
          color={color}
          disabled={adjacent.previous === null}
          onPress={() => goTo(adjacent.previous)}
        />
        <NavButton
          label="الحديث التالي"
          icon="chevron-left"
          iconAfter
          color={color}
          disabled={adjacent.next === null}
          onPress={() => goTo(adjacent.next)}
        />
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
  disabled,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  color: any;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={styles.actionWrapper}
      android_ripple={{ color: color.primary20 }}
    >
      <View
        style={[
          styles.actionButton,
          { backgroundColor: color.primary20, opacity: disabled ? 0.5 : 1 },
        ]}
      >
        <MaterialIcons name={icon} size={20} color={color.primary} />
        <Text style={[styles.actionText, { color: color.primary }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

function NavButton({
  label,
  icon,
  iconAfter,
  color,
  disabled,
  onPress,
}: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconAfter?: boolean;
  color: any;
  disabled: boolean;
  onPress: () => void;
}) {
  const iconNode = <MaterialIcons name={icon} size={22} color={color.primary} />;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.navButton, { opacity: disabled ? 0.35 : 1 }]}
    >
      {!iconAfter && iconNode}
      <Text style={[styles.navText, { color: color.primary }]}>{label}</Text>
      {iconAfter && iconNode}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
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
    padding: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 20,
  },
  textCard: {
    borderRadius: 12,
    padding: 20,
  },
  hadithText: {
    fontSize: 24,
    lineHeight: 44,
    fontFamily: FontFamily.quran,
    // RN swaps left/right under RTL layout, so "right" would render left-aligned.
    textAlign: "justify",
    writingDirection: "rtl",
  },
  block: {
    gap: 8,
  },
  blockTitle: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
  },
  gradesCard: {
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  sourceText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionWrapper: {
    flex: 1,
  },
  actionButton: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 6,
  },
  actionText: {
    fontSize: 12,
    fontFamily: FontFamily.bold,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  navText: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    fontFamily: FontFamily.medium,
  },
});
