import React, { createContext, useState, useEffect, useContext } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ColorSchemeType, ColorSchemesList } from "@/constants/ColorSchemes";
import { setAppNightMode } from "@/modules/prayer-alarms";

export type ThemeMode = "auto" | "light" | "dark";
export type Theme = "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  theme: Theme; // The actual theme being used (resolved from themeMode)
  colorScheme: ColorSchemeType;
  setThemeMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorSchemeType) => void;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "auto",
  theme: "dark",
  colorScheme: "warm",
  setThemeMode: () => {},
  setColorScheme: () => {},
  isReady: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceColorScheme = useRNColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto");
  const [colorScheme, setColorSchemeState] = useState<ColorSchemeType>("warm");
  const [isReady, setIsReady] = useState(false);

  // Resolve the actual theme from themeMode
  const resolvedTheme: Theme = React.useMemo(() => {
    if (themeMode === "auto") {
      return deviceColorScheme === "dark" ? "dark" : "light";
    }
    return themeMode;
  }, [themeMode, deviceColorScheme]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem("APP_THEME_MODE");
        const savedScheme = await AsyncStorage.getItem("APP_COLOR_SCHEME");

        // Migration: Check for old APP_THEME and convert to APP_THEME_MODE
        if (!savedThemeMode) {
          const oldTheme = await AsyncStorage.getItem("APP_THEME");
          if (oldTheme && (oldTheme === "light" || oldTheme === "dark")) {
            // Migrate old theme to new theme mode
            await AsyncStorage.setItem("APP_THEME_MODE", oldTheme);
            setThemeModeState(oldTheme as ThemeMode);
            // Remove old key
            await AsyncStorage.removeItem("APP_THEME");
          } else {
            // Default to auto if no preference exists
            setThemeModeState("auto");
          }
        } else if (
          savedThemeMode === "auto" ||
          savedThemeMode === "light" ||
          savedThemeMode === "dark"
        ) {
          setThemeModeState(savedThemeMode as ThemeMode);
        }

        if (
          savedScheme &&
          savedScheme !== colorScheme &&
          ColorSchemesList.includes(savedScheme as ColorSchemeType)
        ) {
          setColorSchemeState(savedScheme as ColorSchemeType);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsReady(true);
      }
    };
    loadSettings();
  }, []);

  // Keep the system splash screen in sync with the chosen theme (applies on next launch)
  useEffect(() => {
    if (isReady) {
      setAppNightMode(themeMode);
    }
  }, [themeMode, isReady]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem("APP_THEME_MODE", mode);
  };

  const setColorScheme = async (scheme: ColorSchemeType) => {
    setColorSchemeState(scheme);
    await AsyncStorage.setItem("APP_COLOR_SCHEME", scheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        theme: resolvedTheme,
        colorScheme,
        setThemeMode,
        setColorScheme,
        isReady,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
