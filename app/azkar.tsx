import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { getColors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { FontFamily } from "@/constants/FontFamily";
import GoBack from "@/components/GoBack";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const isSmallScreen = width < 380;
const CARD_SIZE = isSmallScreen ? (width - 48) / 2 : (width - 64) / 2;

type AzkarCategory = {
  title: string;
  icon:
    | keyof typeof Ionicons.glyphMap
    | keyof typeof MaterialCommunityIcons.glyphMap;
  iconSet: "ionicons" | "materialCommunity";

  description: string;
};

const azkarCategories: AzkarCategory[] = [
  {
    title: "أذكار الصباح",
    icon: "sunny",
    iconSet: "ionicons",
    description: "ابدأ يومك بذكر الله",
  },
  {
    title: "أذكار المساء",
    icon: "moon",
    iconSet: "ionicons",
    description: "اختم يومك بالذكر والدعاء",
  },
  {
    title: "أذكار النوم",
    icon: "bed",
    iconSet: "ionicons",
    description: "نم على ذكر الله",
  },
];
const azkarAllCategories: AzkarCategory[] = [
  {
    title: "تسابيح",
    icon: "hand-left",
    iconSet: "ionicons",
    description: "سبح الله وذكره",
  },
  {
    title: "أذكار الاستيقاظ",
    icon: "alarm",
    iconSet: "ionicons",
    description: "استيقظ بذكر الله",
  },
  {
    title: "أدعية قرآنية",
    icon: "book",
    iconSet: "ionicons",
    description: "أدعية من القرآن الكريم",
  },
  {
    title: "أذكار بعد الصلاة المفروضة",
    icon: "hands-pray",
    iconSet: "materialCommunity",
    description: "أذكار بعد الصلاة",
  },
  {
    title: "أدعية الأنبياء",
    icon: "people",
    iconSet: "ionicons",
    description: "أدعية الأنبياء والرسل",
  },
  {
    title: "أذكار الصباح",
    icon: "sunny",
    iconSet: "ionicons",
    description: "ابدأ يومك بذكر الله",
  },
  {
    title: "أذكار المساء",
    icon: "moon",
    iconSet: "ionicons",
    description: "اختم يومك بالذكر والدعاء",
  },
  {
    title: "أذكار النوم",
    icon: "bed",
    iconSet: "ionicons",
    description: "نم على ذكر الله",
  },
];

export default function AzkarScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: "/azkar/[category]",
      params: { category },
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: color.background, paddingTop: insets.top },
      ]}
    >
      <GoBack />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: color.darkText }]}>
          الأذكار اليومية
        </Text>
        <Text style={[styles.headerSubtitle, { color: color.darkText }]}>
          اذكر الله يذكرك
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: color.primary }]}>
            الأذكار المميزة
          </Text>
          <View
            style={[
              styles.cardsContainer,
              {
                flexDirection: "column",
                gap: 12,
              },
            ]}
          >
            {azkarCategories.slice(0, 3).map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleCategoryPress(category.title)}
                style={[
                  styles.card,
                  {
                    minHeight: 120,
                    flexDirection: "row-reverse",
                    gap: 12,
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    backgroundColor: color.bg20,
                    borderColor: color.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: color.primary20,
                      marginBottom: 0,
                      width: 64,
                      height: 64,
                    },
                  ]}
                >
                  {category.iconSet === "ionicons" ? (
                    <Ionicons
                      name={category.icon as any}
                      size={32}
                      color={color.primary}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={category.icon as any}
                      size={32}
                      color={color.primary}
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.cardTitle, { color: color.text }]}
                    numberOfLines={2}
                  >
                    {category.title}
                  </Text>
                  <Text
                    style={[styles.cardDescription, { color: color.darkText }]}
                    numberOfLines={1}
                  >
                    {category.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* All Categories */}
        <View style={[styles.section]}>
          <Text style={[styles.sectionTitle, { color: color.darkText }]}>
            جميع الأذكار
          </Text>
          <View
            style={[
              styles.cardsContainer,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            {azkarAllCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleCategoryPress(category.title)}
                style={[
                  styles.card,
                  {
                    width: CARD_SIZE,

                    backgroundColor: color.bg20,
                    borderColor: color.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: color.primary20 },
                  ]}
                >
                  {category.iconSet === "ionicons" ? (
                    <Ionicons
                      name={category.icon as any}
                      size={28}
                      color={color.primary}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={category.icon as any}
                      size={28}
                      color={color.primary}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.cardTitle,
                    { minHeight: 40, color: color.text },
                  ]}
                  numberOfLines={1}
                >
                  {category.title}
                </Text>
                <Text
                  style={[styles.cardDescription, { color: color.darkText }]}
                  numberOfLines={1}
                >
                  {category.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
  },
  cardsContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  card: {
    minHeight: 196,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    opacity: 0.7,
  },
});
