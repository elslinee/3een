import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  AppState,
  Linking,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FontFamily } from "@/constants/FontFamily";
import { ANDROID_PACKAGE } from "@/constants/General";
import { isStoreUpdateAvailable } from "@/modules/play-updates";

// "Later" only snoozes: the prompt comes back on the next launch, or when the app
// returns to the foreground after this long, until Play reports no newer version.
const SNOOZE_MS = 60 * 60 * 1000;

const openStorePage = async () => {
  try {
    await Linking.openURL(`market://details?id=${ANDROID_PACKAGE}`);
  } catch {
    await Linking.openURL(`https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`);
  }
};

export default function StoreUpdatePrompt({ color }: { color: any }) {
  const [visible, setVisible] = useState(false);
  const snoozedAt = useRef(0);

  useEffect(() => {
    let active = true;
    const check = async () => {
      if (Date.now() - snoozedAt.current < SNOOZE_MS) return;
      const available = await isStoreUpdateAvailable();
      if (active) setVisible(available);
    };

    check();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  const handleUpdate = () => {
    snoozedAt.current = Date.now();
    setVisible(false);
    openStorePage();
  };

  const handleLater = () => {
    snoozedAt.current = Date.now();
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleLater}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: color.background }]}>
          <View style={[styles.icon, { backgroundColor: color.primary20 }]}>
            <MaterialIcons name="system-update" size={30} color={color.primary} />
          </View>
          <Text style={[styles.title, { color: color.text }]}>تحديث جديد متاح</Text>
          <Text style={[styles.message, { color: color.darkText }]}>
            يتوفر إصدار أحدث من التطبيق على متجر Google Play يتضمن تحسينات وإصلاحات.
            حدّث الآن للحصول على أفضل تجربة.
          </Text>
          <View style={styles.buttons}>
            <Pressable
              onPress={handleUpdate}
              style={styles.button}
              android_ripple={{ color: color.primary20 }}
            >
              <View style={[styles.buttonContent, { backgroundColor: color.primary }]}>
                <Text style={[styles.buttonText, { color: color.white }]}>تحديث</Text>
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
    alignItems: "center",
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
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
    alignSelf: "stretch",
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
