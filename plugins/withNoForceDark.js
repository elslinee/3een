const { withAndroidStyles, AndroidConfig } = require("expo/config-plugins");

// Some OEMs (e.g. Xiaomi MIUI/HyperOS "dark mode for other apps") auto-darken
// light themes, turning the light splash/background black around the logo.
// The app ships its own dark theme, so opt out of system force-dark.
module.exports = function withNoForceDark(config) {
  return withAndroidStyles(config, (config) => {
    config.modResults = AndroidConfig.Styles.assignStylesValue(
      config.modResults,
      {
        add: true,
        parent: AndroidConfig.Styles.getAppThemeGroup(),
        name: "android:forceDarkAllowed",
        value: "false",
      },
    );
    return config;
  });
};
