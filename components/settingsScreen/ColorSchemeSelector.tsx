import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { ColorSchemesList, ColorSchemeType } from "@/constants/ColorSchemes";
import { getColors } from "@/constants/Colors";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

interface ColorSchemeSelectorProps {
  currentScheme: ColorSchemeType;
  theme: "light" | "dark";
  onSelect: (scheme: ColorSchemeType) => void;
  color: any;
}

export const ColorSchemeSelector: React.FC<ColorSchemeSelectorProps> = ({
  currentScheme,
  theme,
  onSelect,
  color,
}) => {
  return (
    <View style={styles.container}>
      {ColorSchemesList.map((scheme: ColorSchemeType) => {
        const isSelected = currentScheme === scheme;
        const schemeColors = getColors(theme, scheme)[theme];

        return (
          <Pressable
            key={scheme}
            onPress={() => onSelect(scheme)}
            android_ripple={{ color: color.primary20, borderless: true }}
            style={styles.colorButton}
          >
            <View
              style={[
                styles.colorCircle,
                {
                  backgroundColor: schemeColors.primary,
                  borderWidth: isSelected ? 3 : 2,
                  borderColor: isSelected
                    ? schemeColors.primary
                    : color.border || `${color.text}30`,
                },
              ]}
            >
              {isSelected && (
                <FontAwesome5 name="check" size={20} color={color.white} />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingVertical: 8,
  },
  colorButton: {
    borderRadius: 30,
    overflow: "hidden",
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
