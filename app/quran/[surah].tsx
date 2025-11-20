import React, { useState, useRef } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import { FontSizeProvider, useFontSize } from "@/context/FontSizeContext";
import FontSizePopup from "@/components/FontSizePopup";
import OneTimeTip from "@/components/OneTimeTip";
import GoBack from "@/components/GoBack";
import AyahModal from "@/components/quranScreen/AyahModal";
import { SurahHeader } from "@/components/quranScreen/SurahHeader";
import { SurahActionButtons } from "@/components/quranScreen/SurahActionButtons";
import { SurahLoading } from "@/components/quranScreen/SurahLoading";
import { SurahError } from "@/components/quranScreen/SurahError";
import { Bismillah } from "@/components/quranScreen/Bismillah";
import {
  SurahContent,
  SurahContentHandle,
} from "@/components/quranScreen/SurahContent";
import { useSurahData } from "@/hooks/useSurahData";
import { useFavorites } from "@/hooks/useFavorites";
import { useBookmark } from "@/hooks/useBookmark";
import { useViewMode } from "@/hooks/useViewMode";
import { Ayah } from "@/components/quranScreen/types";
import { FontFamily } from "@/constants/FontFamily";
import { FontAwesome5 } from "@expo/vector-icons";

export function SurahScreenContent() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const { fontSize } = useFontSize();
  const [showFontSizePopup, setShowFontSizePopup] = useState(false);
  const { surah } = useLocalSearchParams();
  const surahNumber = surah;

  const { surahData, loading, error, refetch } = useSurahData(surahNumber);
  const { favorites, toggleFavorite } = useFavorites(surahNumber);
  const { bookmark, toggleBookmark } = useBookmark(surahNumber);
  const { isInlineMode, isSwitchingView, toggleViewMode } = useViewMode();

  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [showAyahModal, setShowAyahModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const contentRef = useRef<SurahContentHandle>(null);

  const styles = createStyles(color, fontSize);

  const handleAyahPress = (ayah: Ayah) => {
    setSelectedAyah(ayah);
    setShowAyahModal(true);
  };

  const goToBookmark = () => {
    if (bookmark && contentRef.current) {
      contentRef.current.scrollToBookmark(scrollViewRef);
    }
  };

  const handleMainScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 240;

    if (isInlineMode) {
      if (isCloseToBottom && contentRef.current) {
        contentRef.current.inlineRef.current?.loadMore?.();
      }
      return;
    }

    if (isCloseToBottom && contentRef.current) {
      contentRef.current.loadMoreList();
    }
  };

  if (loading) {
    return <SurahLoading color={color} />;
  }

  if (error || !surahData) {
    return <SurahError error={error} onRetry={refetch} color={color} />;
  }
  const btnsBackgroundColors = color.bg20;
  const btnsIconsColors = color.darkText;
  return (
    <View style={styles.container}>
      <FontSizePopup
        visible={showFontSizePopup}
        onClose={() => setShowFontSizePopup(false)}
      />
      <GoBack style={styles.goBackButton} />
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <SurahHeader surahData={surahData} color={color} />
          <SurahActionButtons
            bookmark={bookmark}
            isInlineMode={isInlineMode}
            onGoToBookmark={goToBookmark}
            onToggleViewMode={toggleViewMode}
            onShowFontSizePopup={() => setShowFontSizePopup(true)}
            color={color}
          />
        </View>
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          isInlineMode ? styles.scrollViewContent : styles.scrollViewListContent
        }
        scrollEventThrottle={16}
        onScroll={handleMainScroll}
        onMomentumScrollEnd={handleMainScroll}
      >
        <Bismillah surahNumber={surahData.number} color={color} />
        <View
          style={
            isInlineMode && !isSwitchingView
              ? styles.contentContainer
              : styles.contentContainerTransparent
          }
        >
          <SurahContent
            ref={contentRef}
            surahData={surahData}
            isInlineMode={isInlineMode}
            isSwitchingView={isSwitchingView}
            bookmark={bookmark}
            onAyahPress={handleAyahPress}
            onToggleBookmark={toggleBookmark}
            color={color}
          />
        </View>
      </ScrollView>
      <AyahModal
        visible={showAyahModal}
        onClose={() => setShowAyahModal(false)}
        ayah={selectedAyah}
        surahName={surahData?.name}
        surahNumber={surahData?.number}
        isFavorite={
          selectedAyah ? favorites.includes(selectedAyah.numberInSurah) : false
        }
        onToggleFavorite={() => {
          if (selectedAyah) {
            toggleFavorite(selectedAyah.numberInSurah, surahData);
          }
        }}
        isBookmarked={
          selectedAyah ? bookmark === selectedAyah.numberInSurah : false
        }
        onToggleBookmark={() => {
          if (selectedAyah) {
            toggleBookmark(selectedAyah.numberInSurah);
          }
        }}
      />
      <OneTimeTip
        tipKey="surah_actidon_buttons_tip_shown"
        title="أزرار التحكم"
        color={color}
      >
        <View>
          <Text
            style={{
              fontFamily: FontFamily.regular,
              textAlign: "center",
              fontSize: 16,
              color: color.darkText,
            }}
          >
            اضغط مطولاً على الايقونة لمعرفة ماذا تفعل
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              justifyContent: "center",
              alignItems: "center",
              marginVertical: 16,
            }}
          >
            <View
              style={[
                styles.actionButton,
                { backgroundColor: btnsBackgroundColors },
              ]}
            >
              <FontAwesome5 name="bookmark" size={16} color={btnsIconsColors} />
            </View>
            <View
              style={[
                styles.actionButton,
                { backgroundColor: btnsBackgroundColors },
              ]}
            >
              <FontAwesome5 name="list-ul" size={16} color={btnsIconsColors} />
            </View>
            <View
              style={[
                styles.actionButton,
                { backgroundColor: btnsBackgroundColors },
              ]}
            >
              <FontAwesome5
                name="text-height"
                size={16}
                color={btnsIconsColors}
              />
            </View>
          </View>
        </View>
      </OneTimeTip>
    </View>
  );
}

const createStyles = (color: any, fontSize: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.background,
      paddingTop: 16,
    },
    goBackButton: {
      position: "absolute",
      top: 65,
      left: 20,
      zIndex: 1000,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 0,
      backgroundColor: color.background,
    },
    headerContent: {
      flex: 1,
      gap: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollView: {
      flex: 1,
    },
    scrollViewListContent: {
      paddingHorizontal: 8,
      paddingBottom: 40,
    },
    scrollViewContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    contentContainer: {
      backgroundColor: color.bg20,
      flexDirection: "column",
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: 16,
      overflow: "hidden",
    },
    contentContainerTransparent: {
      backgroundColor: "transparent",
      flexDirection: "column",
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: 16,
      overflow: "hidden",
    },
    actionButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
    },
  });

export default function SurahScreen() {
  return (
    <FontSizeProvider>
      <SurahScreenContent />
    </FontSizeProvider>
  );
}
