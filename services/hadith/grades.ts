export type GradeCategory = "sahih" | "hasan" | "daif" | "mawdu" | "other";

export interface HadithGrade {
  grader: string;
  grade: string;
}

export const GRADE_CATEGORY_LABELS: Record<GradeCategory, string> = {
  sahih: "صحيح",
  hasan: "حسن",
  daif: "ضعيف",
  mawdu: "موضوع",
  other: "أخرى",
};

const GRADER_NAMES: Record<string, string> = {
  "Al-Albani": "الألباني",
  "Zubair Ali Zai": "زبير علي زئي",
  "Shuaib Al Arnaut": "شعيب الأرناؤوط",
  "Abu Ghuddah": "عبد الفتاح أبو غدة",
  "Muhammad Muhyi Al-Din Abdul Hamid": "محمد محيي الدين عبد الحميد",
  "Muhammad Fouad Abd al-Baqi": "محمد فؤاد عبد الباقي",
  "Ahmad Muhammad Shakir": "أحمد محمد شاكر",
  "Bashar Awad Maarouf": "بشار عواد معروف",
  "Salim al-Hilali": "سليم الهلالي",
};

// Full translations for the most frequent grade strings in the source data.
const GRADE_TRANSLATIONS: Record<string, string> = {
  Sahih: "صحيح",
  Daif: "ضعيف",
  Hasan: "حسن",
  "Hasan Sahih": "حسن صحيح",
  "Sahih - Agreed Upon": "صحيح متفق عليه",
  "Isnaad Hasan": "إسناده حسن",
  "Isnaad Sahih": "إسناده صحيح",
  "Sahih Muslim": "صحيح مسلم",
  "Sahih Lighairihi": "صحيح لغيره",
  "Sahih Isnaad": "صحيح الإسناد",
  "Daif Isnaad": "ضعيف الإسناد",
  "Sahih Bukhari": "صحيح البخاري",
  "Mauquf Sahih": "موقوف صحيح",
  "Very Daif": "ضعيف جدًا",
  "Sahih - Bukhari And Muslim": "صحيح (البخاري ومسلم)",
  "Maqtu Sahih": "مقطوع صحيح",
  Shadh: "شاذ",
  Munkar: "منكر",
  "Mauquf Daif": "موقوف ضعيف",
  "Hasan Lighairihi": "حسن لغيره",
  "Hasan Isnaad": "حسن الإسناد",
  Mawdu: "موضوع",
  "Sahih Muquf": "صحيح موقوف",
  "Sahih Maqtu": "صحيح مقطوع",
  "Sahih Hadith": "حديث صحيح",
  "Sahih Isnaad Maqtu": "صحيح الإسناد مقطوع",
  "Maqtu Daif": "مقطوع ضعيف",
  "Sahih Isnaad Mauquf": "صحيح الإسناد موقوف",
  "Hasan Sahih Isnaad": "حسن صحيح الإسناد",
  Maqtu: "مقطوع",
  "Daif Isnaad Maqtu": "ضعيف الإسناد مقطوع",
  "Sahih Mutawatir": "صحيح متواتر",
  "Sanad Daif": "سنده ضعيف",
  "Very Daif Isnaad": "إسناده ضعيف جدًا",
  "Mauquf Hasan": "موقوف حسن",
  "Daif Maqtu": "ضعيف مقطوع",
  "Daif Muquf": "ضعيف موقوف",
  "Hasan Maqtu": "حسن مقطوع",
  "Daif Munkar": "ضعيف منكر",
  "Sahih Matn": "صحيح المتن",
  "Mauquf Sahih Lighairihi": "موقوف صحيح لغيره",
  "Sahih Isnaad Mursal": "صحيح الإسناد مرسل",
  "Munkar Daif": "منكر ضعيف",
  "Isnaad Sahih Agreed Upon": "إسناده صحيح متفق عليه",
  Mursal: "مرسل",
  Mauquf: "موقوف",
  Batil: "باطل",
};

// Word-by-word fallback for the long tail of composite grade strings.
const GRADE_WORDS: Record<string, string> = {
  sahih: "صحيح",
  hasan: "حسن",
  daif: "ضعيف",
  "da'if": "ضعيف",
  very: "جدًا",
  isnaad: "الإسناد",
  isnad: "الإسناد",
  sanad: "السند",
  matn: "المتن",
  lighairihi: "لغيره",
  li: "",
  ghairihi: "لغيره",
  mauquf: "موقوف",
  muquf: "موقوف",
  mawquf: "موقوف",
  maqtu: "مقطوع",
  mursal: "مرسل",
  munkar: "منكر",
  shadh: "شاذ",
  mawdu: "موضوع",
  batil: "باطل",
  malool: "معلول",
  mutawatir: "متواتر",
  hadith: "حديث",
  bukhari: "البخاري",
  muslim: "مسلم",
  agreed: "متفق",
  upon: "عليه",
  and: "و",
  or: "أو",
  after: "بعد",
  mukhtasar: "مختصر",
};

/** Grader names exactly as they appear in the source data. */
export const GRADER_KEYS = Object.keys(GRADER_NAMES);

export const translateGrader = (name: string): string =>
  GRADER_NAMES[name.trim()] ?? name;

// Untranslatable strings are shown as-is rather than guessed.
export const translateGrade = (grade: string): string => {
  const trimmed = grade.trim();
  const exact = GRADE_TRANSLATIONS[trimmed];
  if (exact) return exact;

  const tokens = trimmed.split(/(\s+|[-,،()]+)/).filter((t) => t.trim());
  const words: string[] = [];
  for (const token of tokens) {
    if (/^[\d.]+$/.test(token) || /^[-,،()]+$/.test(token)) {
      words.push(token);
      continue;
    }
    const word = GRADE_WORDS[token.toLowerCase()];
    if (word === undefined) return trimmed;
    if (word) words.push(word);
  }
  return words.join(" ").replace(/\s+([),])/g, "$1").replace(/\(\s+/g, "(");
};

export const categorizeGrade = (grade: string): GradeCategory => {
  const g = grade.toLowerCase();
  if (/mawdu|batil/.test(g)) return "mawdu";
  if (/da'?if|munkar|shadh|malool/.test(g)) return "daif";
  if (/sahih/.test(g)) return "sahih";
  if (/hasan/.test(g)) return "hasan";
  return "other";
};

// "-" entries carry no information in the source data.
export const meaningfulGrades = (grades: HadithGrade[]): HadithGrade[] =>
  grades.filter((g) => g.grade.trim() && g.grade.trim() !== "-");

// Al-Albani is the most widely cited grader in this dataset; prefer his grade for
// the compact badge, otherwise the first one listed.
export const primaryGrade = (grades: HadithGrade[]): HadithGrade | null => {
  const usable = meaningfulGrades(grades);
  return usable.find((g) => g.grader === "Al-Albani") ?? usable[0] ?? null;
};
