import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import { useRouter } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AyahModal from "@/components/quranScreen/AyahModal";
import GoBack from "@/components/GoBack";

interface FavoriteAyah {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
}
const toArabicDigits = (value: number | string) => {
  const str = String(value);
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return str.replace(/[0-9]/g, (d) => arabicDigits[Number(d)]);
};
export default function FavoritesScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const router = useRouter();

  const [favoriteAyahs, setFavoriteAyahs] = useState<FavoriteAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAyah, setSelectedAyah] = useState<FavoriteAyah | null>(null);
  const [showAyahModal, setShowAyahModal] = useState(false);
  const [copiedAyahId, setCopiedAyahId] = useState<string | null>(null);
  const copiedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadFavoriteAyahs();
  }, []);

  const loadFavoriteAyahs = async () => {
    try {
      setLoading(true);

      // Load detailed favorites only
      const detailedFavorites = await AsyncStorage.getItem(
        "quran_favorites_detailed"
      );
      if (detailedFavorites) {
        const detailedData = JSON.parse(detailedFavorites);
        const ayahsData: FavoriteAyah[] = detailedData.map((item: any) => {
          // Remove "بسم الله الرحمن الرحيم" if it's the first ayah
          const cleanText =
            item.ayahNumber === 1
              ? item.text
                  .replace("بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ ", "")
                  .trim()
              : item.text;

          return {
            surahNumber: item.surahNumber,
            surahName: item.surahName,
            ayahNumber: item.ayahNumber,
            text: cleanText,
          };
        });
        setFavoriteAyahs(ayahsData);
      } else {
        // If no detailed favorites exist, show empty state
        setFavoriteAyahs([]);
      }
    } catch (error) {
      console.error("Error loading favorite ayahs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAyahPress = (ayah: FavoriteAyah) => {
    setSelectedAyah(ayah);
    setShowAyahModal(true);
  };

  const copyToClipboard = useCallback(
    async (item: FavoriteAyah) => {
      const textToCopy = `${item.text}\n\n${item.surahName} - الآية ${item.ayahNumber}`;
      await Clipboard.setStringAsync(textToCopy);

      const ayahId = `${item.surahNumber}-${item.ayahNumber}`;
      setCopiedAyahId(ayahId);

      Animated.sequence([
        Animated.timing(copiedAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.delay(1500),
        Animated.timing(copiedAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
      ]).start(() => {
        setCopiedAyahId(null);
        copiedAnim.setValue(0);
      });
    },
    [copiedAnim]
  );

  const removeFromFavorites = async (
    ayahNumber: number,
    surahNumber: number
  ) => {
    try {
      // Remove from detailed favorites using both ayahNumber and surahNumber
      const detailedFavorites = await AsyncStorage.getItem(
        "quran_favorites_detailed"
      );
      if (detailedFavorites) {
        const detailedData = JSON.parse(detailedFavorites);
        const newDetailedFavorites = detailedData.filter(
          (item: any) =>
            !(
              item.ayahNumber === ayahNumber && item.surahNumber === surahNumber
            )
        );
        await AsyncStorage.setItem(
          "quran_favorites_detailed",
          JSON.stringify(newDetailedFavorites)
        );
      }

      // Also remove from simple favorites for backward compatibility
      const storedFavorites = await AsyncStorage.getItem("quran_favorites");
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        const newFavorites = favorites.filter(
          (num: number) => num !== ayahNumber
        );
        await AsyncStorage.setItem(
          "quran_favorites",
          JSON.stringify(newFavorites)
        );
      }

      // Update local state using both ayahNumber and surahNumber
      setFavoriteAyahs((prev) =>
        prev.filter(
          (ayah) =>
            !(
              ayah.ayahNumber === ayahNumber && ayah.surahNumber === surahNumber
            )
        )
      );
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const renderFavoriteAyah = ({ item }: { item: FavoriteAyah }) => {
    const ayahId = `${item.surahNumber}-${item.ayahNumber}`;
    const isShowingCopied = copiedAyahId === ayahId;

    return (
      <View style={{ position: "relative", marginBottom: 8 }}>
        <TouchableOpacity
          style={[
            styles.ayahResultItem,
            {
              backgroundColor: color.bg20,
              borderColor: color.border,
            },
          ]}
          onPress={() => handleAyahPress(item)}
          onLongPress={() => copyToClipboard(item)}
        >
          <View style={styles.ayahResultHeader}>
            <Text style={[styles.ayahResultSurah, { color: color.primary }]}>
              {item.surahName}
            </Text>
            <Text style={[styles.ayahResultNumber, { color: color.text20 }]}>
              آية {item.ayahNumber}
            </Text>
          </View>
          <Text
            style={[styles.ayahResultText, { color: color.text }]}
            numberOfLines={3}
          >
            {item.text}
          </Text>
        </TouchableOpacity>

        {/* Copied Notification */}
        {isShowingCopied && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -10,
              left: 0,
              right: 0,
              alignItems: "center",
              justifyContent: "center",
              opacity: copiedAnim,
              transform: [
                {
                  translateY: copiedAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
              zIndex: 1000,
            }}
          >
            <View
              style={{
                backgroundColor: color.primary + "F0",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
                shadowColor: color.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text
                style={{
                  color: color.white,
                  fontFamily: FontFamily.bold,
                  fontSize: 12,
                }}
              >
                تم النسخ ✓
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          backgroundColor: color.background,
        }}
      >
        <ActivityIndicator size="large" color={color.primary} />
        <Text
          style={{
            fontSize: 16,
            fontFamily: FontFamily.medium,
            textAlign: "center",
            marginTop: 16,
            color: color.text,
          }}
        >
          جاري تحميل المفضلة...
        </Text>
      </View>
    );
  }

  if (favoriteAyahs.length === 0) {
    return (
      <View
        style={{ flex: 1, backgroundColor: color.background, paddingTop: 40 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
            borderBottomWidth: 0,
            backgroundColor: color.background,
          }}
        >
          <GoBack
            style={{
              position: "absolute",
              left: 20,
              top: 25,
            }}
          />

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 18,
                marginTop: 10,
                fontFamily: FontFamily.bold,
                textAlign: "center",
                color: color.darkText,
              }}
            >
              المفضلة
            </Text>
          </View>
        </View>

        {/* Empty State */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          <FontAwesome5
            name="heart"
            size={64}
            color={color.darkText}
            style={{ opacity: 0.4, marginBottom: 20 }}
          />
          <Text
            style={{
              fontSize: 19,
              fontFamily: FontFamily.bold,
              textAlign: "center",
              marginBottom: 12,
              color: color.darkText,
            }}
          >
            لا توجد آيات مفضلة
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: FontFamily.medium,
              textAlign: "center",
              opacity: 0.7,
              color: color.darkText,
              marginBottom: 24,
            }}
          >
            اضغط على أي آية في القرآن الكريم لإضافتها للمفضلة
          </Text>
          <TouchableOpacity
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: color.primary,
            }}
            onPress={() => router.push("/quran")}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: FontFamily.medium,
                color: color.white,
              }}
            >
              تصفح القرآن الكريم
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: color.background, paddingTop: 40 }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 20,
          borderBottomWidth: 0,
          backgroundColor: color.background,
        }}
      >
        <GoBack
          style={{
            position: "absolute",
            left: 20,
            top: 25,
          }}
        />

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: FontFamily.bold,
              textAlign: "center",
              color: color.darkText,
            }}
          >
            المفضلة
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: FontFamily.medium,
              textAlign: "center",
              opacity: 0.7,
              color: color.darkText,
            }}
          >
            {favoriteAyahs.length} آية مفضلة
          </Text>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={favoriteAyahs}
        renderItem={renderFavoriteAyah}
        keyExtractor={(item) => `${item.surahNumber}-${item.ayahNumber}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Ayah Modal */}
      <AyahModal
        visible={showAyahModal}
        onClose={() => setShowAyahModal(false)}
        ayah={selectedAyah}
        showGoToSurah={true}
        showRemoveButton={true}
        onRemoveFromFavorites={() => {
          if (selectedAyah) {
            removeFromFavorites(
              selectedAyah.ayahNumber,
              selectedAyah.surahNumber
            );
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ayahResultItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 0,
  },
  ayahResultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ayahResultSurah: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
  },
  ayahResultNumber: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
  ayahResultText: {
    fontSize: 20,
    fontFamily: FontFamily.quranBold,

    lineHeight: 34,
    marginBottom: 8,
  },
});
