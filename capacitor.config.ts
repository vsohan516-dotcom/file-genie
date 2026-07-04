import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.smartfiles.manager",
  appName: "Smart Files",
  webDir: "dist",
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0b1220",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0b1220",
    },
    Keyboard: {
      resize: "body",
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#22c55e",
    },
  },
};

export default config;
