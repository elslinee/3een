import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { usePrayerTimes } from "@/context/PrayerTimesContext";
import { useRealTimeCountdown } from "@/utils/useRealTimeCountdown";
import { FontFamily } from "@/constants/FontFamily";
import { useLocation } from "@/context/LocationContext";
import { getHijriDateString } from "@/utils/hijriDateUtils";
import EvilIcons from "@expo/vector-icons/EvilIcons";

export default function CountdownTimer({ color }: { color: any }) {
  const { prayerTimes, loading } = usePrayerTimes();
  const timeData = useRealTimeCountdown(prayerTimes);

  // استخدام قيم افتراضية إذا لم تكن البيانات متاحة
  const hoursRemaining = timeData?.hoursRemaining ?? 0;
  const minutesRemaining = timeData?.minutesRemaining ?? 0;
  const secondsRemaining = timeData?.secondsRemaining ?? 0;
  const nextPrayer = timeData?.nextPrayer ?? "---";
  const isPrayerTime = timeData?.isPrayerTime ?? false;
  const { address, errorMsg, openLocationSettingsAndRefresh } = useLocation();
  const [currentDate, setCurrentDate] = useState({
    hijri: "",
    gregorian: "",
  });

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
    <View style={{ paddingBottom: 32 }} className="px-4 ">
      <View
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 12,
          }}
        >
          <EvilIcons name="location" size={24} color={color.grey} />
          {errorMsg ? (
            <TouchableOpacity onPress={openLocationSettingsAndRefresh}>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  fontFamily: FontFamily.medium,
                  color: color.grey,
                  textDecorationLine: "underline",
                }}
              >
                {address}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                fontFamily: FontFamily.medium,
                color: color.grey,
              }}
            >
              {address}
            </Text>
          )}
        </View>
        <Text
          style={{
            fontSize: 14,
            fontFamily: FontFamily.bold,
            color: color.grey,
            textAlign: "center",
            paddingTop: 4,
          }}
        >
          {currentDate.gregorian}
        </Text>
      </View>
      {/* Header Text */}
      <View
        style={{ marginTop: 24, marginBottom: 16 }}
        className="flex-col  items-center w-full"
      >
        <Text
          className="text-center "
          style={{
            fontFamily: FontFamily.regular,
            fontSize: 16,
            color: color.grey,
            lineHeight: 24,
          }}
        >
          الوقت المتبقي لصلاة
          <Text style={{ color: color.primary }} className="font-bold">
            {"  "}
            {nextPrayer}
          </Text>
        </Text>
      </View>

      {/* Countdown Container */}
      <View className="w-full" style={{ height: 88 }}>
        <View className="flex-row justify-center items-start gap-2">
          <View className="flex-col items-center">
            <View
              className="flex-row justify-center items-center rounded-lg"
              style={{
                width: 64,
                height: 64,

                backgroundColor: isPrayerTime
                  ? "#10B98110"
                  : `${color.primary}10`,
              }}
            >
              <Text
                className="font-bold text-center"
                style={{
                  fontFamily: FontFamily.bold,
                  fontSize: 30,
                  lineHeight: 36,
                  color: isPrayerTime ? "#10B981" : color.primary,
                }}
              >
                {secondsRemaining.toString().padStart(2, "0")}
              </Text>
            </View>
            <View className="flex-col items-center" style={{ paddingTop: 8 }}>
              <Text
                className="text-center"
                style={{
                  fontFamily: FontFamily.regular,
                  fontSize: 12,
                  lineHeight: 16,
                  color: color.grey,
                }}
              >
                ثانية
              </Text>
            </View>
          </View>

          {/* Colon */}
          <View className="flex-row items-start" style={{ paddingTop: 14 }}>
            <Text
              className="text-center"
              style={{
                fontFamily: FontFamily.bold,
                fontSize: 30,
                lineHeight: 36,
                color: isPrayerTime ? "#10B981" : color.primary,
              }}
            >
              :
            </Text>
          </View>

          {/* Minutes */}
          <View className="flex-col items-center">
            <View
              className="flex-row justify-center items-center rounded-lg"
              style={{
                width: 64,
                height: 64,
                backgroundColor: isPrayerTime
                  ? "#10B98110"
                  : `${color.primary}10`,
              }}
            >
              <Text
                className="text-center"
                style={{
                  fontFamily: FontFamily.bold,
                  fontSize: 30,
                  lineHeight: 36,
                  color: isPrayerTime ? "#10B981" : color.primary,
                }}
              >
                {minutesRemaining.toString().padStart(2, "0")}
              </Text>
            </View>
            <View className="flex-col items-center" style={{ paddingTop: 8 }}>
              <Text
                className="text-center"
                style={{
                  fontFamily: FontFamily.regular,
                  fontSize: 12,
                  lineHeight: 16,
                  color: color.grey,
                }}
              >
                دقيقة
              </Text>
            </View>
          </View>

          {/* Colon */}
          <View className="flex-row items-start" style={{ paddingTop: 14 }}>
            <Text
              className="text-center"
              style={{
                fontFamily: FontFamily.bold,
                fontSize: 30,
                lineHeight: 36,
                color: isPrayerTime ? "#10B981" : color.primary,
              }}
            >
              :
            </Text>
          </View>

          {/* Hours */}
          <View className="flex-col items-center">
            <View
              className="flex-row justify-center items-center rounded-lg"
              style={{
                width: 64,
                height: 64,
                backgroundColor: isPrayerTime
                  ? "#10B98110"
                  : `${color.primary}10`,
              }}
            >
              <Text
                className="text-center"
                style={{
                  fontFamily: FontFamily.bold,
                  fontSize: 30,
                  lineHeight: 36,
                  color: isPrayerTime ? "#10B981" : color.primary,
                }}
              >
                {hoursRemaining.toString().padStart(2, "0")}
              </Text>
            </View>
            <View className="flex-col items-center" style={{ paddingTop: 8 }}>
              <Text
                className="text-center"
                style={{
                  fontFamily: FontFamily.regular,
                  fontSize: 12,
                  lineHeight: 16,
                  color: color.grey,
                }}
              >
                ساعة
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
