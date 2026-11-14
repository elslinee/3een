import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontFamily } from "@/constants/FontFamily";
import { GRADE_COLORS } from "@/constants/gradeColors";
import {
  HadithGrade,
  categorizeGrade,
  translateGrade,
  translateGrader,
} from "@/services/hadith/grades";

interface GradeBadgeProps {
  grade: HadithGrade;
  theme: "light" | "dark";
  color: any;
  showGrader?: boolean;
}

export default function GradeBadge({
  grade,
  theme,
  color,
  showGrader = true,
}: GradeBadgeProps) {
  const palette = GRADE_COLORS[theme][categorizeGrade(grade.grade)];
  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: palette.background }]}>
        <Text style={[styles.badgeText, { color: palette.text }]}>
          {translateGrade(grade.grade)}
        </Text>
      </View>
      {showGrader && (
        <Text style={[styles.grader, { color: color.darkText }]} numberOfLines={1}>
          {translateGrader(grade.grader)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexShrink: 1,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: FontFamily.bold,
  },
  grader: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    opacity: 0.8,
    flexShrink: 1,
  },
});
