import { APP_VERSION } from "@/constants/General";

export interface VersionInfo {
  version: string;
  changes: string[];
  storeUrl: string;
}

// Hardcoded latest version info
const LATEST_VERSION_INFO: VersionInfo = {
  version: "1.4.1",
  changes: [
    "تحسينات عامة في الأداء واستقرار التطبيق",
    "إصلاح بعض الأخطاء التقنية",
  ],
  storeUrl: "https://play.google.com/store/apps/details?id=com.elsline.een",
};

export const checkForNewUpdate = async (): Promise<VersionInfo | null> => {
  try {
    // التحقق مما إذا كان الإصدار الحالي لا يطابق الإصدار المطلوب
    if (APP_VERSION !== LATEST_VERSION_INFO.version) {
      return LATEST_VERSION_INFO;
    }
    return null;
  } catch (error) {
    console.error("Error checking for updates:", error);
    return null;
  }
};
