import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getColors } from "@/constants/Colors";
import LoadingScreen from "@/components/LoadingScreen";
import { TasbeehIcon } from "@/constants/Icons";
import { useFocusEffect } from "expo-router";
import { useTasbeehStorage } from "@/hooks/useTasbeehStorage";
import { useTasbeehStats } from "@/hooks/useTasbeehStats";
import { getTodayDate, parseGoal } from "@/components/tasbeehScreen/utils";
import {
  TasbeehStatsCard,
  AddTasbeehModal,
  DeleteConfirmModal,
  EmptyState,
  TasbeehList,
  AddButton,
  type TasbeehItem,
} from "@/components/tasbeehScreen";

export default function Tasbeeh() {
  const { theme, colorScheme } = useTheme();
  const color = getColors(theme, colorScheme)[theme];
  const themeColors = getColors(theme, colorScheme)[theme];
  const {
    items,
    setItems,
    isLoading,
    hasHydrated,
    resetDailyCounts,
    reloadItems,
  } = useTasbeehStorage();
  const { stats } = useTasbeehStats(items);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newGoal, setNewGoal] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Refresh items when screen is focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const refresh = async () => {
        try {
          // Reload items from storage to get latest updates
          await reloadItems();
          // Then reset daily counts if needed
          await resetDailyCounts();
        } catch {
          // ignore
        }
      };
      if (hasHydrated) {
        refresh();
      }
      return () => {
        isActive = false;
      };
    }, [resetDailyCounts, reloadItems, hasHydrated])
  );

  // Auto-reset all tasbeeh at midnight
  useEffect(() => {
    if (!hasHydrated) return;

    const checkAndResetDaily = async () => {
      try {
        const today = getTodayDate();
        setItems((currentItems) => {
          const needsReset = currentItems.some(
            (item) => item.lastUsedDate && item.lastUsedDate !== today
          );

          if (needsReset) {
            return currentItems.map((item) => ({
              ...item,
              count: 0,
              lastUsedDate: today,
            }));
          }
          return currentItems;
        });
      } catch (error) {
        console.error("Error in daily reset:", error);
      }
    };

    checkAndResetDaily();
    const interval = setInterval(checkAndResetDaily, 60000);
    return () => clearInterval(interval);
  }, [hasHydrated, setItems]);

  const addTasbeeh = useCallback(() => {
    const trimmedName = newName.trim();
    const parsedGoal = parseGoal(newGoal);
    const newItem: TasbeehItem = {
      id: `${Date.now()}`,
      name: trimmedName,
      count: 0,
      dailyGoal: parsedGoal,
      totalCount: 0,
      lastUsedDate: "",
      history: [],
    };
    setItems((prev) => [newItem, ...prev]);
    setShowAddModal(false);
    setNewName("");
    setNewGoal("");
  }, [newName, newGoal, setItems]);

  const requestDelete = useCallback((id: string) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (pendingDeleteId) {
      setItems((prev) => prev.filter((it) => it.id !== pendingDeleteId));
    }
    setPendingDeleteId(null);
    setShowDeleteModal(false);
  }, [pendingDeleteId, setItems]);

  const cancelDelete = useCallback(() => {
    setPendingDeleteId(null);
    setShowDeleteModal(false);
  }, []);

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: themeColors.background,
        }}
      >
        {isLoading ? (
          <LoadingScreen
            message="جاري التحميل..."
            customIcon={
              <TasbeehIcon width={88} height={88} color={color.primary} />
            }
          />
        ) : (
          <>
            {/* Statistics Section */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 20,
                paddingBottom: 16,
              }}
            >
              <TasbeehStatsCard stats={stats} color={themeColors} />
              <AddButton
                onPress={() => setShowAddModal(true)}
                color={themeColors}
              />
            </View>

            {/* Content */}
            {items.length === 0 ? (
              <EmptyState color={themeColors} />
            ) : (
              <TasbeehList
                items={items}
                onDelete={requestDelete}
                color={themeColors}
              />
            )}
          </>
        )}
      </View>

      <AddTasbeehModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewName("");
          setNewGoal("");
        }}
        onAdd={addTasbeeh}
        newName={newName}
        newGoal={newGoal}
        setNewName={setNewName}
        setNewGoal={setNewGoal}
        color={themeColors}
      />

      <DeleteConfirmModal
        visible={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        color={themeColors}
      />
    </>
  );
}
