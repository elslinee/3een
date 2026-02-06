import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import GoBack from "@/components/GoBack";
import AppLogo from "@/components/AppLogo";
import {
  APP_VERSION,
  APP_AUTHOR_FACEBOOK,
  APP_AUTHOR_GITHUB,
  APP_AUTHOR_INSTAGRAM,
  APP_AUTHOR_LINKEDIN,
} from "@/constants/General";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

// أيقونة المميزات
const FeatureIcon = ({ color }: { color: string }) => (
  <FontAwesome6
    name="check-circle"
    size={24}
    color={color}
    style={{ marginTop: 6 }}
  />
);

export default function AboutScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];

  const features = [
    {
      title: "مواقيت الصلاة الدقيقة",
      description:
        "عرض أوقات الصلاة مع إبراز الوقت الحالي وإشعارات قابلة للتخصيص",
    },
    {
      title: "القرآن الكريم الكامل",
      description:
        "تصفح جميع السور مع البحث الفوري والإشارات المرجعية والمشاركة",
    },
    {
      title: "التسبيح الذكي",
      description: "عداد تسبيح تفاعلي مع أهداف يومية وحفظ تلقائي للتقدم",
    },
    {
      title: "نظام الأذكار الكامل",
      description: "8 فئات من الأذكار مع عداد تفاعلي وحفظ التقدم اليومي",
    },
    {
      title: "تغيير حجم الخط",
      description: "إمكانية تخصيص حجم الخط للقرآن الكريم لراحة القراءة",
    },
    {
      title: "النصائح التفاعلية",
      description: "نصائح ذكية تظهر للمستخدمين الجدد لتحسين تجربة الاستخدام",
    },
    {
      title: "التحميل التدريجي",
      description: "نظام تحميل ذكي للقرآن يزيد السرعة ويوفر الذاكرة",
    },
    {
      title: "أنماط ألوان متعددة",
      description:
        "اختر من بين 3 أنماط ألوان جميلة مع دعم الوضع الداكن والفاتح",
    },
    {
      title: "واجهة عربية أنيقة",
      description: "تصميم عصري مريح للعين مع خطوط عربية واضحة",
    },
    {
      title: "أداء سريع",
      description: "تخزين محلي ذكي لتجربة سلسة بدون انتظار",
    },
    {
      title: "مشاركة كصورة منسّقة",
      description: "شارك الآيات والأذكار والتسابيح كصورة جميلة",
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: color.background }]}
      showsVerticalScrollIndicator={false}
    >
      <GoBack style={{ position: "absolute", left: 20, top: 60, zIndex: 1 }} />

      {/* Header with Logo */}
      <View
        style={[
          styles.header,
          { backgroundColor: `${color.primary}15`, paddingTop: 80 },
        ]}
      >
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <AppLogo
            size={100}
            primaryColor={color.primary}
            secondaryColor={color.focusColor}
            backgroundColor="transparent"
          />
        </View>

        <Text style={[styles.appSlogan, { color: color.darkText }]}>
          رفيقك في العبادة والذكر
        </Text>
        <View style={[styles.versionBadge, { backgroundColor: color.primary }]}>
          <Text style={[styles.versionText, { color: color.background }]}>
            الإصدار {APP_VERSION}
          </Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={[styles.description, { color: color.text }]}>
          تطبيق إسلامي شامل يجمع بين مواقيت الصلاة الدقيقة، القرآن الكريم
          الكامل، نظام الأذكار التفاعلي، والتسبيح الذكي في واجهة عربية أنيقة
          ومريحة.
        </Text>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: color.text }]}>
          مميزات التطبيق
        </Text>
        {features.map((feature, index) => (
          <View
            key={index}
            style={[
              styles.featureCard,
              {
                backgroundColor: color.bg20,
                borderLeftColor: color.primary,
              },
            ]}
          >
            <FeatureIcon color={color.primary} />
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: color.text }]}>
                {feature.title}
              </Text>
              <Text
                style={[styles.featureDescription, { color: color.darkText }]}
              >
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Developer Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: color.text }]}>المطور</Text>

        <View style={[styles.developerCard, { backgroundColor: color.bg20 }]}>
          <Text style={[styles.developerName, { color: color.text }]}>
            Ahmed Elsline
          </Text>
          <Text
            style={[styles.developerDescription, { color: color.darkText }]}
          >
            Lazy Software Engineer :)
          </Text>

          {/* Social Media Icons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                { backgroundColor: color.primary + "20" },
              ]}
              onPress={() => Linking.openURL(APP_AUTHOR_GITHUB)}
            >
              <FontAwesome6 name="github" size={24} color={color.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                { backgroundColor: color.primary + "20" },
              ]}
              onPress={() => Linking.openURL(APP_AUTHOR_FACEBOOK)}
            >
              <FontAwesome6 name="facebook" size={24} color={color.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                { backgroundColor: color.primary + "20" },
              ]}
              onPress={() => Linking.openURL(APP_AUTHOR_INSTAGRAM)}
            >
              <FontAwesome6 name="instagram" size={24} color={color.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                { backgroundColor: color.primary + "20" },
              ]}
              onPress={() => Linking.openURL(APP_AUTHOR_LINKEDIN)}
            >
              <FontAwesome6 name="linkedin" size={24} color={color.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: color.darkText }]}>
          جميع الحقوق محفوظة © 2026
        </Text>
        <Text style={{ color: color.darkText }}>© elsline</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 70,
    height: 70,
  },
  appName: {
    fontSize: 28,
    fontFamily: FontFamily.bold,
    marginBottom: 8,
  },
  appSlogan: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
    marginBottom: 12,
  },
  versionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  versionText: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  description: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    lineHeight: 26,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
  },
  developerSection: {
    paddingBottom: 16,
  },
  developerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  developerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  developerInitial: {
    fontSize: 28,
    fontFamily: FontFamily.bold,
  },
  developerDetails: {
    alignItems: "flex-start",
  },
  developerRole: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  footer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    marginBottom: 4,
  },
  advancedCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  advancedTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
  },
  advancedDescription: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    lineHeight: 22,
    marginBottom: 6,
  },
  developerCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  developerName: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    marginBottom: 8,
  },
  developerDescription: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.8,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
