import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  Pressable,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { FontFamily } from "@/constants/FontFamily";

interface SurahActionButtonsProps {
  bookmark: number | null;
  isInlineMode: boolean;
  onGoToBookmark: () => void;
  onToggleViewMode: () => void;
  onShowFontSizePopup: () => void;
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

export const SurahActionButtons: React.FC<SurahActionButtonsProps> = ({
  bookmark,
  isInlineMode,
  onGoToBookmark,
  onToggleViewMode,
  onShowFontSizePopup,
  color,
}) => {
  const btnsBackgroundColors = color.bg20;
  const btnsIconsColors = color.darkText;
  const [tooltip, setTooltip] = useState<{ visible: boolean; text: string }>({
    visible: false,
    text: "",
  });

  const showTooltip = (text: string) => {
    setTooltip({ visible: true, text });
    setTimeout(() => setTooltip({ visible: false, text: "" }), 2000);
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, text: "" });
  };

  return (
    <>
      <View style={styles.container}>
        {bookmark && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                opacity: isInlineMode ? 0.5 : 1,
                backgroundColor: btnsBackgroundColors,
              },
            ]}
            disabled={isInlineMode}
            onPress={onGoToBookmark}
            onLongPress={() => showTooltip("الانتقال إلى الاية المحفوظة")}
          >
            <FontAwesome5 name="bookmark" size={16} color={btnsIconsColors} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: btnsBackgroundColors },
          ]}
          onPress={onToggleViewMode}
          onLongPress={() =>
            showTooltip(
              isInlineMode
                ? "التبديل  لوضع الايات القائمة"
                : "التبديل  لوضع الايات المتجاورة"
            )
          }
        >
          <FontAwesome5
            name={isInlineMode ? "list-ul" : "align-right"}
            size={16}
            color={btnsIconsColors}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: btnsBackgroundColors },
          ]}
          onPress={onShowFontSizePopup}
          onLongPress={() => showTooltip("تغيير حجم الخط")}
        >
          <FontAwesome5 name="text-height" size={16} color={btnsIconsColors} />
        </TouchableOpacity>
      </View>

      <Tooltip
        visible={tooltip.visible}
        text={tooltip.text}
        onClose={hideTooltip}
        color={color}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
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
});
