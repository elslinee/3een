export interface Ayah {
  numberInSurah: number;
  text: string;
  translation?: string;
  page?: number;
  juz?: number;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
}
