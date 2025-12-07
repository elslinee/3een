const fs = require("fs");
const path = require("path");

const jsonDir = path.join(__dirname, "assets", "json");

// قائمة الملفات المراد ضغطها
const filesToCompress = ["Azkar.json", "Quran.json"];

filesToCompress.forEach((fileName) => {
  const jsonPath = path.join(jsonDir, fileName);

  try {
    // قراءة ملف JSON
    const jsonContent = fs.readFileSync(jsonPath, "utf8");

    // تحليل JSON للتأكد من صحته
    const data = JSON.parse(jsonContent);

    // ضغط JSON (إزالة المسافات والأسطر الفارغة)
    const compressed = JSON.stringify(data);

    // إنشاء نسخة احتياطية
    const backupPath = jsonPath + ".backup";
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(jsonPath, backupPath);
      console.log(`📦 Created backup: ${fileName}.backup`);
    }

    // كتابة الملف المضغوط
    fs.writeFileSync(jsonPath, compressed, "utf8");

    // حساب نسبة الضغط
    const originalSize = Buffer.byteLength(jsonContent, "utf8");
    const compressedSize = Buffer.byteLength(compressed, "utf8");
    const savings = (
      ((originalSize - compressedSize) / originalSize) *
      100
    ).toFixed(2);

    console.log(`✅ Compressed ${fileName}`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Compressed: ${(compressedSize / 1024).toFixed(2)} KB`);
    console.log(
      `   Savings: ${savings}% (${((originalSize - compressedSize) / 1024).toFixed(2)} KB)\n`
    );
  } catch (error) {
    console.error(`❌ Error compressing ${fileName}:`, error.message);
  }
});

console.log("✨ Compression complete!");
