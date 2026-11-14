import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type GoBackProps = {
  style?: any;
  color?: string;
};

// Pinned to the same spot on every screen. Render it as a direct child of the
// screen's root view so `top` is measured from the top of the screen.
export default function GoBack({ style, color: customColor }: GoBackProps) {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const insets = useSafeAreaInsets();
  const iconColor = customColor || color.primary;
  const bgColor = customColor ? `${customColor}22` : `${color.text20}22`;

  return (
    <View
      style={[
        { position: "absolute", top: insets.top + 16, left: 20, zIndex: 1000 },
        style,
      ]}
    >
      <TouchableOpacity
        style={{
          position: "absolute",
          padding: 10,
          borderRadius: 8,
          backgroundColor: bgColor,
        }}
        onPress={() => router.back()}
      >
        <MaterialIcons
          style={{
            transform: [{ rotate: "180deg" }],
          }}
          name="arrow-back-ios-new"
          size={22}
          color={iconColor}
        />
      </TouchableOpacity>
    </View>
  );
}
