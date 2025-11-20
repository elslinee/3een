import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontFamily } from "@/constants/FontFamily";
import { toArabicDigits } from "./utils";
import { SurahData } from "./types";

interface SurahHeaderProps {
  surahData: SurahData;
  color: any;
}

export const SurahHeader: React.FC<SurahHeaderProps> = ({
  surahData,
  color,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.surahInfoContainer}>
          <Text style={[styles.surahName, { color: color.text }]}>
            {surahData.name}
          </Text>
          {/* <Text style={[styles.surahEnglishName, { color: color.text20 }]}>
            {surahData.englishName}
          </Text> */}
          <Text style={[styles.surahDetails, { color: color.text20 }]}>
            {toArabicDigits(surahData.numberOfAyahs)} آية •{" "}
            {surahData.revelationType === "Meccan" ? "مكية" : "مدنية"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 4,
    borderBottomWidth: 0,
  },
  content: {
    flex: 1,
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  surahInfoContainer: {
    alignItems: "center",
  },
  surahName: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: 4,
  },
  surahEnglishName: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    opacity: 0.9,
    marginBottom: 4,
  },
  surahDetails: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    opacity: 0.9,
  },
});

