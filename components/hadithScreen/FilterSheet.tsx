import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { FontFamily } from "@/constants/FontFamily";
import { GRADE_COLORS } from "@/constants/gradeColors";
import { HADITH_BOOKS, getHadithBook } from "@/constants/hadithBooks";
import { toArabicDigits } from "@/components/quranScreen/utils";
import {
  GRADE_CATEGORY_LABELS,
  GRADER_KEYS,
  translateGrader,
} from "@/services/hadith/grades";
import {
  DEFAULT_FILTERS,
  GradeFilter,
  HadithSearchFilters,
} from "@/services/hadith/search";

const GRADE_OPTIONS: { key: GradeFilter; label: string }[] = [
  { key: "sahih", label: GRADE_CATEGORY_LABELS.sahih },
  { key: "hasan", label: GRADE_CATEGORY_LABELS.hasan },
  { key: "daif", label: GRADE_CATEGORY_LABELS.daif },
  { key: "mawdu", label: GRADE_CATEGORY_LABELS.mawdu },
  { key: "none", label: "بدون حكم" },
];

interface FilterSheetProps {
  visible: boolean;
  filters: HadithSearchFilters;
  downloadedBooks: string[];
  theme: "light" | "dark";
  color: any;
  onApply: (filters: HadithSearchFilters) => void;
  onClose: () => void;
}

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const parseNumber = (text: string): number | null => {
  const digits = text.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).trim();
  return /^\d+(\.\d+)?$/.test(digits) ? Number(digits) : null;
};

export default function FilterSheet({
  visible,
  filters,
  downloadedBooks,
  theme,
  color,
  onApply,
  onClose,
}: FilterSheetProps) {
  const [draft, setDraft] = useState(filters);
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");

  // Start every opening from the applied filters.
  useEffect(() => {
    if (!visible) return;
    setDraft(filters);
    setFromText(filters.numberFrom !== null ? String(filters.numberFrom) : "");
    setToText(filters.numberTo !== null ? String(filters.numberTo) : "");
  }, [visible, filters]);

  const singleBook = draft.books.length === 1 ? getHadithBook(draft.books[0]) : undefined;

  const apply = () => {
    onApply({
      ...draft,
      section: singleBook ? draft.section : null,
      numberFrom: parseNumber(fromText),
      numberTo: parseNumber(toText),
    });
    onClose();
  };

  const clearAll = () => {
    setDraft(DEFAULT_FILTERS);
    setFromText("");
    setToText("");
  };

  const chip = (
    key: string,
    label: string,
    selected: boolean,
    onPress: () => void,
    options: { disabled?: boolean; palette?: { text: string; background: string } } = {},
  ) => (
    <Pressable
      key={key}
      onPress={onPress}
      disabled={options.disabled}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? options.palette?.background ?? color.primary
            : color.bg20,
          borderColor: selected ? options.palette?.text ?? color.primary : "transparent",
          opacity: options.disabled ? 0.4 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: selected
              ? options.palette?.text ?? color.white
              : color.darkText,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const sectionTitle = (title: string) => (
    <Text style={[styles.sectionTitle, { color: color.primary }]}>{title}</Text>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: color.background }]}>
        <View style={[styles.handle, { backgroundColor: color.text20 }]} />
        <Text style={[styles.title, { color: color.text }]}>تصفية النتائج</Text>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {sectionTitle("الكتب")}
          <View style={styles.chips}>
            {HADITH_BOOKS.map((book) => {
              const available = downloadedBooks.includes(book.key);
              return chip(
                book.key,
                available ? book.title : `${book.title} (غير محمّل)`,
                draft.books.includes(book.key),
                () =>
                  setDraft((d) => ({ ...d, books: toggle(d.books, book.key), section: null })),
                { disabled: !available },
              );
            })}
          </View>

          {singleBook && (
            <>
              {sectionTitle("الباب")}
              <ScrollView
                style={[styles.sectionList, { backgroundColor: color.bg20 }]}
                nestedScrollEnabled
              >
                {[{ number: null as number | null, title: "كل الأبواب" }, ...singleBook.sections].map(
                  (s) => {
                    const selected = draft.section === s.number;
                    return (
                      <Pressable
                        key={String(s.number)}
                        onPress={() => setDraft((d) => ({ ...d, section: s.number }))}
                        style={[
                          styles.sectionOption,
                          selected && { backgroundColor: color.primary20 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.sectionOptionText,
                            { color: selected ? color.primary : color.text },
                          ]}
                          numberOfLines={1}
                        >
                          {s.title}
                        </Text>
                      </Pressable>
                    );
                  },
                )}
              </ScrollView>
            </>
          )}

          {sectionTitle("الحكم")}
          <View style={styles.chips}>
            {GRADE_OPTIONS.map((g) =>
              chip(
                g.key,
                g.label,
                draft.grades.includes(g.key),
                () => setDraft((d) => ({ ...d, grades: toggle(d.grades, g.key) })),
                { palette: GRADE_COLORS[theme][g.key === "none" ? "other" : g.key] },
              ),
            )}
          </View>

          {sectionTitle("العالم الذي حكم")}
          <View style={styles.chips}>
            {GRADER_KEYS.map((grader) =>
              chip(grader, translateGrader(grader), draft.graders.includes(grader), () =>
                setDraft((d) => ({ ...d, graders: toggle(d.graders, grader) })),
              ),
            )}
          </View>

          {sectionTitle("رقم الحديث")}
          <View style={styles.rangeRow}>
            <TextInput
              style={[styles.rangeInput, { backgroundColor: color.bg20, color: color.text }]}
              placeholder="من"
              placeholderTextColor={color.text20}
              keyboardType="number-pad"
              value={fromText}
              onChangeText={setFromText}
            />
            <TextInput
              style={[styles.rangeInput, { backgroundColor: color.bg20, color: color.text }]}
              placeholder="إلى"
              placeholderTextColor={color.text20}
              keyboardType="number-pad"
              value={toText}
              onChangeText={setToText}
            />
          </View>

          {sectionTitle("أخرى")}
          <View style={styles.chips}>
            {chip("fav", "المفضلة فقط", draft.favoritesOnly, () =>
              setDraft((d) => ({ ...d, favoritesOnly: !d.favoritesOnly })),
            )}
          </View>

          {sectionTitle("الترتيب")}
          <View style={styles.chips}>
            {chip("sort-number", "حسب رقم الحديث", draft.sort === "number", () =>
              setDraft((d) => ({ ...d, sort: "number" })),
            )}
            {chip("sort-relevance", "الأقرب للبحث", draft.sort === "relevance", () =>
              setDraft((d) => ({ ...d, sort: "relevance" })),
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={apply} style={styles.footerButton}>
            <View style={[styles.button, { backgroundColor: color.primary }]}>
              <Text style={[styles.buttonText, { color: color.white }]}>تطبيق</Text>
            </View>
          </Pressable>
          <Pressable onPress={clearAll} style={styles.footerButton}>
            <View style={[styles.button, { backgroundColor: color.bg20 }]}>
              <Text style={[styles.buttonText, { color: color.text }]}>مسح الكل</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export const describeNumberRange = (from: number | null, to: number | null) => {
  if (from !== null && to !== null) return `الأرقام ${toArabicDigits(from)}–${toArabicDigits(to)}`;
  if (from !== null) return `من رقم ${toArabicDigits(from)}`;
  return `حتى رقم ${toArabicDigits(to ?? 0)}`;
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    maxHeight: "85%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: FontFamily.black,
    textAlign: "center",
    marginBottom: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    marginTop: 16,
    marginBottom: 8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 36,
    justifyContent: "center",
  },
  // Explicit lineHeight: Cairo's glyphs overflow its default line box on Android
  // and get clipped at the bottom.
  chipText: {
    fontSize: 13,
    lineHeight: 22,
    fontFamily: FontFamily.medium,
  },
  sectionList: {
    maxHeight: 220,
    borderRadius: 12,
  },
  sectionOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sectionOptionText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  rangeRow: {
    flexDirection: "row",
    gap: 12,
  },
  rangeInput: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row-reverse",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  footerButton: {
    flex: 1,
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: FontFamily.bold,
  },
});
