const fs = require("fs");
const path = require("path");

// Path to the Quran JSON file
const quranJsonPath = path.join(__dirname, "assets", "json", "Quran.json");

// Read the JSON file
console.log("Reading Quran.json...");
const quranData = JSON.parse(fs.readFileSync(quranJsonPath, "utf8"));

// Process each surah
console.log(`Processing ${quranData.length} surahs...`);
let totalVersesProcessed = 0;

quranData.forEach((surah) => {
  // Remove English fields from surah name
  if (surah.name) {
    delete surah.name.en;
    delete surah.name.transliteration;
  }

  // Remove English field from revelation place
  if (surah.revelation_place) {
    delete surah.revelation_place.en;
  }

  // Process verses
  if (surah.verses && Array.isArray(surah.verses)) {
    surah.verses.forEach((verse) => {
      // Remove English translation from verse text
      if (verse.text) {
        delete verse.text.en;
      }
      totalVersesProcessed++;
    });
  }
});

console.log(`Processed ${totalVersesProcessed} verses`);

// Write the modified data back to the file
console.log("Writing updated data to Quran.json...");
fs.writeFileSync(quranJsonPath, JSON.stringify(quranData, null, 2), "utf8");

console.log("✅ Successfully removed all English fields from Quran.json");
