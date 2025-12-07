import React, { useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Modal,
  Share,
  Pressable,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import { useRouter } from "expo-router";
import { QuranIcon } from "@/constants/Icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingScreen from "@/components/LoadingScreen";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import GoBack from "@/components/GoBack";
import { Ionicons } from "@expo/vector-icons";
import { searchAyahs } from "@/utils/QuranApis";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import AppLogo from "@/components/AppLogo";

const { width } = Dimensions.get("window");
const isSmallScreen = width < 380;
const CARD_SIZE = isSmallScreen ? (width - 48) / 2 : (width - 64) / 2;

// بيانات السور
const surahsData = [
  { number: 1, name: "الفاتحة", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, name: "البقرة", numberOfAyahs: 286, revelationType: "Medinan" },
  {
    number: 3,
    name: "آل عمران",
    numberOfAyahs: 200,
    revelationType: "Medinan",
  },
  { number: 4, name: "النساء", numberOfAyahs: 176, revelationType: "Medinan" },
  { number: 5, name: "المائدة", numberOfAyahs: 120, revelationType: "Medinan" },
  { number: 6, name: "الأنعام", numberOfAyahs: 165, revelationType: "Meccan" },
  { number: 7, name: "الأعراف", numberOfAyahs: 206, revelationType: "Meccan" },
  { number: 8, name: "الأنفال", numberOfAyahs: 75, revelationType: "Medinan" },
  { number: 9, name: "التوبة", numberOfAyahs: 129, revelationType: "Medinan" },
  { number: 10, name: "يونس", numberOfAyahs: 109, revelationType: "Meccan" },
  { number: 11, name: "هود", numberOfAyahs: 123, revelationType: "Meccan" },
  { number: 12, name: "يوسف", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 13, name: "الرعد", numberOfAyahs: 43, revelationType: "Medinan" },
  { number: 14, name: "إبراهيم", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 15, name: "الحجر", numberOfAyahs: 99, revelationType: "Meccan" },
  { number: 16, name: "النحل", numberOfAyahs: 128, revelationType: "Meccan" },
  { number: 17, name: "الإسراء", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 18, name: "الكهف", numberOfAyahs: 110, revelationType: "Meccan" },
  { number: 19, name: "مريم", numberOfAyahs: 98, revelationType: "Meccan" },
  { number: 20, name: "طه", numberOfAyahs: 135, revelationType: "Meccan" },
  {
    number: 21,
    name: "الأنبياء",
    numberOfAyahs: 112,
    revelationType: "Meccan",
  },
  { number: 22, name: "الحج", numberOfAyahs: 78, revelationType: "Medinan" },
  {
    number: 23,
    name: "المؤمنون",
    numberOfAyahs: 118,
    revelationType: "Meccan",
  },
  { number: 24, name: "النور", numberOfAyahs: 64, revelationType: "Medinan" },
  { number: 25, name: "الفرقان", numberOfAyahs: 77, revelationType: "Meccan" },
  { number: 26, name: "الشعراء", numberOfAyahs: 227, revelationType: "Meccan" },
  { number: 27, name: "النمل", numberOfAyahs: 93, revelationType: "Meccan" },
  { number: 28, name: "القصص", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 29, name: "العنكبوت", numberOfAyahs: 69, revelationType: "Meccan" },
  { number: 30, name: "الروم", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 31, name: "لقمان", numberOfAyahs: 34, revelationType: "Meccan" },
  { number: 32, name: "السجدة", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 33, name: "الأحزاب", numberOfAyahs: 73, revelationType: "Medinan" },
  { number: 34, name: "سبأ", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 35, name: "فاطر", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 36, name: "يس", numberOfAyahs: 83, revelationType: "Meccan" },
  { number: 37, name: "الصافات", numberOfAyahs: 182, revelationType: "Meccan" },
  { number: 38, name: "ص", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 39, name: "الزمر", numberOfAyahs: 75, revelationType: "Meccan" },
  { number: 40, name: "غافر", numberOfAyahs: 85, revelationType: "Meccan" },
  { number: 41, name: "فصلت", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 42, name: "الشورى", numberOfAyahs: 53, revelationType: "Meccan" },
  { number: 43, name: "الزخرف", numberOfAyahs: 89, revelationType: "Meccan" },
  { number: 44, name: "الدخان", numberOfAyahs: 59, revelationType: "Meccan" },
  { number: 45, name: "الجاثية", numberOfAyahs: 37, revelationType: "Meccan" },
  { number: 46, name: "الأحقاف", numberOfAyahs: 35, revelationType: "Meccan" },
  { number: 47, name: "محمد", numberOfAyahs: 38, revelationType: "Medinan" },
  { number: 48, name: "الفتح", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 49, name: "الحجرات", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 50, name: "ق", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 51, name: "الذاريات", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 52, name: "الطور", numberOfAyahs: 49, revelationType: "Meccan" },
  { number: 53, name: "النجم", numberOfAyahs: 62, revelationType: "Meccan" },
  { number: 54, name: "القمر", numberOfAyahs: 55, revelationType: "Meccan" },
  { number: 55, name: "الرحمن", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 56, name: "الواقعة", numberOfAyahs: 96, revelationType: "Meccan" },
  { number: 57, name: "الحديد", numberOfAyahs: 29, revelationType: "Medinan" },
  {
    number: 58,
    name: "المجادلة",
    numberOfAyahs: 22,
    revelationType: "Medinan",
  },
  { number: 59, name: "الحشر", numberOfAyahs: 24, revelationType: "Medinan" },
  {
    number: 60,
    name: "الممتحنة",
    numberOfAyahs: 13,
    revelationType: "Medinan",
  },
  { number: 61, name: "الصف", numberOfAyahs: 14, revelationType: "Medinan" },
  { number: 62, name: "الجمعة", numberOfAyahs: 11, revelationType: "Medinan" },
  {
    number: 63,
    name: "المنافقون",
    numberOfAyahs: 11,
    revelationType: "Medinan",
  },
  { number: 64, name: "التغابن", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 65, name: "الطلاق", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 66, name: "التحريم", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 67, name: "الملك", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 68, name: "القلم", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 69, name: "الحاقة", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 70, name: "المعارج", numberOfAyahs: 44, revelationType: "Meccan" },
  { number: 71, name: "نوح", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 72, name: "الجن", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 73, name: "المزمل", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 74, name: "المدثر", numberOfAyahs: 56, revelationType: "Meccan" },
  { number: 75, name: "القيامة", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 76, name: "الإنسان", numberOfAyahs: 31, revelationType: "Medinan" },
  { number: 77, name: "المرسلات", numberOfAyahs: 50, revelationType: "Meccan" },
  { number: 78, name: "النبأ", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 79, name: "النازعات", numberOfAyahs: 46, revelationType: "Meccan" },
  { number: 80, name: "عبس", numberOfAyahs: 42, revelationType: "Meccan" },
  { number: 81, name: "التكوير", numberOfAyahs: 29, revelationType: "Meccan" },
  { number: 82, name: "الانفطار", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 83, name: "المطففين", numberOfAyahs: 36, revelationType: "Meccan" },
  { number: 84, name: "الانشقاق", numberOfAyahs: 25, revelationType: "Meccan" },
  { number: 85, name: "البروج", numberOfAyahs: 22, revelationType: "Meccan" },
  { number: 86, name: "الطارق", numberOfAyahs: 17, revelationType: "Meccan" },
  { number: 87, name: "الأعلى", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 88, name: "الغاشية", numberOfAyahs: 26, revelationType: "Meccan" },
  { number: 89, name: "الفجر", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 90, name: "البلد", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 91, name: "الشمس", numberOfAyahs: 15, revelationType: "Meccan" },
  { number: 92, name: "الليل", numberOfAyahs: 21, revelationType: "Meccan" },
  { number: 93, name: "الضحى", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 94, name: "الشرح", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 95, name: "التين", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 96, name: "العلق", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 97, name: "القدر", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 98, name: "البينة", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 99, name: "الزلزلة", numberOfAyahs: 8, revelationType: "Medinan" },
  {
    number: 100,
    name: "العاديات",
    numberOfAyahs: 11,
    revelationType: "Meccan",
  },
  { number: 101, name: "القارعة", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 102, name: "التكاثر", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 103, name: "العصر", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 104, name: "الهمزة", numberOfAyahs: 9, revelationType: "Meccan" },
  { number: 105, name: "الفيل", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 106, name: "قريش", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 107, name: "الماعون", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 108, name: "الكوثر", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 109, name: "الكافرون", numberOfAyahs: 6, revelationType: "Meccan" },
  { number: 110, name: "النصر", numberOfAyahs: 3, revelationType: "Medinan" },
  { number: 111, name: "المسد", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 112, name: "الإخلاص", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 113, name: "الفلق", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 114, name: "الناس", numberOfAyahs: 6, revelationType: "Meccan" },
];

export default function QuranScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const router = useRouter();
  const [isReversed, setIsReversed] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pinnedSurahs, setPinnedSurahs] = useState<number[]>([]);
  const [searchMode, setSearchMode] = useState<"surahs" | "ayahs">("surahs");
  const [ayahSearchResults, setAyahSearchResults] = useState<
    Array<{
      surahNumber: number;
      surahName: string;
      ayahNumber: number;
      text: string;
      translation?: string;
    }>
  >([]);
  const [isSearchingAyahs, setIsSearchingAyahs] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<{
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    text: string;
    translation?: string;
  } | null>(null);
  const [showAyahModal, setShowAyahModal] = useState(false);
  const [favoriteAyahs, setFavoriteAyahs] = useState<
    Array<{ surahNumber: number; ayahNumber: number }>
  >([]);
  const ayahShareViewRef = useRef<View>(null);

  useEffect(() => {
    loadFavoriteAyahs();
  }, []);

  const loadFavoriteAyahs = async () => {
    try {
      const detailedFavorites = await AsyncStorage.getItem(
        "quran_favorites_detailed"
      );
      if (detailedFavorites) {
        const detailedData = JSON.parse(detailedFavorites);
        const favorites = detailedData.map((item: any) => ({
          surahNumber: item.surahNumber,
          ayahNumber: item.ayahNumber,
        }));
        setFavoriteAyahs(favorites);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const isAyahFavorite = (surahNumber: number, ayahNumber: number) => {
    return favoriteAyahs.some(
      (fav) => fav.surahNumber === surahNumber && fav.ayahNumber === ayahNumber
    );
  };

  const toggleFavorite = async (
    surahNumber: number,
    surahName: string,
    ayahNumber: number,
    ayahText: string
  ) => {
    try {
      const isFavorite = isAyahFavorite(surahNumber, ayahNumber);
      const detailedFavorites = await AsyncStorage.getItem(
        "quran_favorites_detailed"
      );
      let detailedData = detailedFavorites ? JSON.parse(detailedFavorites) : [];

      if (isFavorite) {
        // Remove from favorites
        detailedData = detailedData.filter(
          (item: any) =>
            !(
              item.ayahNumber === ayahNumber && item.surahNumber === surahNumber
            )
        );
      } else {
        // Add to favorites
        detailedData.push({
          ayahNumber,
          surahNumber,
          surahName,
          text: ayahText,
          timestamp: new Date().toISOString(),
        });
      }

      await AsyncStorage.setItem(
        "quran_favorites_detailed",
        JSON.stringify(detailedData)
      );

      // Update local state
      if (isFavorite) {
        setFavoriteAyahs((prev) =>
          prev.filter(
            (fav) =>
              !(
                fav.surahNumber === surahNumber && fav.ayahNumber === ayahNumber
              )
          )
        );
      } else {
        setFavoriteAyahs((prev) => [...prev, { surahNumber, ayahNumber }]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleShareAyah = async () => {
    if (!selectedAyah || !ayahShareViewRef.current) {
      return;
    }

    try {
      // Wait a bit to ensure the view is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Double check ref is still valid after waiting
      if (!ayahShareViewRef.current) {
        return;
      }

      // Capture the ayah view as base64 data URI
      const dataUri = await captureRef(ayahShareViewRef.current, {
        format: "png",
        quality: 1,
        result: "data-uri",
      });

      if (!dataUri || !dataUri.startsWith("data:image")) {
        throw new Error("Invalid capture result");
      }

      // Extract base64 data
      const base64Data = dataUri.split(",")[1];

      // Create a file path in cache directory
      const fileName = `ayah_${Date.now()}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      // Write the base64 data to file
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // Share the file with proper MIME type
        await Sharing.shareAsync(fileUri, {
          mimeType: "image/png",
          dialogTitle: "مشاركة آية",
          UTI: "public.png", // iOS only
        });
      }
    } catch (error) {
      console.error("Error sharing ayah as image:", error);
    }
  };

  const handleGoToSurah = () => {
    if (!selectedAyah) return;
    setShowAyahModal(false);
    router.push(`/quran/${selectedAyah.surahNumber}` as any);
  };

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadPinned = async () => {
      try {
        const stored = await AsyncStorage.getItem("quran_pinned_surahs");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setPinnedSurahs(parsed.filter((n) => typeof n === "number"));
          }
        }
      } catch (e) {
        // ignore
      }
    };
    loadPinned();
  }, []);

  const togglePin = async (surahNumber: number) => {
    try {
      const next = pinnedSurahs.includes(surahNumber)
        ? pinnedSurahs.filter((n) => n !== surahNumber)
        : [...pinnedSurahs, surahNumber];
      setPinnedSurahs(next);
      await AsyncStorage.setItem("quran_pinned_surahs", JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };
  // Search in ayahs when search mode is ayahs
  useEffect(() => {
    if (searchMode === "ayahs" && searchText.trim().length > 0) {
      setIsSearchingAyahs(true);
      const timeoutId = setTimeout(async () => {
        try {
          const results = await searchAyahs(searchText);
          setAyahSearchResults(results);
        } catch (error) {
          console.error("Error searching ayahs:", error);
          setAyahSearchResults([]);
        } finally {
          setIsSearchingAyahs(false);
        }
      }, 300); // Debounce search

      return () => {
        clearTimeout(timeoutId);
        setIsSearchingAyahs(false);
      };
    } else {
      setAyahSearchResults([]);
      setIsSearchingAyahs(false);
    }
  }, [searchText, searchMode]);

  // Filter surahs based on search text
  const filteredSurahs = surahsData.filter((surah) =>
    surah.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Separate pinned and unpinned surahs
  const pinnedSet = new Set(pinnedSurahs);
  const pinnedSurahsList = filteredSurahs.filter((surah) =>
    pinnedSet.has(surah.number)
  );
  // Show all surahs in the general list (including pinned ones)
  const unpinnedSurahsList = filteredSurahs;

  // Apply reverse if needed
  const sortedPinnedSurahs = isReversed
    ? [...pinnedSurahsList].reverse()
    : pinnedSurahsList;
  const sortedUnpinnedSurahs = isReversed
    ? [...unpinnedSurahsList].reverse()
    : unpinnedSurahsList;

  // Show loading screen while loading
  if (isLoading) {
    return (
      <LoadingScreen
        message="جاري تحميل السور..."
        customIcon={<QuranIcon width={84} height={84} color={color.primary} />}
      />
    );
  }

  const renderSurah = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.surahItem,
        {
          backgroundColor: color.bg20,
          borderColor: color.border,
        },
      ]}
      onPress={() => {
        router.push(`/quran/${item.number}` as any);
      }}
    >
      <View
        style={{
          backgroundColor: color.primary20,
          width: 60,
          height: 60,
          borderRadius: 99,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        <QuranIcon width={40} height={40} color={color.primary} />
      </View>

      <View style={styles.surahInfo}>
        <Text style={[styles.surahName, { color: color.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.surahDetails, { color: color.darkText }]}>
          {item.numberOfAyahs} آية •{" "}
          {item.revelationType === "Meccan" ? "مكية" : "مدنية"}
        </Text>
      </View>

      <View style={styles.surahIcon}>
        <TouchableOpacity
          onPress={() => togglePin(item.number)}
          accessibilityRole="button"
          accessibilityLabel={
            pinnedSurahs.includes(item.number) ? "Unpin surah" : "Pin surah"
          }
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <FontAwesome5
            name={
              pinnedSurahs.includes(item.number) ? "thumbtack" : "thumbtack"
            }
            size={18}
            color={
              pinnedSurahs.includes(item.number) ? color.primary : color.text20
            }
            style={{
              transform: [
                {
                  rotate: pinnedSurahs.includes(item.number)
                    ? "0deg"
                    : "-20deg",
                },
              ],
            }}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: color.background, paddingTop: 50 },
      ]}
    >
      <View
        style={{
          padding: 20,
          paddingTop: 10,
          borderBottomWidth: 0,
          borderBottomColor: color.border,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <GoBack
          style={{
            position: "absolute",
            left: 20,
            top: 20,
          }}
        />
        <Text style={[styles.headerTitle, { color: color.darkText }]}>
          سور القرآن الكريم
        </Text>
        <Text style={[styles.headerSubtitle, { color: color.darkText }]}>
          {searchMode === "ayahs" && searchText
            ? `${ayahSearchResults.length} آية`
            : searchText
              ? `${filteredSurahs.length} من ${surahsData.length} سورة`
              : `${surahsData.length} سورة`}
        </Text>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: 10,
            justifyContent: "center",
          }}
        >
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: `${color.text20}22`,
                borderWidth: 0,
                flex: 1,
              },
            ]}
          >
            <EvilIcons
              name="search"
              size={28}
              color={searchText.length > 0 ? color.primary : color.text20}
            />
            <TextInput
              key={searchMode}
              style={[
                styles.searchInput,
                {
                  color: color.text,
                },
              ]}
              selectionColor={color.primary}
              placeholder={
                searchMode === "surahs"
                  ? "البحث في السور..."
                  : "البحث في الآيات..."
              }
              placeholderTextColor={color.text20}
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity
              onPress={() => {
                setSearchMode(searchMode === "surahs" ? "ayahs" : "surahs");
              }}
              style={styles.searchModeButton}
            >
              <Text
                style={[
                  styles.searchModeText,
                  {
                    color:
                      searchMode === "ayahs" ? color.primary : color.primary,
                    fontFamily: FontFamily.bold,
                  },
                ]}
              >
                {searchMode === "surahs" ? "آيات" : "سور"}
              </Text>
            </TouchableOpacity>
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText("")}
                style={styles.clearButton}
              >
                <FontAwesome5 name="times" size={15} color={color.text20} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View
          style={{
            width: "100%",
            paddingTop: 16,
          }}
        >
          <View style={styles.actionBtns}>
            {/* Favorites Button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: `${color.text20}22` },
              ]}
              onPress={() => router.push("/favorites")}
            >
              <FontAwesome5 name="heart" size={20} color={color.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: `${color.text20}22` },
              ]}
              onPress={() => setIsReversed(!isReversed)}
            >
              <FontAwesome5
                name={isReversed ? "sort-amount-up" : "sort-amount-down"}
                size={20}
                color={color.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {searchMode === "ayahs" && searchText ? (
        isSearchingAyahs ? (
          <View style={styles.noResultsContainer}>
            <ActivityIndicator size="large" color={color.primary} />
            <Text style={[styles.noResultsText, { color: color.darkText }]}>
              جاري البحث...
            </Text>
          </View>
        ) : ayahSearchResults.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <EvilIcons
              name="search"
              size={78}
              color={color.text20}
              style={{ opacity: 0.5 }}
            />
            <Text style={[styles.noResultsText, { color: color.darkText }]}>
              لم يتم العثور على نتائج
            </Text>
            <Text style={[styles.noResultsSubtext, { color: color.darkText }]}>
              جرب البحث بكلمات مختلفة
            </Text>
          </View>
        ) : (
          <FlatList
            data={ayahSearchResults}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.ayahResultItem,
                  {
                    backgroundColor: color.bg20,
                    borderColor: color.border,
                  },
                ]}
                onPress={() => {
                  setSelectedAyah(item);
                  setShowAyahModal(true);
                }}
              >
                <View style={styles.ayahResultHeader}>
                  <Text
                    style={[styles.ayahResultSurah, { color: color.primary }]}
                  >
                    {item.surahName}
                  </Text>
                  <Text
                    style={[styles.ayahResultNumber, { color: color.text20 }]}
                  >
                    آية {item.ayahNumber}
                  </Text>
                </View>
                <Text
                  style={[styles.ayahResultText, { color: color.text }]}
                  numberOfLines={3}
                >
                  {item.text}
                </Text>
                {item.translation && (
                  <Text
                    style={[
                      styles.ayahResultTranslation,
                      { color: color.text20 },
                    ]}
                    numberOfLines={2}
                  >
                    {item.translation}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) =>
              `${item.surahNumber}-${item.ayahNumber}-${index}`
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )
      ) : filteredSurahs.length === 0 && searchText ? (
        <View style={styles.noResultsContainer}>
          <EvilIcons
            name="search"
            size={78}
            color={color.text20}
            style={{ opacity: 0.5 }}
          />
          <Text style={[styles.noResultsText, { color: color.darkText }]}>
            لم يتم العثور على نتائج
          </Text>
          <Text style={[styles.noResultsSubtext, { color: color.darkText }]}>
            جرب البحث بكلمات مختلفة
          </Text>
        </View>
      ) : (
        <FlatList
          style={{
            borderWidth: 0,
          }}
          data={sortedUnpinnedSurahs}
          renderItem={renderSurah}
          keyExtractor={(item) => item.number.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={100}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          ListHeaderComponent={
            sortedPinnedSurahs.length > 0 ? (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: color.primary }]}>
                    السور المثبتة
                  </Text>
                  <FontAwesome5
                    name="thumbtack"
                    size={16}
                    color={color.primary}
                    style={{ marginLeft: 8 }}
                  />
                </View>
                {sortedPinnedSurahs.map((item) => (
                  <View key={item.number}>{renderSurah({ item })}</View>
                ))}
                <View
                  style={[
                    styles.sectionDivider,
                    { backgroundColor: color.border },
                  ]}
                />
                <View style={styles.sectionHeader}>
                  <Text
                    style={[styles.sectionTitle, { color: color.darkText }]}
                  >
                    جميع السور
                  </Text>
                </View>
              </View>
            ) : null
          }
        />
      )}

      {/* Ayah Modal */}
      <Modal
        visible={showAyahModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAyahModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setShowAyahModal(false)}
        >
          <View
            style={{
              backgroundColor: color.bg20,
              borderRadius: 16,
              padding: 20,
              margin: 20,
              minWidth: "85%",
              maxWidth: "100%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {selectedAyah && (
              <>
                {/* Ayah Text */}
                <Text
                  style={{
                    fontSize: 20,
                    marginBottom: 16,
                    color: color.text,
                    fontFamily: FontFamily.quranBold,
                  }}
                >
                  {selectedAyah.text}
                </Text>

                {/* Surah and Ayah Info */}
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: FontFamily.medium,
                    textAlign: "center",
                    marginBottom: 20,
                    color: color.text,
                    opacity: 0.7,
                  }}
                >
                  {selectedAyah.surahName} - الآية {selectedAyah.ayahNumber}
                </Text>

                {/* Action Buttons */}
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {/* Go to Surah Button - Top */}
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: color.primary20,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 20,
                      width: "100%",
                      justifyContent: "center",
                    }}
                    onPress={handleGoToSurah}
                  >
                    <Text
                      style={{
                        color: color.text,
                        fontFamily: FontFamily.medium,
                        marginRight: 8,
                        fontSize: 11,
                      }}
                    >
                      الذهاب للسورة
                    </Text>
                    <FontAwesome5
                      name="arrow-right"
                      size={14}
                      color={color.text}
                    />
                  </TouchableOpacity>

                  {/* Favorite and Share Buttons - Bottom */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      width: "100%",
                    }}
                  >
                    {/* Favorite Button */}
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: isAyahFavorite(
                          selectedAyah.surahNumber,
                          selectedAyah.ayahNumber
                        )
                          ? color.primary
                          : color.primary20,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        flex: 1,
                        minWidth: "30%",
                        justifyContent: "center",
                      }}
                      onPress={() => {
                        toggleFavorite(
                          selectedAyah.surahNumber,
                          selectedAyah.surahName,
                          selectedAyah.ayahNumber,
                          selectedAyah.text
                        );
                      }}
                    >
                      <FontAwesome6
                        name={
                          isAyahFavorite(
                            selectedAyah.surahNumber,
                            selectedAyah.ayahNumber
                          )
                            ? "heart-circle-check"
                            : "heart"
                        }
                        size={13}
                        color={
                          isAyahFavorite(
                            selectedAyah.surahNumber,
                            selectedAyah.ayahNumber
                          )
                            ? color.white
                            : color.text
                        }
                      />
                      <Text
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: isAyahFavorite(
                            selectedAyah.surahNumber,
                            selectedAyah.ayahNumber
                          )
                            ? color.white
                            : color.text,
                          fontFamily: FontFamily.medium,
                          marginLeft: 8,
                          fontSize: 11,
                        }}
                      >
                        {isAyahFavorite(
                          selectedAyah.surahNumber,
                          selectedAyah.ayahNumber
                        )
                          ? "مفضلة"
                          : "إضافة للمفضلة"}
                      </Text>
                    </TouchableOpacity>

                    {/* Share Button */}
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: color.primary,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        flex: 1,
                        minWidth: "30%",
                        justifyContent: "center",
                      }}
                      onPress={handleShareAyah}
                    >
                      <FontAwesome5
                        name="share-alt"
                        size={13}
                        color={color.white}
                      />
                      <Text
                        style={{
                          color: color.white,
                          fontFamily: FontFamily.medium,
                          marginLeft: 8,
                          fontSize: 11,
                        }}
                      >
                        مشاركة
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Hidden View for screenshot with logo - only visible when capturing */}
      <View
        ref={ayahShareViewRef}
        collapsable={false}
        style={{
          position: "absolute",
          left: -9999,
          top: -9999,
          opacity: 0,
          pointerEvents: "none",
          backgroundColor: color.bg20,
          paddingVertical: 24,
          paddingHorizontal: 20,
          minWidth: 300,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selectedAyah ? (
          <>
            <Text
              style={{
                fontSize: 20,
                marginBottom: 16,
                color: color.text,
                fontFamily: FontFamily.quranBold,
                textAlign: "center",
              }}
            >
              {selectedAyah.text}
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontFamily: FontFamily.medium,
                textAlign: "center",
                marginBottom: 20,
                color: color.text20,
                opacity: 0.7,
              }}
            >
              {selectedAyah.surahName} - الآية {selectedAyah.ayahNumber}
            </Text>

            {/* App Logo for shared image */}
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              <AppLogo
                size={32}
                primaryColor={color.primary + "80"}
                secondaryColor={color.primary + "80"}
                backgroundColor="transparent"
              />
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 16,

    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    textAlign: "right",
  },
  clearButton: {
    padding: 8,

    marginLeft: 8,
  },
  sortButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "transparent",
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  surahItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 0,
  },

  numberText: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 4,
  },
  surahDetails: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    opacity: 0.7,
  },
  surahIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    textAlign: "center",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    opacity: 0.7,
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
  actionBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    alignItems: "center",
  },
  actionBtn: {
    borderRadius: 8,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  searchModeButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  searchModeText: {
    fontSize: 13,
  },
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
  ayahResultTranslation: {
    fontSize: 13,
    fontFamily: FontFamily.regular,

    lineHeight: 20,
    fontStyle: "italic",
  },
});
