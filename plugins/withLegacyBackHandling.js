const { withAndroidManifest } = require("expo/config-plugins");

// Targeting Android 16 (API 36) turns predictive back on by default, which stops
// Activity.onBackPressed() from being called. React Native 0.79 routes the hardware
// back button through onBackPressed, so without this opt-out "back" would close the
// app instead of navigating. Remove after upgrading to an RN version that uses
// OnBackPressedDispatcher (Expo SDK 54+).
module.exports = function withLegacyBackHandling(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (application) {
      application.$["android:enableOnBackInvokedCallback"] = "false";
    }
    return config;
  });
};
