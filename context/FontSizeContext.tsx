import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FontSizeContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  isBold: boolean;
  setIsBold: (bold: boolean) => void;
  toggleBold: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(
  undefined
);

interface FontSizeProviderProps {
  children: ReactNode;
}

const FONT_SIZE_KEY = "quran_font_size";
const FONT_BOLD_KEY = "quran_font_bold";
const MIN_FONT_SIZE = 16;
const MAX_FONT_SIZE = 32;
const DEFAULT_FONT_SIZE = 20;
const DEFAULT_BOLD = false;

export const FontSizeProvider: React.FC<FontSizeProviderProps> = ({
  children,
}) => {
  const [fontSize, setFontSizeState] = useState(DEFAULT_FONT_SIZE);
  const [isBold, setIsBoldState] = useState(DEFAULT_BOLD);

  useEffect(() => {
    const loadFontSettings = async () => {
      try {
        const storedSize = await AsyncStorage.getItem(FONT_SIZE_KEY);
        if (storedSize) {
          const size = parseInt(storedSize, 10);
          if (size >= MIN_FONT_SIZE && size <= MAX_FONT_SIZE) {
            setFontSizeState(size);
          }
        }
        const storedBold = await AsyncStorage.getItem(FONT_BOLD_KEY);
        if (storedBold !== null) {
          setIsBoldState(storedBold === "true");
        }
      } catch (error) {
        console.error("Error loading font settings:", error);
      }
    };
    loadFontSettings();
  }, []);

  const setFontSize = useCallback(async (size: number) => {
    const clampedSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size));
    setFontSizeState(clampedSize);
    try {
      await AsyncStorage.setItem(FONT_SIZE_KEY, clampedSize.toString());
    } catch (error) {
      console.error("Error saving font size:", error);
    }
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize(fontSize + 2);
  }, [fontSize, setFontSize]);

  const decreaseFontSize = useCallback(() => {
    setFontSize(fontSize - 2);
  }, [fontSize, setFontSize]);

  const resetFontSize = useCallback(() => {
    setFontSize(DEFAULT_FONT_SIZE);
    setIsBold(DEFAULT_BOLD);
  }, [setFontSize]);

  const setIsBold = useCallback(async (bold: boolean) => {
    setIsBoldState(bold);
    try {
      await AsyncStorage.setItem(FONT_BOLD_KEY, bold.toString());
    } catch (error) {
      console.error("Error saving font bold:", error);
    }
  }, []);

  const toggleBold = useCallback(() => {
    setIsBold(!isBold);
  }, [isBold, setIsBold]);

  const contextValue = useMemo(
    () => ({
      fontSize,
      setFontSize,
      increaseFontSize,
      decreaseFontSize,
      resetFontSize,
      isBold,
      setIsBold,
      toggleBold,
    }),
    [
      fontSize,
      setFontSize,
      increaseFontSize,
      decreaseFontSize,
      resetFontSize,
      isBold,
      setIsBold,
      toggleBold,
    ]
  );

  return (
    <FontSizeContext.Provider value={contextValue}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = (): FontSizeContextType => {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error("useFontSize must be used within a FontSizeProvider");
  }
  return context;
};
