import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cm.kapexpert.grouping',
  appName: 'GroupinG',
  webDir: 'www',
  server: {
    androidScheme: 'https',
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
      backgroundColor: '#2665db'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;