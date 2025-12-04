import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { toZonedTime, format } from "date-fns-tz";
import usePushNotifications from "@/utils/usePushNotifications";
import type { PrayerTimesData } from "@/utils/prayerTimesService";

type PrayerKey = keyof PrayerTimesData["timings"];

// Only the prayers we want to schedule notifications for
type ScheduledPrayerKey = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

const PRAYER_ORDER: ScheduledPrayerKey[] = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

const getPrayerTitle = (key: ScheduledPrayerKey, isFriday: boolean): string => {
  if (key === "Dhuhr" && isFriday) {
    return "أذان صلاة الجمعة";
  }

  const titles: Record<ScheduledPrayerKey, string> = {
    Fajr: "أذان صلاة الفجر",
    Dhuhr: "أذان صلاة الظهر",
    Asr: "أذان صلاة العصر",
    Maghrib: "أذان صلاة المغرب",
    Isha: "أذان صلاة العشاء",
  };

  return titles[key];
};
const PRAYER_MESSAGES = {
  Fajr: "﴿فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ﴾",
  Dhuhr: "﴿وَأَقِمِ الصَّلَاةَ لِذِكْرِي﴾",
  Asr: "﴿حَافِظُوا عَلَى الصَّلَوَاتِ﴾",
  Maghrib: "﴿قَدْ أَفْلَحَ الْمُؤْمِنُونَ﴾",
  Isha: "﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾",
};

const FRIDAY_MESSAGE =
  "﴿يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ﴾";

const getPrayerMessage = (
  key: ScheduledPrayerKey,
  isFriday: boolean
): string => {
  if (key === "Dhuhr" && isFriday) {
    return FRIDAY_MESSAGE;
  }
  return PRAYER_MESSAGES[key];
};

interface UsePrayerNotificationsOptions {
  enabled?: boolean;
  include?: Partial<Record<ScheduledPrayerKey, boolean>>; // e.g., { Fajr: false }
  titlePrefix?: string;
}

/**
 * Schedule local notifications for today's remaining prayers using API times.
 * Converts from API timezone (meta.timezone) to the device's local clock reliably.
 */
export default function usePrayerNotifications(
  prayerTimes: PrayerTimesData | null,
  options: UsePrayerNotificationsOptions = {}
) {
  // Ensure permissions/channel are set-up (returns token but we don't use it here)
  usePushNotifications();

  const lastIncludeRef = useRef<string>("");
  const lastTimingsRef = useRef<string>("");
  const isSchedulingRef = useRef(false);
  const { enabled = true, include = {}, titlePrefix } = options;

  useEffect(() => {
    if (!enabled || !prayerTimes?.timings || !prayerTimes?.meta?.timezone) {
      return;
    }

    const tz = prayerTimes.meta.timezone || "Africa/Cairo";
    const now = new Date();

    type IdMap = Partial<Record<ScheduledPrayerKey | string, string>>;
    const IDS_KEY = "prayer_notification_ids_v1";

    const schedulePerPrayer = async () => {
      // Prevent concurrent executions
      if (isSchedulingRef.current) {
        return;
      }

      // Check if include map or timings have changed
      const currentInclude = JSON.stringify(include);
      const currentTimings = JSON.stringify({
        Fajr: prayerTimes.timings.Fajr,
        Dhuhr: prayerTimes.timings.Dhuhr,
        Asr: prayerTimes.timings.Asr,
        Maghrib: prayerTimes.timings.Maghrib,
        Isha: prayerTimes.timings.Isha,
      });

      // Only skip if both include map AND timings haven't changed
      if (
        lastIncludeRef.current === currentInclude &&
        lastTimingsRef.current === currentTimings
      ) {
        console.log("[Notifications] Skipping - no changes detected");
        return;
      }

      console.log(
        "[Notifications] Scheduling notifications - changes detected",
        {
          includeChanged: lastIncludeRef.current !== currentInclude,
          timingsChanged: lastTimingsRef.current !== currentTimings,
        }
      );

      isSchedulingRef.current = true;
      lastIncludeRef.current = currentInclude;
      lastTimingsRef.current = currentTimings;

      try {
        const todayInTZ = toZonedTime(now, tz);
        const yyyyMMdd = format(todayInTZ, "yyyy-MM-dd", { timeZone: tz });

        // Check if today is Friday (JavaScript uses 0=Sunday, 5=Friday)
        const isFriday = todayInTZ.getDay() === 5;

        // Get all scheduled notifications before canceling (for debugging)
        const existingNotifications =
          await Notifications.getAllScheduledNotificationsAsync();
        console.log(
          `[Notifications] Existing scheduled: ${existingNotifications.length}`
        );

        // Cancel ALL scheduled notifications first to prevent duplicates
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Clear stored IDs
        try {
          await AsyncStorage.removeItem(IDS_KEY);
        } catch {}

        // If no prayers are enabled, don't schedule any notifications
        const hasEnabledPrayers = Object.values(include).some(
          (enabled) => enabled === true
        );
        if (!hasEnabledPrayers) {
          return;
        }

        const nextStored: IdMap = {};

        for (const key of PRAYER_ORDER) {
          const included = include[key] === true; // Only schedule if explicitly true

          if (!included) {
            // Do not schedule for excluded prayer
            continue;
          }

          const hhmm = prayerTimes.timings[key];
          if (!hhmm) {
            continue;
          }

          // For DAILY/WEEKLY triggers, we only need hour and minute (not dates)
          // Parse directly from the API time string (format: "HH:MM")
          const [hourStr, minuteStr] = hhmm.split(":");
          const hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);

          if (isNaN(hour) || isNaN(minute)) {
            console.warn(`Invalid time format for ${key}: ${hhmm}`);
            continue;
          }

          // Special handling for Dhuhr prayer: create separate notifications for Friday and other days
          if (key === "Dhuhr") {
            // Schedule notification for Friday (WEEKLY with weekday 5 = Friday)
            const fridayTitle = getPrayerTitle(key, true); // "أذان صلاة الجمعة"
            const fridayNotificationTitle = titlePrefix
              ? `${titlePrefix} حان وقت ${fridayTitle}`
              : `حان وقت ${fridayTitle}`;
            const fridayNotificationBody = getPrayerMessage(key, true);

            console.log("Friday Prayer Notification:", {
              prayer: key,
              title: fridayNotificationTitle,
              body: fridayNotificationBody,
              weekday: 5,
              hour,
              minute,
            });

            const fridayIdentifier =
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: fridayNotificationTitle,
                  body: fridayNotificationBody,
                  sound: "default",
                  data: {
                    type: "prayer",
                    screen: "PrayerTimes",
                    isFriday: true,
                  },
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                  weekday: 6, // Friday (expo-notifications uses 1=Sunday, 6=Friday, 7=Saturday)
                  hour: hour,
                  minute: minute,
                },
              });
            nextStored[`${key}_Friday`] = fridayIdentifier;

            // Schedule notification for other days (WEEKLY with weekdays 0-4, 6 = Sunday-Thursday, Saturday)
            const dhuhrTitle = getPrayerTitle(key, false); // "أذان صلاة الظهر"
            const dhuhrNotificationTitle = titlePrefix
              ? `${titlePrefix} حان وقت ${dhuhrTitle}`
              : `حان وقت ${dhuhrTitle}`;
            const dhuhrNotificationBody = PRAYER_MESSAGES[key];

            console.log("Dhuhr Prayer Notification:", {
              prayer: key,
              title: dhuhrNotificationTitle,
              body: dhuhrNotificationBody,
              weekdays: [0, 1, 2, 3, 4, 6],
              hour,
              minute,
            });

            // Schedule for each weekday separately (expo-notifications doesn't support multiple weekdays in one trigger)
            // expo-notifications uses 1=Sunday, 2=Monday, ..., 6=Friday, 7=Saturday
            // We want Sunday, Monday, Tuesday, Wednesday, Thursday, Saturday (all days except Friday)
            const weekdays = [1, 2, 3, 4, 5, 7]; // Sun, Mon, Tue, Wed, Thu, Sat (expo indexing)
            const weekdayIdentifiers: string[] = [];

            for (const weekday of weekdays) {
              const weekdayIdentifier =
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: dhuhrNotificationTitle,
                    body: dhuhrNotificationBody,
                    sound: "default",
                    data: {
                      type: "prayer",
                      screen: "PrayerTimes",
                      isFriday: false,
                    },
                  },
                  trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                    weekday: weekday,
                    hour: hour,
                    minute: minute,
                  },
                });
              weekdayIdentifiers.push(weekdayIdentifier);
            }

            // Store all identifiers
            nextStored[key] = JSON.stringify({
              friday: fridayIdentifier,
              weekdays: weekdayIdentifiers,
            }) as any;
          } else {
            // For other prayers, use daily notification
            const prayerTitle = getPrayerTitle(key, false);
            const notificationTitle = titlePrefix
              ? `${titlePrefix} حان وقت ${prayerTitle}`
              : `حان وقت ${prayerTitle}`;
            const notificationBody = PRAYER_MESSAGES[key];

            console.log("Prayer Notification:", {
              prayer: key,
              title: notificationTitle,
              body: notificationBody,
              hour: hour,
              minute: minute,
            });

            const identifier = await Notifications.scheduleNotificationAsync({
              content: {
                title: notificationTitle,
                body: notificationBody,
                sound: "default",
                data: {
                  type: "prayer",
                  screen: "PrayerTimes",
                },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: hour,
                minute: minute,
              },
            });
            nextStored[key] = identifier;
          }
        }

        // Persist latest identifiers map
        try {
          await AsyncStorage.setItem(IDS_KEY, JSON.stringify(nextStored));
        } catch {}

        // Verify what was scheduled
        const scheduledNotifications =
          await Notifications.getAllScheduledNotificationsAsync();
        console.log(
          `[Notifications] Successfully scheduled ${scheduledNotifications.length} notifications:`
        );
        scheduledNotifications.forEach((n) => {
          const trigger = n.trigger as any;
          console.log(
            `  - ${n.content.title} (${trigger.type}${trigger.weekday ? `, weekday: ${trigger.weekday}` : ""}, ${trigger.hour}:${String(trigger.minute).padStart(2, "0")})`
          );
        });
      } catch (err) {
        console.error("Failed scheduling prayer notifications:", err);
      } finally {
        isSchedulingRef.current = false;
      }
    };

    schedulePerPrayer();

    // Cleanup function when notifications are disabled
    return () => {
      if (!enabled) {
        Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
      }
    };
    // Note: `include` object reference changes on every render, but we use JSON.stringify
    // internally (lines 98-105) to detect actual value changes, so duplicates are prevented
  }, [enabled, prayerTimes, include]);
}
