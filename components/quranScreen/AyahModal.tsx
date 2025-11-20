import React, { memo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Share,
  Platform,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { captureRef } from "react-native-view-shot";
import AppLogo from "@/components/AppLogo";

interface Ayah {
  numberInSurah: number;
  text: string;
  translation?: string;
}

interface FavoriteAyah {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
}

interface AyahModalProps {
  visible: boolean;
  onClose: () => void;
  ayah: Ayah | FavoriteAyah | null;
  surahName?: string;
  surahNumber?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onRemoveFromFavorites?: () => void;
  showRemoveButton?: boolean;
  showGoToSurah?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

function AyahModal({
  visible,
  onClose,
  ayah,
  surahName,
  surahNumber,
  isFavorite = false,
  onToggleFavorite,
  onRemoveFromFavorites,
  showRemoveButton = false,
  showGoToSurah = false,
  isBookmarked = false,
  onToggleBookmark,
}: AyahModalProps) {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const ayahShareViewRef = useRef<View>(null);

  const handleShare = async () => {
    if (!ayah || !ayahShareViewRef.current) {
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
      } else {
      }
    } catch (error) {
      console.error("Error sharing ayah as image:", error);
    }
  };

  const getAyahInfo = () => {
    if (!ayah) return { surahName: "", ayahNumber: 0 };

    if ("surahName" in ayah) {
      // FavoriteAyah type
      return {
        surahName: ayah.surahName,
        ayahNumber: ayah.ayahNumber,
      };
    } else {
      // Ayah type
      return {
        surahName: surahName || "",
        ayahNumber: ayah.numberInSurah,
      };
    }
  };

  const ayahInfo = getAyahInfo();
  const goToSurah = () => {
    if (!ayah) return;

    let targetSurahNumber: number;
    if ("surahNumber" in ayah) {
      // FavoriteAyah type - has surahNumber property
      targetSurahNumber = ayah.surahNumber;
    } else {
      // Ayah type - use surahNumber prop
      if (!surahNumber) {
        console.warn("Surah number not provided for regular Ayah type");
        return;
      }
      targetSurahNumber = surahNumber;
    }

    router.push(`/quran/${targetSurahNumber}`);
  };
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",

          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
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
          {/* Ayah Text */}
          <Text
            style={{
              fontSize: 20,
              marginBottom: 16,
              color: color.text,
              fontFamily: FontFamily.quranBold,
            }}
          >
            {ayah?.text}
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
            {surahName
              ? ` ${surahName} - الآية ${ayahInfo.ayahNumber}`
              : ` ${ayahInfo.surahName} - الآية ${ayahInfo.ayahNumber}`}
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
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
                onPress={async () => {
                  await handleShare();
                  onClose();
                }}
              >
                <FontAwesome5 name="share-alt" size={13} color={color.white} />
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

              {/* Favorite/Remove Button */}
              {showRemoveButton ? (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#ff4444",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    flex: 1,
                    minWidth: "30%",
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    if (onRemoveFromFavorites) {
                      onRemoveFromFavorites();
                    }
                    onClose();
                  }}
                >
                  <FontAwesome5
                    name="heart-broken"
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
                    إزالة
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isFavorite
                      ? color.primary
                      : color.primary20,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    flex: 1,
                    minWidth: "30%",
                    marginHorizontal: 4,
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    if (onToggleFavorite) {
                      onToggleFavorite();
                    }
                  }}
                >
                  <FontAwesome6
                    name={isFavorite ? "heart-circle-check" : "heart"}
                    size={13}
                    color={isFavorite ? color.white : color.text}
                  />
                  <Text
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",

                      color: isFavorite ? color.white : color.text,
                      fontFamily: FontFamily.medium,
                      marginLeft: 8,
                      fontSize: 11,
                    }}
                  >
                    {isFavorite ? "مفضلة" : "إضافة للمفضلة"}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Bookmark Button */}
              {onToggleBookmark && (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isBookmarked
                      ? color.primary
                      : color.primary20,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    flex: 1,
                    minWidth: "30%",
                    marginHorizontal: 4,
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    if (onToggleBookmark) {
                      onToggleBookmark();
                    }
                  }}
                >
                  <FontAwesome
                    name={isBookmarked ? "bookmark" : "bookmark-o"}
                    size={13}
                    color={isBookmarked ? color.white : color.text}
                  />
                  <Text
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: isBookmarked ? color.white : color.text,
                      fontFamily: FontFamily.medium,
                      marginLeft: 8,
                      fontSize: 11,
                    }}
                  >
                    {isBookmarked ? "إشارة مرجعية" : "إضافة إشارة"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {showGoToSurah && (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: color.primary20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  width: "100%",
                  marginHorizontal: 4,
                  justifyContent: "center",
                }}
                onPress={() => {
                  goToSurah();
                }}
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
                <FontAwesome5 name="arrow-right" size={14} color={color.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>

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
          // borderRadius: 16,
          paddingVertical: 24,
          paddingHorizontal: 20,
          minWidth: 300,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {ayah ? (
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
              {ayah.text}
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
              {surahName
                ? ` ${surahName} - الآية ${ayahInfo.ayahNumber}`
                : ` ${ayahInfo.surahName} - الآية ${ayahInfo.ayahNumber}`}
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
    </Modal>
  );
}

export default memo(AyahModal);
