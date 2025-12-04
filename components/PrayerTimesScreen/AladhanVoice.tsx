import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import React, { useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePrayerTimes } from "@/context/PrayerTimesContext";
import {
  ElfajrIcon,
  EldohrIcon,
  El3srIcon,
  ElmgrbIcon,
  El3shaIcon,
} from "@/constants/Icons";
import { formatTo12Hour } from "@/utils/formatTo12Hour";
import getNextPrayerTime from "@/utils/getNextPrayerTime";
import usePrayerNotifications from "@/utils/usePrayerNotifications";
import { FontFamily } from "@/constants/FontFamily";

export default function AladhanVoice({ color }: { color: any }) {
  const { prayerTimes } = usePrayerTimes();
  // Stable keys to map times and toggles
  const PRAYER_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

  // Make isFriday reactive - update when day changes
  const [isFriday, setIsFriday] = useState(() => new Date().getDay() === 5);

  const [prayers, setPrayers] = useState([
    {
      name: "الفجر",
      icon: ElfajrIcon,
      time: "00:00",
      time24: "00:00",
      aldhan: true,
      notification: true,
    },
    {
      name: isFriday ? "الجمعة" : "الظهر",
      icon: EldohrIcon,
      time: "00:00",
      time24: "00:00",
      aldhan: true,
      notification: true,
      isFriday: isFriday,
    },
    {
      name: "العصر",
      icon: El3srIcon,
      time: "00:00",
      time24: "00:00",
      aldhan: true,
      notification: true,
    },
    {
      name: "المغرب",
      icon: ElmgrbIcon,
      time: "00:00",
      time24: "00:00",
      aldhan: true,
      notification: true,
    },
    {
      name: "العشاء",
      icon: El3shaIcon,
      time: "00:00",
      time24: "00:00",
      aldhan: true,
      notification: true,
    },
  ]);
  // Notifications are always enabled for all prayers
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedAdhanSettings = await AsyncStorage.getItem("adhanSettings");

        setPrayers((prevPrayers) =>
          prevPrayers.map((prayer, index) => {
            let updatedPrayer = { ...prayer };

            if (savedAdhanSettings) {
              const parsedAdhanSettings = JSON.parse(savedAdhanSettings);
              updatedPrayer.aldhan =
                parsedAdhanSettings[index] !== undefined
                  ? parsedAdhanSettings[index]
                  : prayer.aldhan;
            }

            // Force notifications to always be enabled
            updatedPrayer.notification = true;

            return updatedPrayer;
          })
        );
        // Notifications are always on; no cancellation logic needed
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (prayerTimes?.timings) {
      setPrayers((prevPrayers) =>
        prevPrayers.map((prayer, index) => {
          const key = PRAYER_KEYS[index] as keyof typeof prayerTimes.timings;
          const time24 = prayerTimes.timings[key] || "00:00";
          return {
            ...prayer,
            name: index === 1 && isFriday ? "الجمعة" : prayer.name,
            time: formatTo12Hour(time24) || "00:00",
            time24: time24,
            isFriday: index === 1 ? isFriday : false,
          };
        })
      );
    }
  }, [prayerTimes?.timings, isFriday]);

  // Update isFriday when prayer times update (in case day changed)
  useEffect(() => {
    if (prayerTimes?.date?.gregorian?.date) {
      // Prayer times include the date, use it to determine if it's Friday
      const dateStr = prayerTimes.date.gregorian.date;
      const [day, month, year] = dateStr.split("-");
      const prayerDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
      const newIsFriday = prayerDate.getDay() === 5;
      if (newIsFriday !== isFriday) {
        setIsFriday(newIsFriday);
      }
    }
  }, [prayerTimes?.date?.gregorian?.date, isFriday]);

  // Map UI toggles to hook include map per prayer
  const includeMap = useMemo(() => {
    const map: any = {};
    PRAYER_KEYS.forEach((k) => {
      map[k] = true;
    });
    return map;
  }, []);

  // Schedule notifications according to toggles
  usePrayerNotifications(prayerTimes, { enabled: true, include: includeMap });

  // Get next prayer info
  const nextPrayerInfo = prayerTimes?.timings
    ? getNextPrayerTime(prayerTimes.timings)
    : null;

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
    >
      <View
        style={{ gap: 24, paddingHorizontal: 16 }}
        className="flex flex-col"
      >
        {prayers.map((prayer, index) => {
          // Check if this prayer is the next prayer
          const isNextPrayer =
            nextPrayerInfo?.nextPrayer === prayer.name ||
            (isFriday && index === 1 && nextPrayerInfo?.nextPrayer === "الظهر");
          const isFridayPrayer = prayer.isFriday === true;

          return (
            <View
              style={{
                borderRadius: 16,
                backgroundColor: isNextPrayer
                  ? `${color.primary}`
                  : isFridayPrayer
                    ? `${color.primary}1A`
                    : color.bg20,
                borderWidth: isFridayPrayer && !isNextPrayer ? 2 : 0,
                borderColor: isFridayPrayer ? color.primary : "transparent",
              }}
              key={index}
              className="flex  relative p-4 flex-row items-center justify-between"
            >
              {isNextPrayer && (
                <View
                  style={{
                    position: "absolute",
                    top: -16,
                    left: 0,
                    backgroundColor: color.primary20,
                    padding: 4,
                    borderRadius: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9.5,
                      color: color.darkText,
                      lineHeight: 16,
                    }}
                    className=" font-bold px-2 "
                  >
                    الصلاة التالية
                  </Text>
                </View>
              )}
              <View style={{ gap: 20 }} className="flex flex-row items-center">
                <prayer.icon
                  width={24}
                  height={24}
                  color={isNextPrayer ? color.white : `${color.black}`}
                />
                <Text
                  style={{
                    color: isNextPrayer
                      ? color.background
                      : isFridayPrayer
                        ? color.primary
                        : `${color.black}`,
                  }}
                  className={`text-lg font-bold`}
                >
                  {prayer.name}
                </Text>
              </View>
              <View style={{ gap: 20 }} className="flex flex-row items-center">
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: FontFamily.bold,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: isNextPrayer ? color.background : `${color.black}`,
                  }}
                  numberOfLines={1}
                  className={`overflow-hidden !text-nowrap text-ellipsis text-sm font-bold`}
                >
                  {prayer.time}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
