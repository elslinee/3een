import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontFamily } from "@/constants/FontFamily";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChangelogHeaderProps {
  title: string;
  subtitle: string;
  color: any;
}

export const ChangelogHeader: React.FC<ChangelogHeaderProps> = ({
  title,
  subtitle,
  color,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: `${color.primary}15`,
          paddingTop: insets.top + 36,
        },
      ]}
    >
      <Text style={[styles.headerTitle, { color: color.text }]}>{title}</Text>
      <Text style={[styles.headerSubtitle, { color: color.darkText }]}>
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: FontFamily.bold,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
  },
});

