# App Icon & Splash Screen Assets

This folder contains the master app icon and splash screen for Connect Four.

## Generated Assets

- `app-icon.png` (1024x1024) - Master app icon
- `splash-screen.png` (1080x1920) - Splash screen for mobile devices

## Generating All Required Sizes

### Option 1: Online Tools (Recommended)

**For App Icons:**
1. Go to [App Icon Generator](https://appicon.co/)
2. Upload `public/app-icon.png`
3. Select both iOS and Android
4. Download the generated icon sets
5. Place in respective platform folders:
   - iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Android: `android/app/src/main/res/mipmap-*/`

**For Splash Screens:**
1. Use [Capacitor Splash Screen Generator](https://apetools.webprofusion.com/#/tools/imagegorilla)
2. Upload `public/splash-screen.png`
3. Generate for iOS and Android

### Option 2: Using Capacitor Assets Plugin

```bash
# Install the assets plugin
npm install @capacitor/assets --save-dev

# Generate all icons and splash screens
npx capacitor-assets generate --iconBackgroundColor '#0f1729' --splashBackgroundColor '#0f1729'
```

## Required Icon Sizes

### iOS App Icons
| Size | Scale | Filename |
|------|-------|----------|
| 20x20 | 2x, 3x | icon-20@2x.png, icon-20@3x.png |
| 29x29 | 2x, 3x | icon-29@2x.png, icon-29@3x.png |
| 40x40 | 2x, 3x | icon-40@2x.png, icon-40@3x.png |
| 60x60 | 2x, 3x | icon-60@2x.png, icon-60@3x.png |
| 76x76 | 1x, 2x | icon-76.png, icon-76@2x.png |
| 83.5x83.5 | 2x | icon-83.5@2x.png |
| 1024x1024 | 1x | icon-1024.png (App Store) |

### Android App Icons
| Density | Size | Folder |
|---------|------|--------|
| mdpi | 48x48 | mipmap-mdpi |
| hdpi | 72x72 | mipmap-hdpi |
| xhdpi | 96x96 | mipmap-xhdpi |
| xxhdpi | 144x144 | mipmap-xxhdpi |
| xxxhdpi | 192x192 | mipmap-xxxhdpi |
| Play Store | 512x512 | - |

### Splash Screen Sizes

**iOS:**
- 2732x2732 (iPad Pro 12.9")
- 2048x2048 (Universal)
- 1242x2688 (iPhone XS Max)
- 1125x2436 (iPhone X/XS)
- 828x1792 (iPhone XR)

**Android:**
- 480x800 (mdpi)
- 720x1280 (hdpi)
- 1080x1920 (xhdpi)
- 1440x2560 (xxhdpi)
- 1920x3200 (xxxhdpi)

## Manual Resizing (if needed)

Use ImageMagick to resize:

```bash
# Install ImageMagick
brew install imagemagick  # macOS
# or: sudo apt install imagemagick  # Linux

# Generate iOS icons
convert app-icon.png -resize 40x40 icon-20@2x.png
convert app-icon.png -resize 60x60 icon-20@3x.png
convert app-icon.png -resize 58x58 icon-29@2x.png
convert app-icon.png -resize 87x87 icon-29@3x.png
convert app-icon.png -resize 80x80 icon-40@2x.png
convert app-icon.png -resize 120x120 icon-40@3x.png
convert app-icon.png -resize 120x120 icon-60@2x.png
convert app-icon.png -resize 180x180 icon-60@3x.png
convert app-icon.png -resize 76x76 icon-76.png
convert app-icon.png -resize 152x152 icon-76@2x.png
convert app-icon.png -resize 167x167 icon-83.5@2x.png

# Generate Android icons
convert app-icon.png -resize 48x48 ic_launcher_mdpi.png
convert app-icon.png -resize 72x72 ic_launcher_hdpi.png
convert app-icon.png -resize 96x96 ic_launcher_xhdpi.png
convert app-icon.png -resize 144x144 ic_launcher_xxhdpi.png
convert app-icon.png -resize 192x192 ic_launcher_xxxhdpi.png
```

## Adaptive Icons (Android)

For Android adaptive icons, you'll need:
1. Foreground layer (your logo/icon)
2. Background layer (solid color or pattern)

Create these in Android Studio:
1. Right-click `res` → New → Image Asset
2. Select "Launcher Icons (Adaptive and Legacy)"
3. Upload your icon and configure layers
