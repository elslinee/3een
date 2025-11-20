import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontFamily } from "@/constants/FontFamily";
import AppLogo from "@/components/AppLogo";
import { TasbeehItem } from "./types";

interface ShareViewProps {
  item: TasbeehItem;
  isSmallScreen: boolean;
  color: any;
  completedColor: string;
}

export const ShareView: React.FC<ShareViewProps> = ({
  item,
  isSmallScreen,
  color,
  completedColor,
}) => {
  const size = isSmallScreen ? 150 : 200;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: color.bg20,
          gap: isSmallScreen ? 18 : 32,
        },
      ]}
    >
      <Text
        style={[
          styles.name,
          {
            color: color.text,
            fontSize: isSmallScreen ? 17 : 20,
          },
        ]}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.3}
      >
        {item.name}
      </Text>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginTop: 12,
        }}
      >
        <AppLogo
          size={32}
          primaryColor={color.primary + "80"}
          secondaryColor={completedColor + "80"}
          backgroundColor="transparent"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    // borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  name: {
    fontFamily: FontFamily.black,
    textAlign: "center",
  },
});
