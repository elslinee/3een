// استيراد ملف JSON المحلي - Lazy loading
let QuranData: LocalSurah[] | null = null;

// تعريف الأنواع
interface LocalAyah {
  number: number;
  text: {
    ar: string;
    en?: string;
  };
  juz: number;
  page: number;
  sajda: boolean;
}

interface LocalSurah {
  number: number;
  name: {
    ar: string;
    en?: string;
    transliteration?: string;
  };
  revelation_place: {
    ar: string;
    en?: string;
  };
  verses_count: number;
  words__count?: number;
  letters__count?: number;
  verses: LocalAyah[];
}

interface ApiAyah {
  numberInSurah: number;
  text: string;
  translation?: string;
  page?: number;
  juz?: number;
}

interface ApiSurahData {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: ApiAyah[];
}

interface ApiResponse {
  data: {
    data: ApiSurahData;
  };
}

// دالة لتحويل البيانات المحلية إلى تنسيق API
const convertLocalToApiFormat = (localSurah: LocalSurah): ApiSurahData => {
  // Determine revelation type from Arabic text if English is not available
  const revelationType =
    localSurah.revelation_place.en === "meccan"
      ? "Meccan"
      : localSurah.revelation_place.en === "medinan"
        ? "Medinan"
        : localSurah.revelation_place.ar === "مكية"
          ? "Meccan"
          : "Medinan";

  return {
    number: localSurah.number,
    name: localSurah.name.ar,
    englishName: localSurah.name.en || localSurah.name.transliteration || "",
    numberOfAyahs: localSurah.verses_count,
    revelationType: revelationType,
    ayahs: localSurah.verses.map((ayah) => ({
      numberInSurah: ayah.number,
      text: ayah.text.ar,
      translation: ayah.text.en,
      page: ayah.page,
      juz: ayah.juz,
    })),
  };
};

const getAllQuran = (): Promise<ApiResponse> => {
  // نظرًا لأن البيانات المحلية، نقوم بإرجاع Promise مباشرة
  return Promise.resolve({
    data: {
      data: QuranData as unknown as ApiSurahData,
    },
  });
};

// دالة لتحميل البيانات عند الحاجة فقط مع تحسين الأداء
const loadQuranData = async (): Promise<LocalSurah[]> => {
  if (QuranData === null) {
    try {
      // تحميل تدريجي مع تحسين الأداء
      const { default: data } = await import("@/assets/json/Quran.json");
      QuranData = data as LocalSurah[];
    } catch (error) {
      console.error("Error loading Quran data:", error);
      return [];
    }
  }
  return QuranData;
};

const getSurahByNumber = async (number: number): Promise<ApiResponse> => {
  const quranData = await loadQuranData();
  const surah = quranData.find((s: LocalSurah) => s.number === number);

  if (!surah) {
    return Promise.reject(new Error(`السورة رقم ${number} غير موجودة`));
  }

  const convertedSurah = convertLocalToApiFormat(surah);

  return Promise.resolve({
    data: {
      data: convertedSurah,
    },
  });
};

const getAyah = async (ayahNumber: number): Promise<any> => {
  const quranData = await loadQuranData();
  // البحث عن الآية في جميع السور
  for (const surah of quranData) {
    const ayah = surah.verses.find((a) => a.number === ayahNumber);
    if (ayah) {
      return Promise.resolve({
        data: {
          data: {
            number: ayah.number,
            text: ayah.text.ar,
            translation: ayah.text.en,
            page: ayah.page,
            juz: ayah.juz,
            surah: {
              number: surah.number,
              name: surah.name.ar,
              englishName: surah.name.en || surah.name.transliteration || "",
            },
          },
        },
      });
    }
  }

  return Promise.reject(new Error(`الآية رقم ${ayahNumber} غير موجودة`));
};

// دالة للحصول على جميع الآيات من جميع السور مجمعة حسب الصفحات
const getAllAyahsByPages = async (): Promise<Map<number, ApiAyah[]>> => {
  const quranData = await loadQuranData();
  const pagesMap = new Map<number, ApiAyah[]>();

  quranData.forEach((surah) => {
    surah.verses.forEach((ayah) => {
      if (ayah.page) {
        if (!pagesMap.has(ayah.page)) {
          pagesMap.set(ayah.page, []);
        }
        const convertedAyah: ApiAyah = {
          numberInSurah: ayah.number,
          text: ayah.text.ar,
          translation: ayah.text.en,
          page: ayah.page,
          juz: ayah.juz,
        };
        pagesMap.get(ayah.page)!.push(convertedAyah);
      }
    });
  });

  return pagesMap;
};

// دالة لإزالة التشكيل والمسافات الزائدة من النص العربي
const removeDiacritics = (text: string): string => {
  // إزالة جميع علامات التشكيل (diacritics) والمسافات الزائدة
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "") // إزالة علامات التشكيل
    .replace(/[\u06E1\u06E2]/g, "") // إزالة علامات إضافية
    .replace(/[ًٌٍَُِّْٰ]/g, "") // إزالة علامات التشكيل الأساسية
    .replace(/\s+/g, " ") // استبدال المسافات المتعددة بمسافة واحدة
    .trim();
};

// دالة للبحث في الآيات مع تجاهل التشكيل
const searchAyahs = async (
  searchText: string
): Promise<
  Array<{
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    text: string;
    translation?: string;
  }>
> => {
  const quranData = await loadQuranData();
  const results: Array<{
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    text: string;
    translation?: string;
  }> = [];

  const searchLower = searchText.toLowerCase().trim();
  if (!searchLower) return results;

  // إزالة التشكيل والمسافات الزائدة من نص البحث
  const searchWithoutDiacritics = removeDiacritics(searchLower);
  // تقسيم نص البحث إلى كلمات للبحث المرن
  const searchWords = searchWithoutDiacritics
    .split(/\s+/)
    .filter((w) => w.length > 0);

  quranData.forEach((surah) => {
    surah.verses.forEach((ayah) => {
      // إزالة التشكيل من نص الآية
      const ayahTextWithoutDiacritics = removeDiacritics(
        ayah.text.ar.toLowerCase()
      );
      const ayahText = ayah.text.ar.toLowerCase();
      const translationText = ayah.text.en?.toLowerCase() || "";

      // البحث المرن: التحقق من وجود جميع كلمات البحث في الآية
      const allWordsMatch = searchWords.every((word) =>
        ayahTextWithoutDiacritics.includes(word)
      );

      // البحث في النص بدون تشكيل أو مع تشكيل أو في الترجمة
      if (
        allWordsMatch ||
        ayahTextWithoutDiacritics.includes(searchWithoutDiacritics) ||
        ayahText.includes(searchLower) ||
        translationText.includes(searchLower)
      ) {
        results.push({
          surahNumber: surah.number,
          surahName: surah.name.ar,
          ayahNumber: ayah.number,
          text: ayah.text.ar,
          translation: ayah.text.en,
        });
      }
    });
  });

  return results;
};

export {
  getAllQuran,
  getSurahByNumber,
  getAyah,
  getAllAyahsByPages,
  searchAyahs,
};
