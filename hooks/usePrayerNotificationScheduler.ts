import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useLocation } from "@/context/LocationContext";
import { schedulePrayerNotifications } from "@/utils/prayerNotificationScheduler";

// Mounted once at the app root so scheduling never depends on which screen the user opens.
export default function usePrayerNotificationScheduler() {
  const { location } = useLocation();
  const latitude = location?.coords.latitude;
  const longitude = location?.coords.longitude;
  const coordsRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    coordsRef.current = { latitude, longitude };
    schedulePrayerNotifications({ latitude, longitude }, { force: true });
  }, [latitude, longitude]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && coordsRef.current) {
        schedulePrayerNotifications(coordsRef.current);
      }
    });
    return () => sub.remove();
  }, []);
}
