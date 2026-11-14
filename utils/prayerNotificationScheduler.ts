import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { fromZonedTime } from "date-fns-tz";
import { aladhanClient } from "./axiosClient";
import { canScheduleExactAlarms } from "@/modules/prayer-alarms";

type PrayerKey = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

interface CalendarDay {
  date: string; // yyyy-MM-dd
  timezone: string;
  timings: Record<PrayerKey, string>; // HH:mm in `timezone`
}

interface CalendarCache {
  locationKey: string;
  days: CalendarDay[];
}

interface ScheduleState {
  signature: string;
  scheduledAt: number;
}

const PRAYERS: PrayerKey[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const DAYS_AHEAD = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const RESCHEDULE_AFTER_MS = 6 * 60 * 60 * 1000;
export const PRAYER_CHANNEL_ID = "prayer-times";

const CALENDAR_CACHE_KEY = "prayer_calendar_cache_v1";
const SCHEDULE_STATE_KEY = "prayer_notifications_state_v1";

// Must match prayerTimesService so notifications agree with the times shown in the app.
const CALCULATION_METHOD = 3; // Muslim World League
const SCHOOL = 0; // Shafi

const PRAYER_TITLES: Record<PrayerKey, string> = {
  Fajr: "صلاة الفجر",
  Dhuhr: "صلاة الظهر",
  Asr: "صلاة العصر",
  Maghrib: "صلاة المغرب",
  Isha: "صلاة العشاء",
};

const PRAYER_MESSAGES: Record<PrayerKey, string> = {
  Fajr: "من صلى الفجر في جماعة فكأنما قام الليل كله",
  Dhuhr: "من حافظ على أربع ركعات قبل الظهر وأربع بعدها حرّمه الله على النار",
  Asr: "من فاتته صلاةُ العصر فكأنما وُتِرَ أهلُه ومالُه",
  Maghrib: "من صلى المغرب في جماعة فكأنما قام نصف الليل",
  Isha: "من صلى العشاء في جماعة فكأنما قام نصف الليل",
};

const FRIDAY_TITLE = "صلاة الجمعة";
const FRIDAY_MESSAGE =
  "﴿يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ وَذَرُوا الْبَيْعَ ذَٰلِكُمْ خَيْرٌ لَّكُمْ إِن كُنتُمْ تَعْلَمُونَ﴾";

const toLocationKey = (latitude: number, longitude: number) =>
  `${latitude.toFixed(2)},${longitude.toFixed(2)}`;

const fetchMonth = async (
  latitude: number,
  longitude: number,
  year: number,
  month: number,
): Promise<CalendarDay[]> => {
  const response = await aladhanClient.get(`/calendar/${year}/${month}`, {
    params: { latitude, longitude, method: CALCULATION_METHOD, school: SCHOOL },
  });

  return (response.data?.data ?? []).map((entry: any) => {
    const [dd, mm, yyyy] = entry.date.gregorian.date.split("-");
    const timings = {} as Record<PrayerKey, string>;
    for (const key of PRAYERS) {
      // Calendar times look like "04:48 (EET)"
      timings[key] = String(entry.timings[key]).split(" ")[0];
    }
    return { date: `${yyyy}-${mm}-${dd}`, timezone: entry.meta.timezone, timings };
  });
};

// Fetches enough months to cover DAYS_AHEAD; falls back to the cached calendar when offline.
const getCalendar = async (
  latitude: number,
  longitude: number,
): Promise<CalendarDay[]> => {
  const locationKey = toLocationKey(latitude, longitude);
  const now = new Date();
  const end = new Date(now.getTime() + DAYS_AHEAD * DAY_MS);
  const months = [[now.getFullYear(), now.getMonth() + 1]];
  if (end.getMonth() !== now.getMonth()) {
    months.push([end.getFullYear(), end.getMonth() + 1]);
  }

  try {
    const results = await Promise.all(
      months.map(([year, month]) => fetchMonth(latitude, longitude, year, month)),
    );
    const days = results.flat();
    const cache: CalendarCache = { locationKey, days };
    await AsyncStorage.setItem(CALENDAR_CACHE_KEY, JSON.stringify(cache));
    return days;
  } catch (error) {
    const cachedStr = await AsyncStorage.getItem(CALENDAR_CACHE_KEY);
    if (cachedStr) {
      const cached: CalendarCache = JSON.parse(cachedStr);
      if (cached.locationKey === locationKey) {
        return cached.days;
      }
    }
    throw error;
  }
};

const ensureNotificationSetup = async (): Promise<boolean> => {
  let { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status !== "granted" && canAskAgain) {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(PRAYER_CHANNEL_ID, {
      name: "مواقيت الصلاة",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
  return true;
};

let inFlight: Promise<void> | null = null;

/**
 * Schedules one-off notifications for every prayer in the next DAYS_AHEAD days.
 * Exact per-day times (prayer times shift daily) and works without reopening the app.
 *
 * `force` reschedules even if nothing changed. Use it on cold start: after a
 * force-stop Android drops the app's alarms while expo still lists them as scheduled.
 */
export const schedulePrayerNotifications = (
  coords: { latitude: number; longitude: number },
  { force = false }: { force?: boolean } = {},
): Promise<void> => {
  if (inFlight) return inFlight;
  inFlight = run(coords, force).finally(() => {
    inFlight = null;
  });
  return inFlight;
};

const run = async (
  { latitude, longitude }: { latitude: number; longitude: number },
  force: boolean,
) => {
  try {
    if (!(await ensureNotificationSetup())) {
      console.log("[Notifications] Permission not granted, skipping");
      return;
    }

    // Exact-alarm access is part of the signature: alarms set before it was
    // granted stay inexact, so granting it must trigger a reschedule.
    const signature = `${toLocationKey(latitude, longitude)}|exact:${canScheduleExactAlarms()}`;
    const stateStr = await AsyncStorage.getItem(SCHEDULE_STATE_KEY);
    const state: ScheduleState | null = stateStr ? JSON.parse(stateStr) : null;
    const now = Date.now();

    if (
      !force &&
      state?.signature === signature &&
      now - state.scheduledAt < RESCHEDULE_AFTER_MS
    ) {
      return;
    }

    const days = await getCalendar(latitude, longitude);

    const upcoming: { identifier: string; date: Date; key: PrayerKey; isFriday: boolean }[] = [];
    for (const day of days) {
      const isFriday = new Date(`${day.date}T12:00:00Z`).getUTCDay() === 5;
      for (const key of PRAYERS) {
        const date = fromZonedTime(`${day.date}T${day.timings[key]}:00`, day.timezone);
        const ts = date.getTime();
        if (ts > now + 30 * 1000 && ts < now + DAYS_AHEAD * DAY_MS) {
          upcoming.push({ identifier: `prayer-${day.date}-${key}`, date, key, isFriday });
        }
      }
    }

    // Keep whatever is already scheduled rather than ending up with nothing.
    if (upcoming.length === 0) {
      console.log("[Notifications] No upcoming prayer times computed, keeping existing");
      return;
    }

    const existing = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      existing
        .filter((n) => n.content.data?.type === "prayer")
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );

    for (const { identifier, date, key, isFriday } of upcoming) {
      const friday = key === "Dhuhr" && isFriday;
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: `موعد ${friday ? FRIDAY_TITLE : PRAYER_TITLES[key]}`,
          body: friday ? FRIDAY_MESSAGE : PRAYER_MESSAGES[key],
          sound: "default",
          data: { type: "prayer", screen: "PrayerTimes", isFriday: friday },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          channelId: PRAYER_CHANNEL_ID,
        },
      });
    }

    await AsyncStorage.setItem(
      SCHEDULE_STATE_KEY,
      JSON.stringify({ signature, scheduledAt: now } satisfies ScheduleState),
    );
    console.log(
      `[Notifications] Scheduled ${upcoming.length} prayer notifications (exact alarms: ${canScheduleExactAlarms()})`,
    );
  } catch (error) {
    console.error("[Notifications] Failed scheduling prayer notifications:", error);
  }
};
