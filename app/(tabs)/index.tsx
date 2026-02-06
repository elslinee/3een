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
  const CHANGELOG_KEY = "app_changelog_shown_v9";

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
        version="الإصدار 1.4.0"
        title="آخر التغييرات"
        changes={[
          "إطلاق ميزة تحديد اتجاه القبلة بتصميم بوصلة احترافية وفخمة",
          "تحسين كبير في استجابة تحديد الموقع (GPS) وسرعة الحصول على الاحداثيات",
          "عرض الاتجاهات الأربعة والفرعية ودرجات الزوايا بدقة عالية على البوصلة",
          "تحسينات عامة في الأداء واستقرار التطبيق",
        ]}
        color={color}
      />
    </ScrollView>
  );
}
