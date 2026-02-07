import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Linking,
} from "react-native";
import { APP_VERSION } from "@/constants/General";

interface NewUpdateModalProps {
  latestVersion: string;
  changes: string[];
  storeUrl: string;
  color: any;
}

export default function NewUpdateModal({
  latestVersion,
  changes,
  storeUrl,
  color,
}: NewUpdateModalProps) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Show modal if the current app version is strictly different from the latest version
    if (APP_VERSION !== latestVersion) {
      setShowModal(true);
    }
  }, [latestVersion]);

  const handleClose = () => {
    setShowModal(false);
  };

  const handleUpdate = async () => {
    try {
      await Linking.openURL(storeUrl);
    } catch (e) {
      console.error("Failed to open store URL", e);
    }
  };

  return (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable
          style={[styles.modalContainer, { backgroundColor: color.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: color.text }]}>
            تحديث جديد متاح!
          </Text>
          <Text style={[styles.version, { color: color.primary }]}>
            الإصدار {latestVersion}
          </Text>

          <View style={styles.changesContainer}>
            <Text style={[styles.changesTitle, { color: color.text }]}>
              ما الجديد:
            </Text>
            {changes.map((change, index) => (
              <View key={index} style={styles.changeItem}>
                <Text style={[styles.bullet, { color: color.primary }]}>•</Text>
                <Text style={[styles.changeText, { color: color.darkText }]}>
                  {change}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: color.primary }]}
              onPress={handleUpdate}
            >
              <Text
                style={[styles.primaryButtonText, { color: color.background }]}
              >
                تحديث الآن
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: color.bg20 }]}
              onPress={handleClose}
            >
              <Text style={[styles.secondaryButtonText, { color: color.text }]}>
                لاحقاً
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontFamily: "Cairo-Black",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 8,
  },
  version: {
    fontFamily: "Cairo-Bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  changesContainer: {
    marginBottom: 20,
  },
  changesTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 14,
    marginBottom: 8,
  },
  changeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  changeText: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  buttonContainer: {
    gap: 10,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    textAlign: "center",
    fontFamily: "Cairo-Bold",
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    textAlign: "center",
    fontFamily: "Cairo-Bold",
    fontSize: 16,
  },
});
