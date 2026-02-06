import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontFamily } from "@/constants/FontFamily";
import { APP_VERSION } from "@/constants/General";

interface AppVersionFooterProps {
  color: any;
}

export const AppVersionFooter: React.FC<AppVersionFooterProps> = ({
  color,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.version, { color: color.darkText }]}>
        الإصدار {APP_VERSION}
      </Text>
      <Text style={[styles.copyright, { color: color.darkText }]}>
        جميع الحقوق محفوظة © 2026
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
  },
  version: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
});
