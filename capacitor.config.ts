import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cm.kapexpert.grouping',
  appName: 'groupinG',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    // Allow navigation to the callback URL for OAuth
    allowNavigation: [
      'localhost',
      'kapexpert.cloud'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff',
      overlaysWebView: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;