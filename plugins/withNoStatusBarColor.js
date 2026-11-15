const { withAndroidStyles, AndroidConfig } = require("expo/config-plugins");

// With edgeToEdgeEnabled: true the app uses Theme.EdgeToEdge which makes
// system bars transparent. Expo's prebuild still writes an explicit
// android:statusBarColor matching android.backgroundColor, which is
// deprecated on Android 15+ (SDK 35) and triggers the "deprecated APIs
// for edge-to-edge" warning on Google Play. This plugin removes that
// attribute so the edge-to-edge theme's transparent default takes over.
module.exports = function withNoStatusBarColor(config) {
  return withAndroidStyles(config, (config) => {
    const styles = config.modResults;
    // Walk every <style> → <item> and drop android:statusBarColor
    for (const resource of styles.resources?.style ?? []) {
      if (resource.item) {
        resource.item = resource.item.filter(
          (item) => item.$?.name !== "android:statusBarColor",
        );
      }
    }
    return config;
  });
};
