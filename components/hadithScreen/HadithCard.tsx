import React, { memo, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontFamily } from "@/constants/FontFamily";
import { toArabicDigits } from "@/components/quranScreen/utils";
import { primaryGrade, meaningfulGrades } from "@/services/hadith/grades";
import { findMatchRanges } from "@/services/hadith/normalize";
import type { HadithRecord } from "@/services/hadith/repository";
import GradeBadge from "./GradeBadge";
import HighlightedText from "./HighlightedText";

interface HadithCardProps {
  hadith: HadithRecord;
  theme: "light" | "dark";
  color: any;
  onPress: (hadith: HadithRecord) => void;
  /** Normalized search needle: shows a highlighted excerpt around the first match. */
  highlight?: string;
  /** e.g. book and section, for lists that mix books. */
  subtitle?: string;
}

const SNIPPET_BEFORE = 90;
const SNIPPET_AFTER = 220;

const WORD_BREAK = /[\s،,.؛:"'()«»\-]/;

// Highlight whole words: splitting a word across styled spans breaks Arabic letter
// joining on Android (e.g. "بِ" detaches from "النِّيَّاتِ").
const expandToWords = (text: string, ranges: [number, number][]) => {
  const expanded: [number, number][] = [];
  for (const [s, e] of ranges) {
    let start = s;
    let end = e;
    while (start > 0 && !WORD_BREAK.test(text[start - 1])) start--;
    while (end < text.length && !WORD_BREAK.test(text[end])) end++;
    const last = expanded[expanded.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else expanded.push([start, end]);
  }
  return expanded;
};

// Cut the text around the first match (on word boundaries) so the match is visible
// even when it sits deep inside a long hadith.
const buildSnippet = (text: string, needle: string) => {
  const ranges = expandToWords(text, findMatchRanges(text, needle));
  if (ranges.length === 0) return null;
  let start = Math.max(0, ranges[0][0] - SNIPPET_BEFORE);
  let end = Math.min(text.length, ranges[0][1] + SNIPPET_AFTER);
  if (start > 0) {
    const space = text.indexOf(" ", start);
    if (space !== -1 && space < ranges[0][0]) start = space + 1;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(" ", end);
    if (space > ranges[0][1]) end = space;
  }
  const prefix = start > 0 ? "… " : "";
  const suffix = end < text.length ? " …" : "";
  const shift = prefix.length - start;
  return {
    text: prefix + text.slice(start, end) + suffix,
    ranges: ranges
      .filter(([s, e]) => s >= start && e <= end)
      .map(([s, e]) => [s + shift, e + shift] as [number, number]),
  };
};

function HadithCard({
  hadith,
  theme,
  color,
  onPress,
  highlight,
  subtitle,
}: HadithCardProps) {
  const grade = primaryGrade(hadith.grades);
  const otherGrades = meaningfulGrades(hadith.grades).length - (grade ? 1 : 0);
  const hasText = hadith.text.trim().length > 0;
  const snippet = useMemo(
    () => (highlight && hasText ? buildSnippet(hadith.text, highlight) : null),
    [hadith.text, highlight, hasText],
  );

  return (
    <TouchableOpacity
      onPress={() => onPress(hadith)}
      style={[styles.card, { backgroundColor: color.bg20 }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.number, { backgroundColor: color.primary20 }]}>
          <Text style={[styles.numberText, { color: color.primary }]}>
            {toArabicDigits(hadith.number)}
          </Text>
        </View>
        {subtitle && (
          <Text style={[styles.subtitle, { color: color.darkText }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {snippet ? (
        <HighlightedText
          text={snippet.text}
          ranges={snippet.ranges}
          style={[styles.text, { color: color.text }]}
          highlightStyle={{ backgroundColor: `${color.primary}55`, color: color.text }}
        />
      ) : hasText ? (
        <Text style={[styles.text, { color: color.text }]} numberOfLines={8}>
          {hadith.text}
        </Text>
      ) : (
        <Text style={[styles.missing, { color: color.darkText }]}>
          لا يتوفر نص هذا الحديث في المصدر
        </Text>
      )}
      {grade && (
        <View style={styles.footer}>
          <GradeBadge grade={grade} theme={theme} color={color} />
          {otherGrades > 0 && (
            <Text style={[styles.more, { color: color.darkText }]}>
              + {toArabicDigits(otherGrades)}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default memo(HadithCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  subtitle: {
    flex: 1,
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.75,
  },
  number: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  numberText: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
  },
  text: {
    fontSize: 20,
    lineHeight: 36,
    fontFamily: FontFamily.quran,
    // RN swaps left/right under RTL layout, so "right" would render left-aligned.
    textAlign: "justify",
    writingDirection: "rtl",
  },
  missing: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    opacity: 0.7,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  more: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.7,
  },
});
