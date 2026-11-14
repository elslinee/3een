import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import { useLocation } from "@/context/LocationContext";
import { searchPlaces, PlaceSearchResult } from "@/utils/searchPlaces";
import GoBack from "@/components/GoBack";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function SelectLocationScreen() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { restartLocation, setManualLocation } = useLocation();

  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [infoDialog, setInfoDialog] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const handleUseCurrentLocation = async () => {
    setIsRestarting(true);
    try {
      const success = await restartLocation();
      if (success) {
        router.back();
      } else {
        setInfoDialog({
          title: "تعذر تحديد الموقع",
          message: "اتأكد إن خدمة الموقع (GPS) مفعّلة وحاول تاني",
        });
      }
    } finally {
      setIsRestarting(false);
    }
  };

  // Responses can arrive out of order while typing; only the latest request may update the UI
  const latestSearchId = useRef(0);

  const runSearch = async (query: string, announceEmpty: boolean) => {
    const searchId = ++latestSearchId.current;
    setIsSearching(true);
    try {
      const found = await searchPlaces(query);
      if (searchId !== latestSearchId.current) return;
      setResults(found);
      if (found.length === 0 && announceEmpty) {
        setInfoDialog({
          title: "مفيش نتائج",
          message: "جرب تكتب اسم مكان تاني",
        });
      }
    } catch (error: any) {
      if (searchId !== latestSearchId.current) return;
      console.error(
        "خطأ في البحث عن المكان:",
        error?.message,
        error?.response?.status,
        JSON.stringify(error?.response?.data),
      );
      if (announceEmpty) {
        setInfoDialog({
          title: "خطأ",
          message: "حصل خطأ أثناء البحث عن الموقع",
        });
      }
    } finally {
      if (searchId === latestSearchId.current) {
        setIsSearching(false);
      }
    }
  };

  // Live suggestions as the user types (debounced)
  useEffect(() => {
    const query = searchText.trim();
    if (query.length < 2) {
      latestSearchId.current++;
      setIsSearching(false);
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      runSearch(query, false);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const handleSearch = async () => {
    const query = searchText.trim();
    if (!query) return;
    await runSearch(query, true);
  };

  const handleSelectResult = async (result: PlaceSearchResult) => {
    await setManualLocation(
      { latitude: result.latitude, longitude: result.longitude },
      result.address,
    );
    router.back();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: color.background, paddingTop: insets.top + 16 },
      ]}
    >
      <GoBack />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: color.text }]}>
          اختيار الموقع
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.currentLocationButton,
          { backgroundColor: `${color.primary}15` },
        ]}
        onPress={handleUseCurrentLocation}
        disabled={isRestarting}
      >
        {isRestarting ? (
          <ActivityIndicator size="small" color={color.primary} />
        ) : (
          <MaterialIcons name="my-location" size={20} color={color.primary} />
        )}
        <Text style={[styles.currentLocationText, { color: color.primary }]}>
          إعادة تحديد موقعي الحالي
        </Text>
      </TouchableOpacity>

      <Text style={[styles.orText, { color: color.grey }]}>
        أو ابحث عن مكان يدوياً
      </Text>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: `${color.text20}22` },
        ]}
      >
        <EvilIcons name="search" size={26} color={color.text20} />
        <TextInput
          style={[styles.searchInput, { color: color.text }]}
          placeholder="اكتب اسم المدينة أو المكان..."
          placeholderTextColor={color.text20}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          selectionColor={color.primary}
        />
      </View>

      <TouchableOpacity
        style={[styles.searchButton, { backgroundColor: color.primary }]}
        onPress={handleSearch}
        disabled={isSearching || !searchText.trim()}
      >
        {isSearching ? (
          <ActivityIndicator size="small" color={color.background} />
        ) : (
          <Text style={[styles.searchButtonText, { color: color.background }]}>
            بحث
          </Text>
        )}
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingTop: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.resultItem, { backgroundColor: color.bg20 }]}
            onPress={() => handleSelectResult(item)}
          >
            <MaterialIcons name="location-on" size={20} color={color.primary} />
            <Text
              style={[styles.resultText, { color: color.text }]}
              numberOfLines={1}
            >
              {item.address}
            </Text>
          </TouchableOpacity>
        )}
      />

      {infoDialog && (
        <View style={styles.overlay}>
          <View style={[styles.dialog, { backgroundColor: color.background }]}>
            <Text style={[styles.dialogTitle, { color: color.text }]}>
              {infoDialog.title}
            </Text>
            <Text style={[styles.dialogMessage, { color: color.darkText }]}>
              {infoDialog.message}
            </Text>
            <Pressable
              onPress={() => setInfoDialog(null)}
              android_ripple={{ color: color.primary20 }}
            >
              <View
                style={[styles.dialogButton, { backgroundColor: color.primary }]}
              >
                <Text style={[styles.dialogButtonText, { color: color.white }]}>
                  تم
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  currentLocationText: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
  },
  orText: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    marginVertical: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 14,
    height: 50,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    textAlign: "right",
  },
  searchButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
  },
  dialogTitle: {
    fontFamily: FontFamily.black,
    fontSize: 18,
    textAlign: "center",
  },
  dialogMessage: {
    marginTop: 8,
    fontFamily: FontFamily.medium,
    fontSize: 14,
    textAlign: "center",
  },
  dialogButton: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogButtonText: {
    fontFamily: FontFamily.bold,
  },
});
