import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.connectfour',
  appName: 'Connect Four',
  webDir: 'dist',
  
  // Development server for hot-reload (comment out for production builds)
  server: {
    url: 'https://5f6e3cf7-242f-4ea3-8dbe-acb0757256da.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f1729',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
      // Use the generated splash screen
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Splash Screen',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f1729',
    },
    Haptics: {
      // Haptics are enabled by default
    },
    // AdMob configuration (replace with your real IDs for production)
    AdMob: {
      appId: {
        android: 'ca-app-pub-3940256099942544~3347511713', // Test ID
        ios: 'ca-app-pub-3940256099942544~1458002511', // Test ID
      },
    },
  },

  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Connect Four',
  },

  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false, // Set to true for debugging
  },
};

export default config;
