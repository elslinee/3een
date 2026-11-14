import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";

type PrayerAlarmsNative = {
  canScheduleExactAlarms(): boolean;
  openExactAlarmSettings(): void;
  isIgnoringBatteryOptimizations(): boolean;
  openBatteryOptimizationSettings(): void;
  setAppNightMode(mode: "light" | "dark" | "auto"): void;
};

// Optional so the app still runs in builds made before this native module existed.
const native =
  Platform.OS === "android"
    ? requireOptionalNativeModule<PrayerAlarmsNative>("PrayerAlarms")
    : null;

export const isPrayerAlarmsAvailable = native != null;

export function canScheduleExactAlarms(): boolean {
  return native?.canScheduleExactAlarms() ?? true;
}

export function openExactAlarmSettings(): void {
  native?.openExactAlarmSettings();
}

export function isIgnoringBatteryOptimizations(): boolean {
  return native?.isIgnoringBatteryOptimizations() ?? true;
}

export function openBatteryOptimizationSettings(): void {
  native?.openBatteryOptimizationSettings();
}

// No-op below Android 13 (splash then follows the device's dark mode setting).
export function setAppNightMode(mode: "light" | "dark" | "auto"): void {
  native?.setAppNightMode(mode);
}
