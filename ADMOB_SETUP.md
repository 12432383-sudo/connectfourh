# AdMob Integration Guide

This Connect Four game includes AdMob integration for displaying ads in native iOS/Android apps.

## Current Setup (Development)

The app is configured with **Google's test ad IDs** for safe development testing:
- Banner ads at the bottom of the screen
- Interstitial ads shown every 3 games

## Setup for Production

### 1. Create AdMob Account
1. Go to [AdMob](https://admob.google.com/)
2. Create an account and register your app
3. Create ad units (Banner + Interstitial)

### 2. Update Ad IDs

Edit `src/hooks/useAdMob.ts` and replace the test IDs:

```typescript
export const AD_CONFIG = {
  android: {
    banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',      // Your Android banner ID
    interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your Android interstitial ID
    appId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',        // Your Android App ID
  },
  ios: {
    banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',      // Your iOS banner ID
    interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your iOS interstitial ID
    appId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',        // Your iOS App ID
  },
};
```

### 3. Configure Capacitor

Add to `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  // ... other config
  plugins: {
    AdMob: {
      appId: {
        android: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
        ios: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
      },
    },
  },
};
```

### 4. iOS Setup

Add to `ios/App/App/Info.plist`:

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX</string>
<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cstr6suwn9.skadnetwork</string>
  </dict>
</array>
```

### 5. Android Setup

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"/>
```

### 6. Disable Testing Mode

In `useAdMob.ts`, change:
```typescript
initializeForTesting: false,  // Was true
isTesting: false,             // Was true
```

## Ad Behavior

- **Banner**: Displays at bottom of screen automatically on native platforms
- **Interstitial**: Shows every 3 completed games when player starts a new game

## Testing

1. Build for iOS/Android: `npx cap sync`
2. Open in IDE: `npx cap open ios` or `npx cap open android`
3. Run on device/emulator
4. Test ads will display automatically

## Important Notes

- Never click your own ads in production - this violates AdMob policies
- Test thoroughly with test ads before switching to production IDs
- Add your device ID to `testingDevices` array for testing on real devices
- Review AdMob policies before publishing
