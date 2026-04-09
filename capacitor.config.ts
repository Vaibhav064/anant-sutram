import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anantsutram.app',
  appName: 'Anant Sutram',
  webDir: 'dist',
  android: {
    backgroundColor: '#080612',
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#080612',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
