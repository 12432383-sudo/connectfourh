import { CapacitorConfig } from '@capacitor/cli';

// Set to true for development with hot-reload, false for production builds
const IS_DEVELOPMENT = false;

const config: CapacitorConfig = {
  appId: 'app.lovable.connectfour',
  appName: 'Connect Four',
  webDir: 'dist',
  
  // Development server for hot-reload (only active when IS_DEVELOPMENT is true)
  ...(IS_DEVELOPMENT && {
    server: {
      url: 'https://5f6e3cf7-242f-4ea3-8dbe-acb0757256da.lovableproject.com?forceHideBadge=true',
      cleartext: true,
    },
  }),
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f1729',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
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
    // AdMob configuration
    // IMPORTANT: Replace these test IDs with your production IDs before publishing!
    AdMob: {
      appId: {
        android: 'ca-app-pub-3940256099942544~3347511713', // Replace with production ID
        ios: 'ca-app-pub-3940256099942544~1458002511', // Replace with production ID
      },
    },
  },

  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Connect Four',
    // Lock to portrait orientation for consistent gameplay
    allowNavigation: [],
  },

  android: {
    allowMixedContent: false, // Disabled for production security
    captureInput: true,
    webContentsDebuggingEnabled: false, // Must be false for production
    // Lock to portrait orientation
    backgroundColor: '#0f1729',
  },
};

export default config;
