import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FontFamily } from "@/constants/FontFamily";
import { toArabicDigits } from "@/components/quranScreen/utils";
import type { HadithBook } from "@/constants/hadithBooks";
import useBookDownload from "@/hooks/useBookDownload";

interface BookDownloadGateProps {
  book: HadithBook;
  color: any;
  children: React.ReactNode;
}

// Reading needs the whole book stored locally; fetch it on first open.
export default function BookDownloadGate({ book, color, children }: BookDownloadGateProps) {
  const { downloaded, state, start } = useBookDownload(book);

  useEffect(() => {
    if (downloaded === false && state.status === "idle") {
      start();
    }
    // Only auto-start once per mount; retries are explicit via the button.
  }, [downloaded]);

  if (downloaded) return <>{children}</>;

  return (
    <View style={styles.center}>
      {state.status === "error" ? (
        <>
          <MaterialIcons name="cloud-off" size={48} color={color.text20} />
          <Text style={[styles.message, { color: color.darkText }]}>{state.message}</Text>
          <Pressable onPress={start} android_ripple={{ color: color.primary20 }}>
            <View style={[styles.button, { backgroundColor: color.primary }]}>
              <Text style={[styles.buttonText, { color: color.white }]}>إعادة المحاولة</Text>
            </View>
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={color.primary} />
          <Text style={[styles.message, { color: color.darkText }]}>
            {state.status === "saving"
              ? `جارٍ حفظ ${book.title} للقراءة بدون إنترنت… ${toArabicDigits(Math.round(state.progress * 100))}٪`
              : `جارٍ تحميل ${book.title}…`}
          </Text>
          <Text style={[styles.hint, { color: color.darkText }]}>
            يتم التحميل مرة واحدة فقط
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  message: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
    textAlign: "center",
  },
  hint: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    opacity: 0.6,
  },
  button: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    fontFamily: FontFamily.bold,
  },
});
