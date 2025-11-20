// constants/ColorSchemes.ts
export type ColorSchemeType = "warm" | "ocean" | "nature" | "purple" | "sunset";

export interface ColorPalette {
  primary: string;
  primary20: string;
  text20: string;
  bg20: string;
  darkText: string;
  focusColor: string;
}

export interface ColorScheme {
  name: string;
  nameAr: string;
  light: ColorPalette;
  dark: ColorPalette;
}

const defaultTextColorLight = "";
const defaultTextColorDark = "";

// نمط 1: الدافئ (البني الحالي)
const warmScheme: ColorScheme = {
  name: "warm",
  nameAr: "دافئ",
  light: {
    primary: "#8C5C38",
    primary20: "#E6DBD3",
    text20: "#AC9B8F",
    bg20: "#F2EBE7",
    darkText: defaultTextColorLight || "#614028",
    focusColor: "#A27B5C",
  },
  dark: {
    primary: "#A27B5C",
    primary20: "#382D23",
    text20: "#897669",
    bg20: "#2A231C",
    darkText: defaultTextColorDark || "#E5D9D0",
    focusColor: "#8C5C38",
  },
};

// نمط 2: المحيط (الأزرق)
const oceanScheme: ColorScheme = {
  name: "ocean",
  nameAr: "محيطي",
  light: {
    primary: "#2E7D96",
    primary20: "#D1E7ED",
    text20: "#7EAAB8",
    bg20: "#E8F4F8",
    darkText: defaultTextColorDark || "#1A4D5E",
    focusColor: "#4A9BB5",
  },
  dark: {
    primary: "#4A9BB5",
    primary20: "#1A3440",
    text20: "#5E8694",
    bg20: "#1C2C35",
    darkText: defaultTextColorDark || "#C8E1EA",
    focusColor: "#2E7D96",
  },
};

// نمط 3: الطبيعة (الأخضر)
const natureScheme: ColorScheme = {
  name: "nature",
  nameAr: "طبيعي",
  light: {
    primary: "#4A7C59",
    primary20: "#D4E7D9",
    text20: "#88B094",
    bg20: "#E8F3EB",
    darkText: defaultTextColorDark || "#2D5A3D",
    focusColor: "#5E9D6D",
  },
  dark: {
    primary: "#5E9D6D",
    primary20: "#1F3328",
    text20: "#668F74",
    bg20: "#1E2F25",
    darkText: defaultTextColorDark || "#C5E5CD",
    focusColor: "#4A7C59",
  },
};

// نمط 4: البنفسجي الهادئ
const purpleScheme: ColorScheme = {
  name: "purple",
  nameAr: "بنفسجي",
  light: {
    primary: "#8B7FA8",
    primary20: "#E8E4F0",
    text20: "#B8B0C8",
    bg20: "#F5F3F8",
    darkText: defaultTextColorDark || "#5A4F6B",
    focusColor: "#9D8FB5",
  },
  dark: {
    primary: "#9D8FB5",
    primary20: "#2D2738",
    text20: "#6B5F7F",
    bg20: "#25202D",
    darkText: defaultTextColorDark || "#D4CFE0",
    focusColor: "#8B7FA8",
  },
};

// نمط 5: الرمادي الهادئ
const sunsetScheme: ColorScheme = {
  name: "sunset",
  nameAr: "هادئ",
  light: {
    primary: "#7A8B9A",
    primary20: "#E1E6EA",
    text20: "#A8B5C0",
    bg20: "#F0F2F4",
    darkText: defaultTextColorDark || "#4F5A64",
    focusColor: "#8B9CAB",
  },
  dark: {
    primary: "#8B9CAB",
    primary20: "#2A2F35",
    text20: "#5F6B75",
    bg20: "#23272B",
    darkText: defaultTextColorDark || "#D1D8DE",
    focusColor: "#7A8B9A",
  },
};

export const ColorSchemes: Record<ColorSchemeType, ColorScheme> = {
  warm: warmScheme,
  ocean: oceanScheme,
  nature: natureScheme,
  purple: purpleScheme,
  sunset: sunsetScheme,
};

export const ColorSchemesList: ColorSchemeType[] = [
  "warm",
  "ocean",
  "nature",
  "purple",
  "sunset",
];
