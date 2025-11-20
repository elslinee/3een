import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VIEW_MODE_KEY = "quran_view_mode_inline";

export const useViewMode = () => {
  const [isInlineMode, setIsInlineMode] = useState(false);
  const [isSwitchingView, setIsSwitchingView] = useState(false);

  useEffect(() => {
    const loadViewMode = async () => {
      try {
        const stored = await AsyncStorage.getItem(VIEW_MODE_KEY);
        if (stored !== null) {
          setIsInlineMode(stored === "true");
        }
      } catch (e) {
        // ignore
      }
    };
    loadViewMode();
  }, []);

  const toggleViewMode = () => {
    setIsSwitchingView(true);
    setTimeout(() => {
      setIsInlineMode((prev) => {
        const next = !prev;
        AsyncStorage.setItem(VIEW_MODE_KEY, String(next)).catch(() => {});
        return next;
      });
      setIsSwitchingView(false);
    }, 0);
  };

  return { isInlineMode, isSwitchingView, toggleViewMode };
};
