import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontFamily } from "@/constants/FontFamily";
import { ThemeMode } from "@/context/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";

interface ThemeModeSelectorProps {
  currentMode: ThemeMode;
  theme: "light" | "dark";
  onSelect: (mode: ThemeMode) => void;
  color: any;
}

const themeModes: { value: ThemeMode; label: string; description: string }[] = [
  {
    value: "auto",
    label: "تلقائي",
    description: "يتبع وضع الجهاز",
  },
  {
    value: "light",
    label: "فاتح",
    description: "الوضع الفاتح دائماً",
  },
  {
    value: "dark",
    label: "داكن",
    description: "الوضع الداكن دائماً",
  },
];

export const ThemeModeSelector: React.FC<ThemeModeSelectorProps> = ({
  currentMode,
  theme,
  onSelect,
  color,
}) => {
  return (
    <View style={styles.container}>
      {themeModes.map((mode, index) => {
        const isSelected = currentMode === mode.value;
        const isLast = index === themeModes.length - 1;

        return (
          <TouchableOpacity
            key={mode.value}
            style={[
              styles.option,
              !isLast && styles.optionWithBorder,
              { borderColor: color.border },
            ]}
            onPress={() => onSelect(mode.value)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: isSelected ? color.text : color.darkText,
                      fontFamily: isSelected
                        ? FontFamily.bold
                        : FontFamily.regular,
                    },
                  ]}
                >
                  {mode.label}
                </Text>
           
              </View>

              {isSelected && (
                <View
                  style={[styles.checkIcon, { backgroundColor: color.primary }]}
                >
                  <FontAwesome5 name="check" size={14} color={color.white} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  optionWithBorder: {
    borderBottomWidth: 1,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 0,
  },
  description: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
  },
  radio: {
    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
});
