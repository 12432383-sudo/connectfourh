# App Store Screenshots

This folder contains promotional screenshots for iOS App Store and Google Play Store listings.

## Screenshot Assets

### iOS App Store (iPhone 16 Pro Max)

| File | Description | Text Overlay |
|------|-------------|--------------|
| `appstore-1-gameplay.png` | Active gameplay with score | "Classic Strategy Fun" |
| `appstore-2-victory.png` | Victory celebration screen | "Connect 4 to Win!" |
| `appstore-3-multiplayer.png` | 2-player local mode | "Play with Friends" |
| `appstore-4-ai.png` | AI difficulty selection | "Challenge Smart AI" |

### Google Play Store (Android)

| File | Description | Text Overlay |
|------|-------------|--------------|
| `android-1-gameplay.png` | Active gameplay with score | "Classic Strategy Fun" |
| `android-2-victory.png` | Victory celebration screen | "Connect 4 to Win!" |
| `android-3-multiplayer.png` | 2-player local mode | "Play with Friends" |
| `android-4-ai.png` | AI difficulty selection | "Challenge Smart AI" |
| `feature-graphic.png` | Banner graphic (1024x500) | "CONNECT 4 - Classic Strategy Fun" |

### Raw Screenshots (No Device Frame)

| File | Description |
|------|-------------|
| `screenshot-1-gameplay.png` | Raw gameplay screenshot |
| `screenshot-2-victory.png` | Raw victory screen |
| `screenshot-3-multiplayer.png` | Raw multiplayer mode |
| `screenshot-4-ai-difficulty.png` | Raw AI difficulty screen |

## Required Sizes

### iOS App Store Screenshots

| Device | Resolution | Files to Use |
|--------|------------|--------------|
| iPhone 6.7" (Pro Max) | 1290 x 2796 | `appstore-*.png` |
| iPhone 6.5" | 1284 x 2778 | Resize from appstore files |
| iPhone 5.5" | 1242 x 2208 | Resize from appstore files |

### Google Play Store Screenshots

| Type | Resolution | Files to Use |
|------|------------|--------------|
| Phone | 1080 x 1920 | `android-*.png` |
| Feature Graphic | 1024 x 500 | `feature-graphic.png` |

## Upload Instructions

### iOS App Store Connect

1. Go to App Store Connect → Your App → App Information
2. Navigate to the Screenshots section
3. Upload `appstore-1-gameplay.png` through `appstore-4-ai.png`
4. Arrange in order: Gameplay → Victory → Multiplayer → AI

### Google Play Console

1. Go to Google Play Console → Your App → Store Presence → Main store listing
2. Upload `android-1-gameplay.png` through `android-4-ai.png` as Phone screenshots
3. Upload `feature-graphic.png` as the Feature graphic
4. Arrange screenshots in the same order as iOS

## Screenshot Guidelines

### Best Practices
- First 3 screenshots are most important (shown in search results)
- Show the game in action, not just menus
- Highlight key features: AI, multiplayer, difficulty levels
- Use consistent branding across all screenshots

### Localization
- Create localized versions for each supported language
- Update text overlays to match the target language
- Keep the same visual style and device frames

## Resizing Screenshots

Use ImageMagick to resize for different devices:

```bash
# Install ImageMagick
brew install imagemagick  # macOS

# Resize iOS for iPhone 6.5"
convert appstore-1-gameplay.png -resize 1284x2778! appstore-1-iphone65.png

# Resize iOS for iPhone 5.5"
convert appstore-1-gameplay.png -resize 1242x2208! appstore-1-iphone55.png
```

## File Checklist

Before submitting to app stores, ensure you have:

- [ ] 4 iOS screenshots with device frames
- [ ] 4 Android screenshots with device frames  
- [ ] 1 Feature graphic (1024x500)
- [ ] Screenshots resized for all required device sizes
- [ ] Localized versions (if supporting multiple languages)
