import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { captureRef } from "react-native-view-shot";
import { Animated, Easing } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import GoBack from "@/components/GoBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTasbeehItem } from "@/hooks/useTasbeehItem";
import { useSound } from "@/hooks/useSound";
import {
  CounterCard,
  ActionButton,
  ResetModal,
  GoalReachedToast,
  CopiedToast,
  ShareView,
  type TasbeehItem,
} from "@/components/tasbeehDetail";

export default function TasbeehDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, colorScheme } = useTheme();
  const themeColors = getColors(theme, colorScheme)[theme];
  const insets = useSafeAreaInsets();
  const { item, setItem, persist } = useTasbeehItem(id);
  const { soundEnabled, toggleSound, playTapSound } = useSound();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [showResetModal, setShowResetModal] = useState(false);
  const [showGoalReached, setShowGoalReached] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const goalToastAnim = useRef(new Animated.Value(0)).current;
  const copiedAnim = useRef(new Animated.Value(0)).current;
  const counterViewRef = useRef<View>(null);
  const buttonViewRef = useRef<View>(null);
  const completedDailyGoalColor = themeColors.focusColor;

  // Get screen dimensions for responsive design
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const isSmallScreen = screenWidth < 300 || screenHeight < 800;

  // Calculate progress
  const progress = useMemo(() => {
    if (!item || item.dailyGoal <= 0) return 0;
    return Math.min(item.count / item.dailyGoal, 1);
  }, [item]);

  // Initialize progress animation only when item ID changes (new item loaded)
  useEffect(() => {
    if (item) {
      const initialProgress =
        item.dailyGoal > 0 ? Math.min(item.count / item.dailyGoal, 1) : 0;
      // Stop any ongoing animation first
      progressAnim.stopAnimation((currentValue) => {
        // Only animate if there's a significant difference to avoid jumps
        if (
          currentValue !== undefined &&
          Math.abs(currentValue - initialProgress) > 0.01
        ) {
          Animated.timing(progressAnim, {
            toValue: initialProgress,
            duration: 200,
            useNativeDriver: false,
            easing: Easing.out(Easing.cubic),
          }).start();
        } else {
          // If close or undefined, just set directly
          progressAnim.setValue(initialProgress);
        }
      });
    }
  }, [item?.id, progressAnim]); // Only when item ID changes (new item loaded)

  // Pulse animation loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const playPressAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 140,
      }),
    ]).start();
  }, [scaleAnim]);

  const increment = useCallback(() => {
    if (!item) return;

    // Play sound immediately (non-blocking, fire and forget)
    playTapSound();

    playPressAnimation();

    const today = new Date().toISOString().split("T")[0];
    const currentTotalCount = (item.totalCount || 0) + 1;
    const history = item.history || [];

    // Update or add today's entry in history
    const todayIndex = history.findIndex((h) => h.date === today);
    let updatedHistory;
    if (todayIndex >= 0) {
      updatedHistory = history.map((h, i) =>
        i === todayIndex ? { ...h, count: h.count + 1 } : h
      );
    } else {
      updatedHistory = [...history, { date: today, count: 1 }];
    }

    const next = {
      ...item,
      count: item.count + 1,
      totalCount: currentTotalCount,
      lastUsedDate: today,
      history: updatedHistory,
    };
    const newProgress =
      item.dailyGoal > 0 ? Math.min(next.count / item.dailyGoal, 1) : 0;

    // Stop any ongoing animation and animate from current value
    progressAnim.stopAnimation((currentValue) => {
      Animated.timing(progressAnim, {
        toValue: newProgress,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }).start();
    });

    // Check if goal reached - show toast notification
    if (next.count === item.dailyGoal && item.dailyGoal > 0) {
      setShowGoalReached(true);
      Animated.sequence([
        Animated.timing(goalToastAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.delay(2000),
        Animated.timing(goalToastAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
      ]).start(() => {
        setShowGoalReached(false);
        goalToastAnim.setValue(0);
      });
    }

    setItem(next);
    persist(next);
  }, [
    item,
    persist,
    playPressAnimation,
    progressAnim,
    goalToastAnim,
    playTapSound,
    setItem,
  ]);

  const reset = useCallback(() => {
    if (!item) return;
    setShowResetModal(true);
  }, [item]);

  const confirmReset = useCallback(() => {
    if (!item) return;
    const next = { ...item, count: 0 };

    // Stop any ongoing animation and animate from current value to 0
    progressAnim.stopAnimation(() => {
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }).start();
    });

    setItem(next);
    persist(next);
    setShowResetModal(false);
  }, [item, persist, progressAnim, setItem]);

  const cancelReset = useCallback(() => {
    setShowResetModal(false);
  }, []);

  const shareCounter = useCallback(async () => {
    if (!item || !counterViewRef.current) return;

    try {
      // Wait a bit to ensure the view is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Capture the counter view as base64 data URI
      const dataUri = await captureRef(counterViewRef.current, {
        format: "png",
        quality: 1,
        result: "data-uri",
      });

      // Extract base64 data
      const base64Data = dataUri.split(",")[1];

      // Create a file path in cache directory
      const fileName = `tasbeeh_${Date.now()}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      // Write the base64 data to file
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // Share the file with proper MIME type
        await Sharing.shareAsync(fileUri, {
          mimeType: "image/png",
          dialogTitle: "مشاركة صورة التسبيح",
          UTI: "public.png", // iOS only
        });
      } else {
        // Fallback: copy to clipboard
        await Clipboard.setStringAsync(item.name);
      }
    } catch (error) {
      console.error("Error sharing counter:", error);
      // Fallback: copy to clipboard on error
      try {
        await Clipboard.setStringAsync(item.name);
      } catch (e) {
        console.error("Error copying to clipboard:", e);
      }
    }
  }, [item]);

  const copyToClipboard = useCallback(async () => {
    if (!item) return;
    await Clipboard.setStringAsync(item.name);
    setShowCopied(true);
    Animated.sequence([
      Animated.timing(copiedAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.delay(1500),
      Animated.timing(copiedAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
    ]).start(() => {
      setShowCopied(false);
      copiedAnim.setValue(0);
    });
  }, [item, copiedAnim]);

  const handleButtonPress = useCallback(() => {
    if (progress >= 1) {
      confirmReset();
    } else {
      increment();
    }
  }, [progress, confirmReset, increment]);

  if (!item) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: themeColors.background,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: insets.top + 16,
            right: 12,
            zIndex: 10,
          }}
        >
          <Pressable
            onPress={reset}
            android_ripple={{ color: themeColors.primary20 }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: themeColors.bg20,
                borderWidth: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: themeColors.text,
                  fontFamily: FontFamily.bold,
                  fontSize: 16,
                }}
              >
                ↺
              </Text>
            </View>
          </Pressable>
        </View>
        <Text style={{ color: themeColors.text, fontFamily: FontFamily.bold }}>
          التسبيح غير موجود
        </Text>
      </View>
    );
  }

  const bottomButtonSize = isSmallScreen ? 150 : 170;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: themeColors.background,
        paddingTop: insets.top + 11,
      }}
    >
      <GoBack />
      <View
        style={{
          justifyContent: "space-between",
          flex: 1,
          padding: 20,
          backgroundColor: themeColors.background,
        }}
      >
        <View
          style={{
            alignItems: "center",
            gap: 16,
            paddingTop: 40,
          }}
        >
          <CounterCard
            item={item}
            progress={progress}
            progressAnim={progressAnim}
            isSmallScreen={isSmallScreen}
            color={themeColors}
            completedColor={completedDailyGoalColor}
            onCopy={copyToClipboard}
            onShare={shareCounter}
            onReset={reset}
            onToggleSound={toggleSound}
            soundEnabled={soundEnabled}
          />
        </View>

        {/* Hidden View for screenshot with logo - only visible when capturing */}
        <View
          ref={counterViewRef}
          collapsable={false}
          style={{
            position: "absolute",
            left: -9999,
            top: -9999,
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          {item && (
            <ShareView
              item={item}
              isSmallScreen={isSmallScreen}
              color={themeColors}
              completedColor={completedDailyGoalColor}
            />
          )}
        </View>

        <View style={{ gap: 12, paddingBottom: 16, paddingTop: 16 }}>
          <ActionButton
            progress={progress}
            size={bottomButtonSize}
            color={themeColors}
            completedColor={completedDailyGoalColor}
            onPress={handleButtonPress}
            pulseAnim={pulseAnim}
            scaleAnim={scaleAnim}
          />
        </View>
      </View>

      <ResetModal
        visible={showResetModal}
        onConfirm={confirmReset}
        onCancel={cancelReset}
        color={themeColors}
      />

      <CopiedToast
        visible={showCopied}
        animValue={copiedAnim}
        color={themeColors}
      />

      <GoalReachedToast
        visible={showGoalReached}
        animValue={goalToastAnim}
        color={themeColors}
        completedColor={completedDailyGoalColor}
      />
    </View>
  );
}
