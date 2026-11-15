import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import { LinearGradient } from "expo-linear-gradient";
import { useLocation } from "@/context/LocationContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { getHijriDateString } from "@/utils/hijriDateUtils";
import { navigateToPage } from "@/utils/navigationUtils";

const { width } = Dimensions.get("window");

interface HeroSectionProps {
  color: any;
}

export default function HeroSection({ color }: HeroSectionProps) {
  const { address, errorMsg, openLocationSettingsAndRefresh } = useLocation();
  const [currentDate, setCurrentDate] = useState({
    hijri: "",
    gregorian: "",
  });
  const image = require("@/assets/images/hero.png");
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();

      // Format Gregorian date
      const gregorianDate = now.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Get accurate Hijri date
      const hijriDate = getHijriDateString(now);

      setCurrentDate({
        hijri: hijriDate,
        gregorian: gregorianDate,
      });
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="mx-4 ">
      <View className="relative h-56 rounded-lg overflow-hidden">
        <ImageBackground
          source={image}
          style={{
            width: "100%",
            height: "100%",
          }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              `${color.background}00`,
              `${color.background}80`,
              color.background,
            ]}
            locations={[0, 0.5, 1]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: FontFamily.bold,
                color: color.darkText,
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              {currentDate.hijri}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: FontFamily.bold,
                color: color.darkText,
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              {currentDate.gregorian}
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              {errorMsg ? (
                <TouchableOpacity onPress={openLocationSettingsAndRefresh}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: FontFamily.medium,
                      color: color.darkText,
                      textDecorationLine: "underline",
                    }}
                  >
                    {address}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontFamily: FontFamily.medium,
                    color: color.darkText,
                  }}
                >
                  {address}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => navigateToPage("/select-location")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons
                  name="edit-location-alt"
                  size={18}
                  color={color.darkText}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}
