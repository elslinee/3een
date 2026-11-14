import type { HadithBook } from "@/constants/hadithBooks";

// Mirrors scripts/generate-hadith-books.js so the hadiths stored per section match the
// counts bundled in hadithBooks.json:
// - reference.book is trusted when it isn't 0;
// - 0 means "unknown", except inside a real, titled section 0 (muslim, ibnmajah);
// - unknown hadiths go to the section whose range contains them, else the closest
//   preceding section.
export const createSectionResolver = (book: HadithBook) => {
  const sections = [...book.sections].sort((a, b) => a.first - b.first);
  const realSection0 = book.sections.find((s) => s.number === 0);

  return (hadithNumber: number, referenceBook: number): number => {
    if (referenceBook !== 0) return referenceBook;
    if (
      realSection0 &&
      hadithNumber >= realSection0.first &&
      hadithNumber <= realSection0.last
    ) {
      return 0;
    }
    const inside = sections.find(
      (s) => hadithNumber >= s.first && hadithNumber <= s.last,
    );
    if (inside) return inside.number;
    let previous = sections[0];
    for (const s of sections) {
      if (s.first <= hadithNumber) previous = s;
    }
    return previous.number;
  };
};
