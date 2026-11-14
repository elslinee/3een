import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import GoBack from "@/components/GoBack";
import {
  ChangelogHeader,
  ChangelogVersionCard,
  ChangelogFooter,
  changelogVersions,
} from "@/components/changelog";

export default function ChangelogScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: color.background }]}
      showsVerticalScrollIndicator={false}
    >
      <GoBack />

      <ChangelogHeader
        title="سجل التغييرات"
        subtitle="آخر التحديثات والتحسينات"
        color={color}
      />

      <View style={styles.section}>
        {changelogVersions.map((version, index) => (
          <ChangelogVersionCard key={index} version={version} color={color} />
        ))}
      </View>

      <ChangelogFooter
        text="نسعى دائماً لتحسين التطبيق وإضافة مميزات جديدة"
        color={color}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});
