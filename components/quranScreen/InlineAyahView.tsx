import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Text } from "react-native";
import { FontFamily } from "@/constants/FontFamily";
import { useFontSize } from "@/context/FontSizeContext";

interface Ayah {
  numberInSurah: number;
  text: string;
  translation?: string;
}

export interface InlineAyahViewProps {
  ayahs: Ayah[];
  bookmark: number | null;
  onAyahPress: (ayah: Ayah) => void;
  onToggleBookmark: (ayahNumber: number) => void;
  toArabicDigits: (value: number | string) => string;
  color: any;
}
export interface InlineAyahViewHandle {
  loadMore: () => void;
}

const InlineAyahView = forwardRef<InlineAyahViewHandle, InlineAyahViewProps>(
  (
    { ayahs, bookmark, onAyahPress, onToggleBookmark, toArabicDigits, color },
    ref
  ) => {
    const { fontSize, isBold } = useFontSize();

    const [visibleCount, setVisibleCount] = useState(20);

    useImperativeHandle(
      ref,
      () => ({
        loadMore: () => {
          setVisibleCount((prev) => Math.min(prev + 20, ayahs.length));
        },
      }),
      [ayahs.length]
    );

    return (
      <Text
        style={[
          styles.inlineText(fontSize, color.text, isBold),
          { paddingVertical: 20 },
        ]}
      >
        {ayahs.slice(0, visibleCount).map((ayah) => {
          const isThisBookmarked = bookmark === ayah.numberInSurah;
          return (
            <Text
              key={ayah.numberInSurah}
              onPress={() => {
                onAyahPress({
                  numberInSurah: ayah.numberInSurah,
                  text: ayah.text,
                  translation: ayah.translation,
                });
              }}
              onLongPress={() => {
                onToggleBookmark(ayah.numberInSurah);
              }}
              style={
                isThisBookmarked
                  ? styles.inlineAyahTextBookmarked(color.primary + "88")
                  : styles.inlineAyahText
              }
            >
              {ayah.text}
              <Text style={styles.inlineAyahNumber(fontSize, color.primary)}>
                {"  "} ﴿ {toArabicDigits(ayah.numberInSurah)} ﴾ {"  "}
              </Text>
            </Text>
          );
        })}
      </Text>
    );
  }
);

const styles = {
  inlineText: (fontSize: number, color: string, isBold: boolean) => ({
    fontSize: fontSize,
    fontFamily: isBold ? FontFamily.quranBold : FontFamily.quran,
    color: color,
    writingDirection: "rtl" as const,
    lineHeight: fontSize * 1.9,
  }),
  inlineAyahText: {
    backgroundColor: "transparent",
    paddingHorizontal: 4,
    paddingVertical: 2,
    textAlign: "center" as const,
    borderRadius: 10,
  },
  inlineAyahTextBookmarked: (backgroundColor: string) => ({
    backgroundColor: backgroundColor,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    textAlign: "center" as const,
  }),
  inlineAyahNumber: (fontSize: number, color: string) => ({
    position: "relative" as const,
    fontFamily: FontFamily.bold,
    fontSize: fontSize - 1,
    color: color,
  }),
};

export default InlineAyahView;
