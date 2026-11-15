const { withAppBuildGradle, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

// Switch ProGuard from the default "proguard-android.txt" (which contains
// -dontobfuscate) to "proguard-android-optimize.txt" so that R8 applies both
// code shrinking AND obfuscation, which Google Play requires for the DEX code
// optimization score.
//
// Also injects extra keep rules needed for React Native + Hermes + Reanimated
// to survive full obfuscation.
module.exports = function withProguardOptimize(config) {
  // 1. Patch build.gradle to use the optimizing ProGuard config
  config = withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      'getDefaultProguardFile("proguard-android.txt")',
      'getDefaultProguardFile("proguard-android-optimize.txt")',
    );
    return config;
  });

  // 2. Append extra keep rules to proguard-rules.pro
  config = withDangerousMod(config, [
    "android",
    (config) => {
      const proguardPath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "proguard-rules.pro",
      );

      const extraRules = `
# ── Added by withProguardOptimize ──

# React Native annotations
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * { @com.facebook.proguard.annotations.DoNotStrip *; }
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Expo modules
-keep class expo.modules.** { *; }

# React Native UI annotations
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}

# OkHttp / Okio (React Native networking)
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
`;

      let contents = fs.readFileSync(proguardPath, "utf-8");
      if (!contents.includes("withProguardOptimize")) {
        contents += extraRules;
        fs.writeFileSync(proguardPath, contents);
      }
      return config;
    },
  ]);

  return config;
};
