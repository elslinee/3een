import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Share,
  Pressable,
} from "react-native";

import PagerView from "react-native-pager-view";
import { FontFamily } from "@/constants/FontFamily";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useAudioPlayer } from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { captureRef } from "react-native-view-shot";
import AppLogo from "@/components/AppLogo";
import OneTimeTip from "@/components/OneTimeTip";

const SOUND_ENABLED_KEY = "azkar_sound_enabled";

type Zikr = {
  category: string;
  count: string;
  description: string;
  reference: string;
  content: string;
};

interface Props {
  azkar: Zikr[];
  color: any;
}

interface TooltipProps {
  visible: boolean;
  text: string;
  onClose: () => void;
  color: any;
}

const Tooltip: React.FC<TooltipProps> = ({ visible, text, onClose, color }) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.tooltipOverlay} onPress={onClose}>
        <View
          style={[
            styles.tooltipContainer,
            { backgroundColor: color.background },
          ]}
        >
          <Text style={[styles.tooltipText, { color: color.text }]}>
            {text}
          </Text>
        </View>
      </Pressable>
    </Modal>
  );
};

// Pager-based swiper
export default function AzkarSwiper({ azkar, color }: Props) {
  const [index, setIndex] = useState(0);
  const target = useMemo(() => {
    const raw = azkar && azkar[index] ? azkar[index].count : "1";
    const digits =
      typeof raw === "string" ? raw.replace(/[^0-9]/g, "") : String(raw ?? "1");
    const parsed = parseInt(digits || "1", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [index, azkar]);
  const [count, setCount] = useState(0);
  const pagerRef = useRef<PagerView | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const current = azkar && azkar.length > 0 ? azkar[index] : undefined;

  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  const [isLoadingSound, setIsLoadingSound] = useState(true);
  const zikrShareViewRef = useRef<View>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; text: string }>({
    visible: false,
    text: "",
  });

  // Audio player for tap sound
  const tapSoundPlayer = useAudioPlayer(require("@/assets/audios/click.mp3"));

  // Load saved sound preference on mount
  useEffect(() => {
    const loadSoundPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
        if (saved !== null) {
          const enabled = saved === "true";
          setSoundEnabled(enabled);
          soundEnabledRef.current = enabled;
        }
      } catch (error) {
        // Use default value if loading fails
      } finally {
        setIsLoadingSound(false);
      }
    };
    loadSoundPreference();
  }, []);

  // Toggle sound on/off - instant update
  const toggleSound = useCallback(() => {
    // Update ref first for instant response
    soundEnabledRef.current = !soundEnabledRef.current;
    const newValue = soundEnabledRef.current;

    // Update state for UI (non-blocking)
    setSoundEnabled(newValue);

    // Save to AsyncStorage (non-blocking)
    AsyncStorage.setItem(SOUND_ENABLED_KEY, String(newValue)).catch(() => {
      // Silently fail if save fails
    });

    // Test sound immediately if turning on
    if (newValue && tapSoundPlayer) {
      try {
        tapSoundPlayer.seekTo(0);
        tapSoundPlayer.play();
      } catch (error) {
        // Silently fail
      }
    }
  }, [tapSoundPlayer]);

  // Play tap sound function - optimized for fast clicks
  // Uses ref to get the latest value instantly
  const playTapSound = useCallback(() => {
    if (!tapSoundPlayer || !soundEnabledRef.current) return;

    try {
      // Reset to beginning immediately for instant response
      tapSoundPlayer.seekTo(0);
      // Play immediately without blocking
      tapSoundPlayer.play();
    } catch (error) {
      // Silently fail if audio is not available
    }
  }, [tapSoundPlayer]);

  const handleCopy = useCallback(async () => {
    try {
      if (!current) return;
      let text = current.content;
      if (current.description) {
        text += `\n\n${current.description}`;
      }
      if (current.reference) {
        text += `\n\n${current.reference}`;
      }
      await Clipboard.setStringAsync(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ في النسخ");
    }
  }, [current]);

  const showTooltip = useCallback((text: string) => {
    setTooltip({ visible: true, text });
    setTimeout(() => setTooltip({ visible: false, text: "" }), 2000);
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip({ visible: false, text: "" });
  }, []);

  const handleShare = useCallback(async () => {
    if (!current || !zikrShareViewRef.current) return;

    try {
      // Wait a bit to ensure the view is fully rendered for maximum quality
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Capture the zikr view as base64 data URI at maximum quality
      const dataUri = await captureRef(zikrShareViewRef.current, {
        format: "png",
        quality: 1, // Maximum quality (1.0)
        result: "data-uri",
      });

      // Extract base64 data
      const base64Data = dataUri.split(",")[1];

      // Create a file path in cache directory
      const fileName = `zikr_${Date.now()}.png`;
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
          dialogTitle: "مشاركة ذكر",
          UTI: "public.png", // iOS only
        });
      } else {
        // Fallback: share text
        let text = current.content;
        if (current.description) {
          text += `\n\n${current.description}`;
        }
        if (current.reference) {
          text += `\n\n${current.reference}`;
        }
        await Share.share({ message: text });
      }
    } catch (error) {
      console.error("Error sharing zikr:", error);
      // Fallback: share text
      try {
        let text = current.content;
        if (current.description) {
          text += `\n\n${current.description}`;
        }
        if (current.reference) {
          text += `\n\n${current.reference}`;
        }
        await Share.share({ message: text });
      } catch (e) {
        Alert.alert("خطأ", "حدث خطأ في المشاركة");
      }
    }
  }, [current]);

  // Reset to first item when data changes, and ensure valid index
  useEffect(() => {
    if (!azkar || azkar.length === 0) {
      setIndex(0);
      setCount(0);
      return;
    }
    if (index >= azkar.length) {
      setIndex(0);
      setCount(0);
      pagerRef.current?.setPage(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [azkar?.length]);

  const onTick = useCallback(() => {
    // Play sound immediately (non-blocking, fire and forget)
    playTapSound();

    // Update count immediately using functional update for instant response
    setCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount >= target) {
        // Schedule page change after UI update
        requestAnimationFrame(() => {
          const next = index + 1;
          if (next < azkar.length) {
            pagerRef.current?.setPage(next);
          } else {
            setShowCompleted(true);
          }
        });
        return target;
      }
      return newCount;
    });
  }, [target, index, azkar.length, playTapSound]);

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style={[styles.topBar]}>
        <Text style={[styles.progress, { color: color.text20 }]}>
          {azkar?.length ? `${index + 1} / ${azkar.length}` : "0 / 0"}
        </Text>
      </View>

      <View style={{ flex: 1, direction: "ltr" }}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1, paddingHorizontal: 12, direction: "ltr" }}
          scrollEnabled={false}
          initialPage={0}
          onPageSelected={(e: any) => {
            const newIndex = e.nativeEvent.position;
            setIndex(newIndex);
            setCount(0);
          }}
        >
          {azkar && azkar.length > 0 ? (
            azkar.map((z, i) => (
              <AzkarCardMemo
                key={`azkar-${i}`}
                zikr={z}
                index={i}
                color={color}
                copied={copied && i === index}
                soundEnabled={soundEnabled}
                onCopy={handleCopy}
                onShare={handleShare}
                onToggleSound={toggleSound}
                onShowTooltip={showTooltip}
              />
            ))
          ) : (
            <View
              key={"empty"}
              style={[
                styles.card,
                {
                  backgroundColor: color.white,
                  shadowColor: color.primary,
                },
              ]}
            >
              <Text style={[styles.description, { color: color.text20 }]}>
                لا توجد أذكار متاحة
              </Text>
            </View>
          )}
        </PagerView>
      </View>

      <View style={styles.counterRow}>
        <TouchableOpacity
          disabled={!current}
          onPress={onTick}
          activeOpacity={1}
          style={[
            styles.tickBtn,
            {
              backgroundColor: color.primary,
            },
          ]}
        >
          <Text style={[styles.counterText, { color: color.primary20 }]}>
            {current ? `${count} / ${target}` : "0 / 0"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Copied Toast */}

      {/* Completion Modal */}
      <Modal
        transparent
        visible={showCompleted}
        animationType="fade"
        onRequestClose={() => setShowCompleted(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: color.background }]}
          >
            <Text style={[styles.modalTitle, { color: color.darkText }]}>
              أحسنت!
            </Text>
            <Text style={[styles.modalText, { color: color.text20 }]}>
              لقد أكملت جميع الاذكار.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  playTapSound();
                  setShowCompleted(false);
                }}
                style={[
                  styles.modalBtn,
                  { borderColor: color.border, backgroundColor: color.bg20 },
                ]}
              >
                <Text
                  style={[
                    styles.modalBtnTextOutline,
                    { color: color.darkText },
                  ]}
                >
                  إغلاق
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  playTapSound();
                  setIndex(0);
                  setCount(0);
                  pagerRef.current?.setPage(0);
                  setShowCompleted(false);
                }}
                style={[styles.modalBtn, { backgroundColor: color.primary }]}
              >
                <Text style={[styles.modalBtnText, { color: color.white }]}>
                  إعادة البدء
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Copied Toast */}

      {/* OneTimeTip for action buttons */}
      <OneTimeTip
        tipKey="azkar_action_buttons_tip_shown"
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
                styles.actionBtn,
                {
                  backgroundColor: `${color.text20}22`,
                },
              ]}
            >
              <FontAwesome5 name="volume-up" size={16} color={color.primary} />
            </View>
            <View
              style={[
                styles.actionBtn,
                {
                  backgroundColor: `${color.text20}22`,
                },
              ]}
            >
              <FontAwesome5 name="copy" size={16} color={color.darkText} />
            </View>
            <View
              style={[
                styles.actionBtn,
                {
                  backgroundColor: `${color.text20}22`,
                },
              ]}
            >
              <FontAwesome5 name="share-alt" size={16} color={color.darkText} />
            </View>
          </View>
        </View>
      </OneTimeTip>

      {/* Tooltip for long press */}
      <Tooltip
        visible={tooltip.visible}
        text={tooltip.text}
        onClose={hideTooltip}
        color={color}
      />

      {/* Hidden View for screenshot with logo - only visible when capturing */}
      {current && (
        <View
          ref={zikrShareViewRef}
          collapsable={false}
          style={{
            position: "absolute",
            left: -9999,
            top: -9999,
            opacity: 0,
            pointerEvents: "none",
            backgroundColor: color.bg20,
            // borderRadius: 20,
            paddingVertical: 24,
            paddingHorizontal: 24,
            minWidth: 300,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={[
              styles.content,
              {
                color: color.text,
                textAlign: "center",
                marginBottom: current.reference ? 16 : 0,
              },
            ]}
          >
            {current.content}
          </Text>
          {current.reference ? (
            <Text style={[styles.reference, { color: color.text20 }]}>
              {current.reference}
            </Text>
          ) : null}
          {current.description ? (
            <Text style={[styles.description, { color: color.text20 }]}>
              {current.description}
            </Text>
          ) : null}
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
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  topBar: {
    alignItems: "center",
    marginBottom: 20,
  },
  progress: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    opacity: 1,
    letterSpacing: 0.5,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,

    minHeight: 280,
  },
  content: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 32,

    textAlign: "center",

    letterSpacing: 0.5,
  },
  reference: {
    marginTop: 16,
    textAlign: "center",
    fontFamily: FontFamily.medium,
    fontSize: 11,
    opacity: 1,
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  description: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: FontFamily.regular,
    fontSize: 11,
    opacity: 1,
    letterSpacing: 0.3,
    lineHeight: 14,
  },
  counterRow: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    paddingHorizontal: 20,
  },
  counterBox: {
    borderWidth: 0,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginRight: 0,
    marginBottom: 12,
    minWidth: 80,
    alignItems: "center",
  },
  counterText: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  tickBtn: {
    borderRadius: 99,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  tickText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  modalText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
  },
  modalBtnTextOutline: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
  },
  tooltipOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  tooltipContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    textAlign: "center",
  },
  actionBtns: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  actionBtn: {
    borderRadius: 8,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

// Memoized card component for better performance
const AzkarCardMemo = memo(
  ({
    zikr,
    index,
    color,
    copied,
    soundEnabled,
    onCopy,
    onShare,
    onToggleSound,
    onShowTooltip,
  }: {
    zikr: Zikr;
    index: number;
    color: any;
    copied: boolean;
    soundEnabled: boolean;
    onCopy: () => void;
    onShare: () => void;
    onToggleSound: () => void;
    onShowTooltip: (text: string) => void;
  }) => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: color.bg20,
          },
        ]}
      >
        <View style={styles.actionBtns}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={onToggleSound}
            onLongPress={() => onShowTooltip("تفعيل/إلغاء صوت النقر")}
            style={[
              styles.actionBtn,
              {
                backgroundColor: `${color.text20}22`,
              },
            ]}
          >
            <FontAwesome5
              name={soundEnabled ? "volume-up" : "volume-mute"}
              size={16}
              color={soundEnabled ? color.primary : color.darkText}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={onCopy}
            onLongPress={() => onShowTooltip("نسخ الذكر")}
            style={[
              styles.actionBtn,
              {
                backgroundColor: `${color.text20}22`,
              },
            ]}
          >
            <FontAwesome5
              name={copied ? "check" : "copy"}
              size={16}
              color={copied ? color.primary : color.darkText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={1}
            onPress={onShare}
            onLongPress={() => onShowTooltip("مشاركة الذكر")}
            style={[
              styles.actionBtn,
              {
                backgroundColor: `${color.text20}22`,
              },
            ]}
          >
            <FontAwesome5 name="share-alt" size={16} color={color.darkText} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: 28,
            flexGrow: 1,
            justifyContent: "center",
          }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
        >
          <Text
            ellipsizeMode="tail"
            style={[styles.content, { color: color.text }]}
          >
            {zikr.content}
          </Text>
          {zikr.reference ? (
            <Text style={[styles.reference, { color: color.text20 }]}>
              {zikr.reference}
            </Text>
          ) : null}
          {zikr.description ? (
            <Text style={[styles.description, { color: color.text20 }]}>
              {zikr.description}
            </Text>
          ) : null}
        </ScrollView>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if relevant props change
    return (
      prevProps.index === nextProps.index &&
      prevProps.copied === nextProps.copied &&
      prevProps.soundEnabled === nextProps.soundEnabled &&
      prevProps.zikr.content === nextProps.zikr.content &&
      prevProps.zikr.reference === nextProps.zikr.reference &&
      prevProps.zikr.description === nextProps.zikr.description &&
      prevProps.onShowTooltip === nextProps.onShowTooltip
    );
  }
);
