import { View, ScrollView } from "react-native";
import HeroSection from "@/components/homeScreen/HeroSection";
import PrayerTimesComponent from "@/components/homeScreen/PrayerTimesComponent";
import { getColors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import ScreenBtn from "@/components/homeScreen/ScreenBtn";
import { QuranIcon, AzkarIcon, BookIcon, CompassIcon } from "@/constants/Icons";
import { navigateToPage } from "@/utils/navigationUtils";
import ChangelogModal from "@/components/ChangelogModal";

export default function HomeScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const CHANGELOG_KEY = "app_changelog_shown_v8";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.background }}>
      <HeroSection color={color} />
      <PrayerTimesComponent color={color} />
      <View
        style={{
          paddingHorizontal: 16,
          marginTop: 24,
          marginBottom: 24,
          gap: 12,
        }}
      >
        <View
          style={{
            flexDirection: "column",

            gap: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
            <ScreenBtn
              style={{ flex: 1 }}
              color={color}
              title="القرآن الكريم"
              Icon={QuranIcon}
              onPress={() => navigateToPage("/quran")}
            />
            <ScreenBtn
              style={{ flex: 1 }}
              color={color}
              title="الأذكار"
              Icon={AzkarIcon}
              onPress={() => navigateToPage("/azkar")}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
            <ScreenBtn
              style={{
                flex: 1,
              }}
              iconWidth={60}
              iconHeight={60}
              color={color}
              title="القبلة"
              Icon={CompassIcon}
              onPress={() => navigateToPage("/qibla")}
              newTab={true}
            />
            <ScreenBtn
              style={{
                flex: 1,
                pointerEvents: "none",
              }}
              iconWidth={45}
              iconHeight={45}
              color={color}
              title="المكتبة"
              Icon={BookIcon}
              onPress={() => ""}
              soon={true}
            />
          </View>
        </View>
      </View>

      {/* First-run changelog modal */}
      <ChangelogModal
        changelogKey={CHANGELOG_KEY}
        version="الإصدار 1.3.0"
        title="آخر التغييرات"
        changes={[
          "إصلاح مشكلة عدم وصول الاشعارات عند عدم وجود اتصال بالانترنت",
          "إصلاح نقص بعض الأذكار - إضافة سور الإخلاص والفلق والناس في أذكار الصباح والمساء",
          "حل مشكلة النسخ في الأذكار",
          "إضافة نافذة خيارات عند الضغط على الآية في نتائج البحث",
          "توحيد تصميم عناصر الآيات في نتائج البحث مع صفحة المفضلة",
          "تحسين زر المشاركة في نتائج البحث لمشاركة الآية كصورة منسقة",
        ]}
        color={color}
      />
    </ScrollView>
  );
}
