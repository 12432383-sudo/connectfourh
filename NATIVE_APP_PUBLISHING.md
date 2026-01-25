# 📱 Connect Four - Native App Publishing Guide

Complete step-by-step guide to publish your Connect Four game to the Apple App Store and Google Play Store.

---

## 📋 Prerequisites

### Required Tools
- **macOS** (required for iOS development)
- **Xcode 15+** (for iOS) - [Download from Mac App Store](https://apps.apple.com/app/xcode/id497799835)
- **Android Studio** (for Android) - [Download](https://developer.android.com/studio)
- **Node.js 18+** and **npm**
- **Git**

### Required Accounts
- **Apple Developer Account** ($99/year) - [Enroll](https://developer.apple.com/programs/enroll/)
- **Google Play Developer Account** ($25 one-time) - [Register](https://play.google.com/console/signup)
- **AdMob Account** (free) - [Sign up](https://admob.google.com/)

---

## 🚀 Step 1: Export & Set Up Locally

### 1.1 Export to GitHub
1. In Lovable, click **GitHub** → **Connect to GitHub**
2. Authorize and create a new repository
3. Wait for the code to sync

### 1.2 Clone & Install
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Install dependencies
npm install
```

### 1.3 Initialize Capacitor
```bash
# Build the web app first
npm run build

# Add native platforms
npx cap add ios
npx cap add android

# Sync web code to native projects
npx cap sync
```

---

## 🍎 Step 2: iOS App Store Publishing

### 2.1 Configure for Production

Edit `capacitor.config.ts` - **Comment out the server block** for production:
```typescript
// server: {
//   url: 'https://...',
//   cleartext: true,
// },
```

### 2.2 Open in Xcode
```bash
npx cap open ios
```

### 2.3 Configure Xcode Project

1. **Select your team**: Click on the project → Signing & Capabilities → Select your Apple Developer Team
2. **Bundle Identifier**: Update to your unique ID (e.g., `com.yourcompany.connectfour`)
3. **Version**: Set version number (e.g., 1.0.0) and build number (e.g., 1)

### 2.4 Add App Icons

1. In Xcode, go to `App/Assets.xcassets/AppIcon`
2. Add icons in all required sizes (use [App Icon Generator](https://appicon.co/))
3. Required sizes: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

### 2.5 Configure Info.plist

Add these keys to `ios/App/App/Info.plist`:
```xml
<!-- AdMob -->
<key>GADApplicationIdentifier</key>
<string>YOUR_ADMOB_IOS_APP_ID</string>
<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cstr6suwn9.skadnetwork</string>
  </dict>
</array>

<!-- App Transport Security (if needed) -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
</dict>
```

### 2.6 Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: Connect Four
   - Primary Language: English
   - Bundle ID: Select from dropdown (matches Xcode)
   - SKU: connectfour001

### 2.7 Build & Upload

1. In Xcode: **Product** → **Archive**
2. When archive completes, click **Distribute App**
3. Select **App Store Connect** → **Upload**
4. Wait for processing (15-30 minutes)

### 2.8 Submit for Review

1. In App Store Connect, select your app
2. Fill in all required metadata:
   - Screenshots (6.7", 6.5", 5.5" displays)
   - Description, keywords, support URL
   - Age rating (4+ for this game)
   - Privacy policy URL
3. Select your build
4. Click **Submit for Review**

**Review typically takes 1-3 days.**

---

## 🤖 Step 3: Google Play Store Publishing

### 3.1 Configure for Production

Edit `capacitor.config.ts` - comment out server block (same as iOS).

### 3.2 Open in Android Studio
```bash
npx cap open android
```

### 3.3 Configure App

1. Open `android/app/build.gradle`
2. Update:
```gradle
android {
    defaultConfig {
        applicationId "com.yourcompany.connectfour"
        versionCode 1
        versionName "1.0.0"
        minSdkVersion 22
        targetSdkVersion 34
    }
}
```

### 3.4 Add App Icons

1. Right-click `app/res` → **New** → **Image Asset**
2. Select your 1024x1024 icon
3. Generate all sizes automatically

### 3.5 Configure AndroidManifest.xml

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<!-- Inside <application> tag -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="YOUR_ADMOB_ANDROID_APP_ID"/>

<!-- Permissions (already included by Capacitor) -->
<uses-permission android:name="android.permission.INTERNET" />
```

### 3.6 Generate Signed APK/AAB

1. In Android Studio: **Build** → **Generate Signed Bundle / APK**
2. Choose **Android App Bundle** (recommended for Play Store)
3. Create new keystore:
   - Key store path: `~/my-release-key.jks`
   - Password: (create strong password)
   - Alias: `connect-four`
   - Validity: 25+ years
   
   ⚠️ **IMPORTANT**: Back up your keystore file and passwords securely! You need these for all future updates.

4. Select **release** build variant
5. Click **Finish**

### 3.7 Create App in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console/)
2. Click **Create app**
3. Fill in:
   - App name: Connect Four
   - Default language: English
   - App or game: Game
   - Free or paid: Free
4. Accept policies and create

### 3.8 Complete Store Listing

1. **Main store listing**:
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (phone, 7" tablet, 10" tablet)
   - Feature graphic (1024x500)
   - App icon (512x512)

2. **App content**:
   - Privacy policy URL
   - Ads declaration: Yes, contains ads
   - Content rating questionnaire
   - Target audience: Everyone
   - Data safety form

### 3.9 Upload & Release

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload your `.aab` file
4. Add release notes
5. Click **Review release** → **Start rollout**

**Review typically takes 1-7 days for new apps.**

---

## 📊 Step 4: AdMob Production Setup

### 4.1 Create AdMob Apps
1. Go to [AdMob](https://admob.google.com/)
2. **Apps** → **Add app** for both iOS and Android
3. Link to your App Store/Play Store listings

### 4.2 Create Ad Units
For each platform, create:
- **Banner ad** (for bottom of screen)
- **Interstitial ad** (for between games)

### 4.3 Update Your Code
Replace test IDs in `src/hooks/useAdMob.ts`:
```typescript
export const AD_CONFIG = {
  android: {
    banner: 'ca-app-pub-XXXX/YYYY',      // Your real banner ID
    interstitial: 'ca-app-pub-XXXX/ZZZZ', // Your real interstitial ID
    appId: 'ca-app-pub-XXXX~AAAA',
  },
  ios: {
    banner: 'ca-app-pub-XXXX/BBBB',
    interstitial: 'ca-app-pub-XXXX/CCCC',
    appId: 'ca-app-pub-XXXX~DDDD',
  },
};
```

Set `isTesting: false` in the code.

---

## 🔄 Step 5: Updating Your App

### After Making Changes in Lovable:

```bash
# Pull latest changes
git pull

# Rebuild
npm run build

# Sync to native projects
npx cap sync

# Open and rebuild
npx cap open ios    # or android
```

Then archive and upload new build following steps above.

---

## 📝 Checklist Before Publishing

### iOS
- [ ] Bundle ID configured correctly
- [ ] App icons added (all sizes)
- [ ] Screenshots captured (all device sizes)
- [ ] AdMob App ID in Info.plist
- [ ] Server URL commented out in capacitor.config.ts
- [ ] Privacy policy URL ready
- [ ] App Store Connect listing complete

### Android
- [ ] Application ID configured
- [ ] App icons generated
- [ ] Screenshots captured
- [ ] Keystore created and backed up
- [ ] AdMob App ID in AndroidManifest.xml
- [ ] Server URL commented out in capacitor.config.ts
- [ ] Privacy policy URL ready
- [ ] Play Console listing complete
- [ ] Data safety form completed

---

## 🆘 Troubleshooting

### Common Issues

**Build fails with signing error (iOS)**
→ Ensure you selected a valid team in Xcode signing settings

**App crashes on launch**
→ Check that you ran `npm run build` before `npx cap sync`

**Ads not showing**
→ Verify AdMob app IDs match in all config files

**"App not installed" (Android)**
→ Uninstall any debug versions before installing release build

### Getting Help
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Apple Developer Forums](https://developer.apple.com/forums/)
- [Android Developer Support](https://developer.android.com/support)

---

## 🎉 Congratulations!

Once approved, your Connect Four game will be live on the App Store and Play Store! 

Remember to:
- Monitor reviews and respond to user feedback
- Track ad performance in AdMob dashboard
- Keep the app updated with bug fixes and improvements
