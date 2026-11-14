import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontFamily } from "@/constants/FontFamily";
import {
  isPrayerAlarmsAvailable,
  canScheduleExactAlarms,
  openExactAlarmSettings,
} from "@/modules/prayer-alarms";

const DISMISSED_AT_KEY = "exact_alarm_prompt_dismissed_at";
const REMIND_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

// Android 14+ denies exact alarms by default, so prayer notifications arrive late
// (deferred while the phone is idle) until the user enables "Alarms & reminders".
export default function ExactAlarmPrompt({ color }: { color: any }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isPrayerAlarmsAvailable) return;

    const check = async () => {
      if (canScheduleExactAlarms()) {
        setVisible(false);
        return;
      }
      const dismissedAt = Number(await AsyncStorage.getItem(DISMISSED_AT_KEY));
      setVisible(!dismissedAt || Date.now() - dismissedAt > REMIND_AFTER_MS);
    };

    check();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => sub.remove();
  }, []);

  const handleEnable = () => {
    setVisible(false);
    openExactAlarmSettings();
  };

  const handleLater = async () => {
    setVisible(false);
    await AsyncStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleLater}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: color.background }]}>
          <Text style={[styles.title, { color: color.text }]}>
            خلّي الأذان يوصلك في معاده
          </Text>
          <Text style={[styles.message, { color: color.darkText }]}>
            عشان إشعارات الصلاة توصل في وقتها بالظبط حتى لو الموبايل مقفول، فعّل
            صلاحية "المنبّهات والتذكيرات" للتطبيق.
          </Text>
          <View style={styles.buttons}>
            <Pressable
              onPress={handleEnable}
              style={styles.button}
              android_ripple={{ color: color.primary20 }}
            >
              <View style={[styles.buttonContent, { backgroundColor: color.primary }]}>
                <Text style={[styles.buttonText, { color: color.white }]}>تفعيل</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={handleLater}
              style={styles.button}
              android_ripple={{ color: color.primary20 }}
            >
              <View style={[styles.buttonContent, { backgroundColor: color.bg20 }]}>
                <Text style={[styles.buttonText, { color: color.text }]}>لاحقاً</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontFamily: FontFamily.black,
    fontSize: 18,
    textAlign: "center",
  },
  message: {
    marginTop: 8,
    fontFamily: FontFamily.medium,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  buttons: {
    marginTop: 16,
    flexDirection: "row-reverse",
    gap: 12,
  },
  button: {
    flex: 1,
  },
  buttonContent: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: FontFamily.bold,
  },
});
