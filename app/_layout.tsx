import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { FontFamily } from "@/constants/FontFamily";
export { ErrorBoundary } from "expo-router";
import { ThemeProvider } from "@/context/ThemeContext";
import { useTheme } from "@/context/ThemeContext";
import { PrayerTimesProvider } from "@/context/PrayerTimesContext";
import { LocationProvider } from "@/context/LocationContext";
import { FontSizeProvider } from "@/context/FontSizeContext";
import { StatusBar } from "expo-status-bar";
import { getColors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import usePushNotifications from "@/utils/usePushNotifications";
import * as Notifications from "expo-notifications";
import useAppUpdates from "@/utils/useAppUpdates";
import UpdateModal from "@/components/UpdateModal";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    [FontFamily.extraLight]: require("../assets/fonts/Cairo/Cairo-ExtraLight.ttf"),
    [FontFamily.light]: require("../assets/fonts/Cairo/Cairo-Light.ttf"),
    [FontFamily.regular]: require("../assets/fonts/Cairo/Cairo-Regular.ttf"),
    [FontFamily.medium]: require("../assets/fonts/Cairo/Cairo-Medium.ttf"),
    [FontFamily.bold]: require("../assets/fonts/Cairo/Cairo-Bold.ttf"),
    [FontFamily.extraBold]: require("../assets/fonts/Cairo/Cairo-ExtraBold.ttf"),
    [FontFamily.black]: require("../assets/fonts/Cairo/Cairo-Black.ttf"),
    [FontFamily.quran]: require("../assets/fonts/Quranic/ScheherazadeNew-Regular.ttf"),
    [FontFamily.quranBold]: require("../assets/fonts/Quranic/ScheherazadeNew-Bold.ttf"),
    ...FontAwesome.font,
  });
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }
  return (
    <ThemeProvider>
      <LocationProvider>
        <PrayerTimesProvider>
          <RootLayoutNav />
        </PrayerTimesProvider>
      </LocationProvider>
    </ThemeProvider>
  );
}
function RootLayoutNav() {
  const { theme, colorScheme, isReady } = useTheme();
  const Colors = getColors(theme, colorScheme);
  const router = useRouter();

  // Check for app updates
  const { showUpdateModal, handleRestart, handleLater } = useAppUpdates();

  // Handle notification tap
  usePushNotifications({
    onNotificationResponse: (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;

      // Check if it's a prayer notification
      if (data?.type === "prayer" && data?.screen === "PrayerTimes") {
        // Navigate to PrayerTimes screen
        router.push("/(tabs)/PrayerTimes");
      }
    },
  });

  // Hide splash screen only after theme is loaded
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Wait for theme to be loaded from AsyncStorage
  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors[theme].background }}
      edges={["left", "right", "bottom"]}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors[theme].background,
          },
          headerTintColor: Colors[theme].text,
          headerTitleStyle: {
            fontSize: 16,
            fontFamily: FontFamily.bold,
          },
          contentStyle: {
            backgroundColor: Colors[theme].background,
          },
          animation: "fade",
          animationDuration: 100,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          presentation: "card",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="quran"
          options={{
            title: "القرآن الكريم",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="quran/[surah]"
          options={{
            title: "السورة",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            title: "حول التطبيق",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="changelog"
          options={{
            title: "سجل التغييرات",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="favorites"
          options={{
            title: "المفضلة",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="tasbeeh/[id]"
          options={{
            title: "التسبيح",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="azkar/[category]"
          options={{
            title: "الأذكار",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="azkar"
          options={{
            title: "الأذكار",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="qibla"
          options={{
            title: "القبلة",
            headerShown: false,
          }}
        />
      </Stack>

      {/* Update Modal */}
      <UpdateModal
        visible={showUpdateModal}
        onRestart={handleRestart}
        onLater={handleLater}
      />
    </SafeAreaView>
  );
}
