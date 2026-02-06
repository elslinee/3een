import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { getColors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { FontFamily } from "@/constants/FontFamily";
import GoBack from "@/components/GoBack";
import { useCompass } from "@/hooks/useCompass";
import { calculateQibla } from "@/utils/qibla";
import { QiblaView } from "@/components/QiblaView";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function QiblaScreen() {
  const { theme, colorScheme } = useTheme();
  const colors = getColors(theme, colorScheme)[theme];
  const { heading, location, errorMsg } = useCompass();

  const qiblaBearing = useMemo(() => {
    if (location?.coords) {
      return calculateQibla(
        location.coords.latitude,
        location.coords.longitude,
      );
    }
    return null;
  }, [location]);

  const isAligned = useMemo(() => {
    if (heading === null || qiblaBearing === null) return false;
    const diff = Math.abs(((qiblaBearing - heading + 540) % 360) - 180);
    return diff <= 5; // Match tolerance in CompassView
  }, [heading, qiblaBearing]);
  // const isAligned = true;
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <GoBack
          style={{
            position: "absolute",
            left: 20,
            top: 40,
          }}
        />
        <Text style={[styles.headerTitle, { color: colors.darkText }]}>
          القبلة
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.darkText }]}>
          حدد اتجاه القبلة للصلاة
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons
                name="map-marker-off"
                size={60}
                color={colors.primary}
              />
              <Text style={[styles.errorText, { color: colors.text }]}>
                {errorMsg === "Permission to access location was denied"
                  ? "يرجى تفعيل صلاحية الوصول للموقع لتحديد القبلة بدقة"
                  : "حدث خطأ في تشغيل البوصلة"}
              </Text>
            </View>
          ) : heading !== null && qiblaBearing !== null ? (
            <>
              {isAligned && (
                <View
                  style={[styles.alignedBadge, { backgroundColor: "#4CAF50" }]}
                >
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={20}
                    color="white"
                  />
                  <Text style={styles.alignedText}>أنت الآن باتجاه القبلة</Text>
                </View>
              )}

              <QiblaView
                heading={heading}
                qiblaBearing={qiblaBearing}
                primaryColor={colors.primary}
                textColor={colors.text}
              />

              <View style={styles.infoContainer}>
                <View
                  style={[styles.infoItem, { backgroundColor: colors.bg20 }]}
                >
                  <Text style={[styles.infoLabel, { color: colors.grey }]}>
                    الدرجة الحالية
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {`${Math.round(heading)}°`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.infoItem,
                    {
                      backgroundColor: colors.bg20,
                      borderColor: isAligned ? "#4CAF50" : "transparent",
                      borderWidth: isAligned ? 1 : 0,
                    },
                  ]}
                >
                  <Text style={[styles.infoLabel, { color: colors.grey }]}>
                    زاوية القبلة
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {`${Math.round(qiblaBearing)}°`}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.tipContainer,
                  { backgroundColor: colors.primary20 },
                ]}
              >
                <MaterialCommunityIcons
                  name="phone-rotate-landscape"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.tipText, { color: colors.text }]}>
                  ضع الهاتف بشكل مسطح وبعيداً عن المعادن للحصول على أفضل دقة
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                جاري تحميل البوصلة...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    opacity: 0.8,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
  },
  loadingContainer: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontFamily: FontFamily.regular,
    fontSize: 16,
  },
  errorBox: {
    alignItems: "center",
    padding: 40,
    textAlign: "center",
  },
  errorText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 24,
  },
  alignedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 0,
    zIndex: 10,
   
  },
  alignedText: {
    color: "white",
    fontFamily: FontFamily.bold,
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 30,
    paddingHorizontal: 10,
    width: "100%",
  },
  infoItem: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
  },
  tipContainer: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    width: "100%",
  },
  tipText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
  },
});
