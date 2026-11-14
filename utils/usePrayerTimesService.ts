import { useState, useEffect } from "react";
import { AppState } from "react-native";
import PrayerTimesService, { PrayerTimesData } from "./prayerTimesService";
import { useLocation } from "@/context/LocationContext";

// لا نستخدم أي مراقبة مستمرة للموقع لضمان عدم تكرار طلبات الصلاحية

export const usePrayerTimesService = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location } = useLocation();

  useEffect(() => {
    const service = PrayerTimesService.getInstance();

    // Subscribe to updates
    const unsubscribe = service.subscribe((data, isLoading, errorMessage) => {
      setPrayerTimes(data);
      setLoading(isLoading);
      setError(errorMessage);
    });

    // Always show cached immediately, then try background refresh without prompting
    const initializeService = async () => {
      await service.getPrayerTimesPreferCachedThenRefresh();
    };

    initializeService();

    return () => {
      unsubscribe();
      // Note: We don't stop location monitoring here as it should continue
      // even when components unmount, since other components might still need it
    };
  }, [location]);

  // On foreground, refetch only if the day or location changed since the last fetch
  useEffect(() => {
    const service = PrayerTimesService.getInstance();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        service.refreshIfStale();
      }
    });
    return () => {
      sub.remove();
    };
  }, []);

  const refreshPrayerTimes = async () => {
    const service = PrayerTimesService.getInstance();
    const result = await service.refreshPrayerTimes();
    return result;
  };

  const clearCache = async () => {
    const service = PrayerTimesService.getInstance();
    await service.clearCache();
  };

  const stopLocationMonitoring = () => {
    const service = PrayerTimesService.getInstance();
    service.stopLocationMonitoring();
  };

  const startLocationMonitoring = async () => {
    const service = PrayerTimesService.getInstance();
    try {
      await service.startLocationMonitoring();
    } catch (error) {
      console.warn("Could not start location monitoring:", error);
    }
  };

  const isLocationMonitoringActive = () => {
    const service = PrayerTimesService.getInstance();
    return service.isLocationMonitoringActive();
  };

  const hasValidCachedData = async () => {
    const service = PrayerTimesService.getInstance();
    return service.hasValidCachedData();
  };

  return {
    prayerTimes,
    loading,
    error,
    refreshPrayerTimes,
    clearCache,
    stopLocationMonitoring,
    startLocationMonitoring,
    isLocationMonitoringActive,
    hasValidCachedData,
  };
};
