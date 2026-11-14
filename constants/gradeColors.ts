import type { GradeCategory } from "@/services/hadith/grades";

// Semantic colors, independent of the user's color scheme so a grade always reads
// the same. Every pair keeps >= 4.5:1 text contrast; the grade is also written out.
export const GRADE_COLORS: Record<
  "light" | "dark",
  Record<GradeCategory, { text: string; background: string }>
> = {
  light: {
    sahih: { text: "#276E44", background: "#E3F2E8" },
    hasan: { text: "#2F6BA8", background: "#E2ECF7" },
    daif: { text: "#97500F", background: "#F8EADB" },
    mawdu: { text: "#B23A3A", background: "#F8E1E1" },
    other: { text: "#5F5F5F", background: "#EDEDED" },
  },
  dark: {
    sahih: { text: "#7BC89A", background: "#1E3326" },
    hasan: { text: "#86B4E3", background: "#1D2A3A" },
    daif: { text: "#E8A866", background: "#3A2A1A" },
    mawdu: { text: "#EB8D8D", background: "#3A1F1F" },
    other: { text: "#B0B0B0", background: "#2A2A2A" },
  },
};
