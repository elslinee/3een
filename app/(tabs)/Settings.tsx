import React from "react";
import { ScrollView } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { navigateToPage } from "@/utils/navigationUtils";
import {
  SettingSection,
  SettingCard,
  SettingItem,
  ThemeToggleItem,
  ColorSchemeSelector,
  AppVersionFooter,
} from "@/components/settingsScreen";

export default function Settings() {
  const { theme, colorScheme, setColorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];

  return (
    <ScrollView
      style={{ flex: 1, paddingTop: 0, backgroundColor: color.background }}
      showsVerticalScrollIndicator={false}
    >
      {/* قسم المظهر */}
      <SettingSection title="المظهر" color={color}>
        <SettingCard color={color}>
          <ThemeToggleItem color={color} />
        </SettingCard>
      </SettingSection>

      {/* قسم نمط الألوان */}
      <SettingSection title="نمط الألوان" color={color}>
        <SettingCard color={color} padding={16}>
          <ColorSchemeSelector
            currentScheme={colorScheme}
            theme={theme}
            onSelect={setColorScheme}
            color={color}
          />
        </SettingCard>
      </SettingSection>

      {/* قسم عام */}
      <SettingSection title="عام" color={color}>
        <SettingCard color={color} padding={16}>
          <SettingItem
            title="سجل التغييرات"
            description="آخر التحديثات والتحسينات"
            iconName="history"
            iconSize={22}
            onPress={() => navigateToPage("/changelog")}
            color={color}
            showBorder={true}
          />
          <SettingItem
            title="حول التطبيق"
            description="معلومات عن تطبيق عين"
            iconName="info-circle"
            onPress={() => navigateToPage("/about")}
            color={color}
            showBorder={false}
          />
        </SettingCard>
      </SettingSection>

      {/* معلومات الإصدار */}
      <AppVersionFooter color={color} />
    </ScrollView>
  );
}
