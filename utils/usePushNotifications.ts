import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface UsePushNotificationsOptions {
  onNotificationResponse?: (
    response: Notifications.NotificationResponse,
  ) => void;
}

// Notification permission and the Android channel are set up by
// prayerNotificationScheduler; this hook only listens for taps.
export default function usePushNotifications(
  options?: UsePushNotificationsOptions,
) {
  // Callers pass a fresh object every render; read the latest callback through a ref
  // so the listener is registered once instead of on every render.
  const onResponseRef = useRef(options?.onNotificationResponse);
  onResponseRef.current = options?.onNotificationResponse;

  useEffect(() => {
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        onResponseRef.current?.(response);
      });

    return () => responseListener.remove();
  }, []);
}
