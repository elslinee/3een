import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontFamily } from "@/constants/FontFamily";

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
  color: any;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  children,
  color,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: color.darkText }]}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
    paddingRight: 4,
  },
});

