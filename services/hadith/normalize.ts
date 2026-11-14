const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/; // + tatweel
const LETTER_MAP: Record<string, string> = {
  أ: "ا",
  إ: "ا",
  آ: "ا",
  ٱ: "ا",
  ة: "ه",
  ى: "ي",
  ؤ: "و",
  ئ: "ي",
};

// Per-character rule shared by normalizeArabic and findMatchRanges, so highlighting
// on the original text lines up exactly with what the search matched.
const normalizeChar = (ch: string): string => {
  if (TASHKEEL.test(ch)) return "";
  if (/\s/.test(ch)) return " ";
  const code = ch.charCodeAt(0);
  if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
  return LETTER_MAP[ch] ?? ch;
};

// Applied to both the search query and the stored text so they match regardless of
// diacritics or letter-form spelling (أ/إ/آ, ة/ه, ى/ي ...).
export const normalizeArabic = (text: string): string => {
  let out = "";
  for (const ch of text) {
    const n = normalizeChar(ch);
    if (n === " " && (out === "" || out.endsWith(" "))) continue;
    out += n;
  }
  return out.trimEnd();
};

// Returns the number when the query is just a hadith number (Arabic or Latin digits).
export const parseHadithNumber = (query: string): number | null => {
  const normalized = normalizeArabic(query);
  return /^\d+$/.test(normalized) ? Number(normalized) : null;
};

/** [start, end) ranges in the original text where the normalized needle occurs. */
export const findMatchRanges = (
  text: string,
  normalizedNeedle: string,
): [number, number][] => {
  if (!normalizedNeedle) return [];
  let normalized = "";
  const origin: number[] = []; // origin[i] = index in `text` of normalized[i]
  for (let i = 0; i < text.length; i++) {
    const n = normalizeChar(text[i]);
    if (!n) continue;
    if (n === " " && (normalized === "" || normalized.endsWith(" "))) continue;
    normalized += n;
    origin.push(i);
  }

  const ranges: [number, number][] = [];
  let from = 0;
  while (true) {
    const at = normalized.indexOf(normalizedNeedle, from);
    if (at === -1) break;
    let end = origin[at + normalizedNeedle.length - 1] + 1;
    // Keep the matched word's trailing diacritics inside the highlight.
    while (end < text.length && normalizeChar(text[end]) === "") end++;
    ranges.push([origin[at], end]);
    from = at + normalizedNeedle.length;
  }
  return ranges;
};
