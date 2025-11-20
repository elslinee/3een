import { View, Text } from "react-native";
import React from "react";

import {
  ElfajrIcon,
  ElshrokIcon,
  EldohrIcon,
  El3srIcon,
  ElmgrbIcon,
  El3shaIcon,
} from "@/constants/Icons";
import { usePrayerTimes } from "@/context/PrayerTimesContext";
import { formatTo12Hour } from "@/utils/formatTo12Hour";
import getNextPrayerTime from "@/utils/getNextPrayerTime";
import { FontFamily } from "@/constants/FontFamily";

export default function PrayerTimesComponent({ color }: { color: any }) {
  const { prayerTimes, loading } = usePrayerTimes();

  // Check if today is Friday
  const isFriday = new Date().getDay() === 5;

  // Get next prayer info
  const nextPrayerInfo = prayerTimes?.timings
    ? getNextPrayerTime(prayerTimes.timings)
    : null;

  const prayers = [
    {
      name: "الفجر",
      icon: ElfajrIcon,
      time: formatTo12Hour(prayerTimes?.timings?.Fajr || "") || "00:00",
      time24: prayerTimes?.timings?.Fajr || "00:00",
    },
    {
      name: isFriday ? "الجمعة" : "الظهر",
      icon: EldohrIcon,
      time: formatTo12Hour(prayerTimes?.timings?.Dhuhr || "") || "00:00",
      time24: prayerTimes?.timings?.Dhuhr || "00:00",
      isFriday: isFriday,
    },
    {
      name: "العصر",
      icon: El3srIcon,
      time: formatTo12Hour(prayerTimes?.timings?.Asr || "") || "00:00",
      time24: prayerTimes?.timings?.Asr || "00:00",
    },
    {
      name: "المغرب",
      icon: ElmgrbIcon,
      time: formatTo12Hour(prayerTimes?.timings?.Maghrib || "") || "00:00",
      time24: prayerTimes?.timings?.Maghrib || "00:00",
    },
    {
      name: "العشاء",
      icon: El3shaIcon,
      time: formatTo12Hour(prayerTimes?.timings?.Isha || "") || "00:00",
      time24: prayerTimes?.timings?.Isha || "00:00",
    },
  ];
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 4 }} className="">
      <View
        style={{
          backgroundColor: `${color.primary}1A`,
          borderRadius: 16,
          padding: 8,
          overflow: "hidden",
        }}
        className="flex-row  "
      >
        {prayers.map((prayer, index) => {
          const isNextPrayer =
            nextPrayerInfo?.nextPrayer === prayer.name ||
            (isFriday && index === 1 && nextPrayerInfo?.nextPrayer === "الظهر");
          const isFridayPrayer = prayer.isFriday === true;
          return (
            <View
              key={index}
              style={{
                backgroundColor: isNextPrayer
                  ? color.primary
                  : isFridayPrayer
                    ? `${color.primary}33`
                    : "transparent",
                borderRadius: 10,
                padding: 8,
                flex: 1,
                alignItems: "center",
                overflow: "hidden",
                borderWidth: isFridayPrayer ? 2 : 0,
                borderColor: isFridayPrayer ? color.primary : "transparent",
              }}
            >
              <Text
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: 11,
                  fontFamily: FontFamily.medium,
                  color: isNextPrayer
                    ? "white"
                    : isFridayPrayer
                      ? color.primary
                      : color.text20,
                }}
                numberOfLines={1}
              >
                {prayer.name}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: FontFamily.bold,
                  color: isNextPrayer
                    ? "white"
                    : isFridayPrayer
                      ? color.primary
                      : color.darkText,
                }}
                numberOfLines={1}
              >
                {prayer.time}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
