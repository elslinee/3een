export class TranslationService {
  private static translations: { [key: string]: string } = {
    // Countries
    Palestine: "فلسطين",
    Israel: "إسرائيل",
    Jordan: "الأردن",
    Egypt: "مصر",

    // Egyptian Governorates
    Cairo: "القاهرة",
    "Cairo Governorate": "القاهرة",
    Giza: "الجيزة",
    "Giza Governorate": "الجيزة",
    Alexandria: "الإسكندرية",
    "Alexandria Governorate": "الإسكندرية",
    Dakahlia: "الدقهلية",
    "Dakahlia Governorate": "الدقهلية",
    "Red Sea": "البحر الأحمر",
    "Red Sea Governorate": "البحر الأحمر",
    Beheira: "البحيرة",
    "Beheira Governorate": "البحيرة",
    Fayyum: "الفيوم",
    "Fayyum Governorate": "الفيوم",
    Gharbia: "الغربية",
    "Gharbia Governorate": "الغربية",
    Ismailia: "الإسماعيلية",
    "Ismailia Governorate": "الإسماعيلية",
    Monufia: "المنوفية",
    "Monufia Governorate": "المنوفية",
    Minya: "المنيا",
    "Minya Governorate": "المنيا",
    Qalyubia: "القليوبية",
    "Qalyubia Governorate": "القليوبية",
    "New Valley": "الوادي الجديد",
    "New Valley Governorate": "الوادي الجديد",
    Suez: "السويس",
    "Suez Governorate": "السويس",
    Aswan: "أسوان",
    "Aswan Governorate": "أسوان",
    Asyut: "أسيوط",
    Assiut: "أسيوط",
    "Assiut Governorate": "أسيوط",
    "Asyut Governorate": "أسيوط",
    "Beni Suef": "بني سويف",
    "Beni Suef Governorate": "بني سويف",
    "Port Said": "بورسعيد",
    "Port Said Governorate": "بورسعيد",
    Damietta: "دمياط",
    "Damietta Governorate": "دمياط",
    Sharkia: "الشرقية",
    "Sharkia Governorate": "الشرقية",
    "South Sinai": "جنوب سيناء",
    "South Sinai Governorate": "جنوب سيناء",
    "Kafr el-Sheikh": "كفر الشيخ",
    "Kafr el-Sheikh Governorate": "كفر الشيخ",
    Matrouh: "مطروح",
    "Matrouh Governorate": "مطروح",
    Luxor: "الأقصر",
    "Luxor Governorate": "الأقصر",
    Qena: "قنا",
    "Qena Governorate": "قنا",
    "North Sinai": "شمال سيناء",
    "North Sinai Governorate": "شمال سيناء",
    Sohag: "سوهاج",
    "Sohag Governorate": "سوهاج",

    // Common Egyptian place names and neighborhoods
    "Al Ghnaeem": "الغنايم",
    "Al Qtna": "القطنة",
    Nazlet: "نزلة",
    Awlad: "أولاد",
    Mohammed: "محمد",
    "Nazlet Awlad Mohammed": "نزلة أولاد محمد",
    "Al Ghnaeem - Al Qtna Road": "طريق الغنائم - القطنة",

    Lebanon: "لبنان",
    Syria: "سوريا",
    "Saudi Arabia": "المملكة العربية السعودية",
    "United Arab Emirates": "الإمارات العربية المتحدة",
    Kuwait: "الكويت",
    Qatar: "قطر",
    Bahrain: "البحرين",
    Oman: "عُمان",
    Iraq: "العراق",
    Iran: "إيران",
    Turkey: "تركيا",
    "United States": "الولايات المتحدة",
    "United Kingdom": "المملكة المتحدة",
    France: "فرنسا",
    Germany: "ألمانيا",
    Italy: "إيطاليا",
    Spain: "إسبانيا",
    Canada: "كندا",
    Australia: "أستراليا",
    Japan: "اليابان",
    China: "الصين",
    India: "الهند",
    Brazil: "البرازيل",
    Russia: "روسيا",

    // Palestinian regions and cities
    "Gaza Strip": "قطاع غزة",
    "West Bank": "الضفة الغربية",
    Gaza: "غزة",
    Ramallah: "رام الله",
    Jerusalem: "القدس",
    Hebron: "الخليل",
    Nablus: "نابلس",
    Bethlehem: "بيت لحم",
    Jenin: "جنين",
    Tulkarm: "طولكرم",
    Qalqilya: "قلقيلية",
    Salfit: "سلفيت",
    Jericho: "أريحا",
    Tubas: "طوباس",
    "Khan Younis": "خان يونس",
    Rafah: "رفح",
    "Deir al-Balah": "دير البلح",
    Jabalia: "جباليا",
    "Beit Hanoun": "بيت حانون",
    "Beit Lahia": "بيت لاهيا",

    // Israeli cities
    "Tel Aviv": "تل أبيب",
    Haifa: "حيفا",
    Beersheba: "بئر السبع",
    Eilat: "إيلات",
    Nazareth: "الناصرة",
    Akko: "عكا",
    Tiberias: "طبريا",
    Safed: "صفد",

    // Common address terms
    Governorat: "محافظة",
    Governorate: "محافظة",
    Road: "طريق",
    Street: "شارع",
    Avenue: "جادة",
    Boulevard: "شارع",
    Lane: "زقاق",
    Drive: "طريق",
    Place: "مكان",
    Square: "ميدان",
    Circle: "دائرة",
    North: "شمال",
    South: "جنوب",
    East: "شرق",
    West: "غرب",
    Center: "وسط",
    Central: "وسط",
    District: "حي",
    Neighborhood: "حي",
    Area: "منطقة",
    Region: "منطقة",
    Province: "محافظة",
    State: "ولاية",
    City: "مدينة",
    Town: "بلدة",
    Village: "قرية",
    Building: "مبنى",
    Tower: "برج",
    Complex: "مجمع",
    Mall: "مول",
    Hospital: "مستشفى",
    School: "مدرسة",
    University: "جامعة",
    Mosque: "مسجد",
    Church: "كنيسة",
    Market: "سوق",
    Station: "محطة",
    Airport: "مطار",
    Port: "ميناء",
    Bridge: "جسر",
    Park: "حديقة",
    Garden: "حديقة",
    Beach: "شاطئ",
    Mountain: "جبل",
    Hill: "تل",
    Valley: "وادي",
    River: "نهر",
    Lake: "بحيرة",
    Sea: "بحر",
    Ocean: "محيط",
    Desert: "صحراء",
    Forest: "غابة",
    Island: "جزيرة",
    Peninsula: "شبه جزيرة",
    Bay: "خليج",
    Cape: "رأس",
    Point: "نقطة",
    Corner: "زاوية",
    Crossing: "تقاطع",
    Intersection: "تقاطع",
    Roundabout: "دوار",
    Highway: "طريق سريع",
    Freeway: "طريق سريع",
    Expressway: "طريق سريع",
    Bypass: "طريق جانبي",
    "Ring Road": "طريق دائري",
    "Main Street": "الشارع الرئيسي",
    First: "الأول",
    Second: "الثاني",
    Third: "الثالث",
    Fourth: "الرابع",
    Fifth: "الخامس",
    Sixth: "السادس",
    Seventh: "السابع",
    Eighth: "الثامن",
    Ninth: "التاسع",
    Tenth: "العاشر",
  };

  static translate(text: string): string {
    if (!text) return text;

    const trimmedText = text.trim();

    if (this.translations[trimmedText]) {
      return this.translations[trimmedText];
    }

    const lowerText = trimmedText.toLowerCase();
    for (const [english, arabic] of Object.entries(this.translations)) {
      if (english.toLowerCase() === lowerText) {
        return arabic;
      }
    }

    return trimmedText;
  }

  static translateAddress(address: string): string {
    if (!address) return address;

    const parts = address.split(/[,\s]+/).filter((part) => part.trim());
    const translatedParts: string[] = [];

    for (const part of parts) {
      const translated = this.translate(part);
      translatedParts.push(translated);
    }

    return translatedParts.join("، ");
  }


  static translateAddressComponents(addressComponents: {
    city?: string;
    region?: string;
    country?: string;
    district?: string;
    street?: string;
    streetNumber?: string;
  }): string {
    const parts: string[] = [];

    if (addressComponents.streetNumber) {
      parts.push(addressComponents.streetNumber);
    }

    if (addressComponents.street) {
      parts.push(this.translate(addressComponents.street));
    }

    if (addressComponents.district) {
      parts.push(this.translate(addressComponents.district));
    }

    if (addressComponents.city) {
      parts.push(this.translate(addressComponents.city));
    }

    if (addressComponents.region) {
      parts.push(this.translate(addressComponents.region));
    }

    if (addressComponents.country) {
      parts.push(this.translate(addressComponents.country));
    }

    return parts
      .map((p) => p?.trim())
      .filter(Boolean)
      .join("، ");
  }
}
