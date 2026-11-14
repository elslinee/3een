import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export interface HeaderAction {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  active?: boolean;
}

// Mirrors GoBack's spot on the opposite side of the header (same size and offset).
export default function HeaderActions({
  actions,
  color,
}: {
  actions: HeaderAction[];
  color: any;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.row, { top: insets.top + 16 }]}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.accessibilityLabel}
          onPress={action.onPress}
          accessibilityLabel={action.accessibilityLabel}
          style={[styles.button, { backgroundColor: `${color.text20}22` }]}
        >
          <MaterialIcons
            name={action.icon}
            size={22}
            color={action.active ? color.primary : color.darkText}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: "absolute",
    right: 20,
    zIndex: 1000,
    flexDirection: "row",
    gap: 8,
  },
  button: {
    padding: 10,
    borderRadius: 8,
  },
});
