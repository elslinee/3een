import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import { FontFamily } from "@/constants/FontFamily";
import { useFontSize } from "@/context/FontSizeContext";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AntDesign } from "@expo/vector-icons";

interface FontSizePopupProps {
  visible: boolean;
  onClose: () => void;
}

export default function FontSizePopup({
  visible,
  onClose,
}: FontSizePopupProps) {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const { fontSize, setFontSize, resetFontSize, isBold, toggleBold } =
    useFontSize();

  const handleReset = () => {
    resetFontSize();
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: color.background,
            },
          ]}
        >
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  {
                    color: color.darkText,
                    fontFamily: FontFamily.bold,
                  },
                ]}
              >
                حجم الخط
              </Text>
              <TouchableOpacity
                style={[styles.closeButton]}
                onPress={handleClose}
              >
                <Text>
                  <AntDesign name="close" size={24} color={color.text} />
                </Text>
              </TouchableOpacity>
            </View>

            {/* Size Display */}

            {/* Simple Controls */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  {
                    backgroundColor:
                      fontSize <= 16 ? color.bg20 : color.primary,
                  },
                ]}
                onPress={() => setFontSize(Math.max(16, fontSize - 1))}
                disabled={fontSize <= 16}
              >
                <FontAwesome5
                  name="minus"
                  size={14}
                  color={fontSize <= 16 ? color.text20 : color.white}
                />
              </TouchableOpacity>

              <Text
                style={[
                  styles.sizeText,
                  {
                    color: color.text,
                    fontFamily: FontFamily.medium,
                  },
                ]}
              >
                {fontSize}
              </Text>

              <TouchableOpacity
                style={[
                  styles.controlButton,
                  {
                    backgroundColor:
                      fontSize >= 32 ? color.bg20 : color.primary,
                  },
                ]}
                onPress={() => setFontSize(Math.min(32, fontSize + 1))}
                disabled={fontSize >= 32}
              >
                <FontAwesome5
                  name="plus"
                  size={14}
                  color={fontSize >= 32 ? color.text20 : color.white}
                />
              </TouchableOpacity>
            </View>

            {/* Bold Toggle */}
            <View style={styles.boldContainer}>
              <TouchableOpacity
                style={[
                  styles.boldButton,
                  {
                    backgroundColor: isBold ? color.primary : color.bg20,
                  },
                ]}
                onPress={toggleBold}
              >
                <Text
                  style={[
                    styles.boldButtonText,
                    {
                      color: isBold ? color.white : color.text,
                      fontFamily: FontFamily.medium,
                    },
                  ]}
                >
                  {isBold ? "غامق" : "عادي"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Reset Button Only */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: color.bg20 }]}
                onPress={handleReset}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: color.text,
                      fontFamily: FontFamily.medium,
                    },
                  ]}
                >
                  إعادة تعيين
                </Text>
              </TouchableOpacity>
            </View>
          </>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    maxWidth: 320,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    minHeight: 80,
    justifyContent: "center",
  },
  previewText: {
    textAlign: "center",
    writingDirection: "rtl",
  },
  sizeDisplayContainer: {
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  sizeDisplayText: {
    fontSize: 16,
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 16,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sizeText: {
    fontSize: 18,
    minWidth: 30,
    textAlign: "center",
  },
  boldContainer: {
    marginBottom: 16,
  },
  boldButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  boldButtonText: {
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
  },
});
