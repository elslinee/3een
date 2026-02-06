import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getColors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { FontFamily } from "@/constants/FontFamily";
import GoBack from "@/components/GoBack";
import { useState, useEffect } from "react";
import AzkarSwiper from "@/components/azkarScreen/AzkarSwiper";

type Zikr = {
  category: string;
  count: string;
  description: string;
  reference: string;
  content: string;
};

const FAVORITES_KEY = "azkar_favorites";

export default function AzkarCategoryScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const params = useLocalSearchParams();
  const router = useRouter();
  const category = params.category as string;

  const [azkar, setAzkar] = useState<Zikr[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      await loadFavorites();
      await loadAzkar();
    };
    initializeData();
  }, [category]);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const favArray = JSON.parse(stored);
        const favKeys = favArray
          .filter((fav: Zikr) => fav.category === category)
          .map((fav: Zikr) => `${fav.category}|||${fav.content}`);
        setFavorites(favKeys);
      } else {
        setFavorites([]);
      }
      setFavoritesLoaded(true);
    } catch (error) {
      console.error("Error loading favorites:", error);
      setFavorites([]);
      setFavoritesLoaded(true);
    }
  };

  const loadAzkar = async () => {
    try {
    
      const { default: AzkarData } = await import("@/assets/json/Azkar.json");
      const categoryAzkar = (AzkarData as any)[category];

      if (categoryAzkar && Array.isArray(categoryAzkar)) {
        setAzkar(categoryAzkar);
      } else {
        Alert.alert("خطأ", "لم يتم العثور على الأذكار");
        router.back();
      }
    } catch (error) {
      console.error("Error loading azkar:", error);
      Alert.alert("خطأ", "حدث خطأ في تحميل الأذكار");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading || !favoritesLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: color.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <GoBack
        style={{
          position: "absolute",
          left: 20,
          top: 70,
          zIndex: 1000,
        }}
      />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: color.darkText }]}>
          {category}
        </Text>
      </View>

      <AzkarSwiper azkar={azkar} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
  },
  header: {
    paddingTop: 70,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    maxWidth: 140,
    fontSize: 20,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: 5,
    lineHeight: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 12,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
  sectionDivider: {
    height: 2,
    marginTop: 18,
    marginBottom: 12,
    marginHorizontal: 0,
    borderRadius: 1,
  },
});
