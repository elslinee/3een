import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";

type PlayUpdatesNative = {
  checkForUpdate(): Promise<{ available: boolean; availableVersionCode: number }>;
};

const native =
  Platform.OS === "android"
    ? requireOptionalNativeModule<PlayUpdatesNative>("PlayUpdates")
    : null;

/**
 * True when Google Play has a newer version than the installed one. False when up to
 * date or when Play can't be asked (not installed from Play, offline, older build).
 */
export const isStoreUpdateAvailable = async (): Promise<boolean> => {
  if (!native) return false;
  try {
    const info = await native.checkForUpdate();
    return info.available;
  } catch (error) {
    console.log("[PlayUpdates] Update check unavailable:", (error as Error)?.message);
    return false;
  }
};
