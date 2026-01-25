# App Store Screenshots

This folder contains promotional screenshots for iOS App Store and Google Play Store listings.

## Generated Screenshots

| File | Description | Use For |
|------|-------------|---------|
| `screenshot-1-gameplay.png` | Active gameplay with score | Main listing screenshot |
| `screenshot-2-victory.png` | Victory celebration screen | Feature highlight |
| `screenshot-3-multiplayer.png` | 2-player local mode | Multiplayer feature |
| `screenshot-4-ai-difficulty.png` | AI difficulty selection | AI feature showcase |
| `feature-graphic.png` | Banner graphic (1024x500) | Google Play feature graphic |

## Required Sizes

### iOS App Store Screenshots

| Device | Resolution | Required |
|--------|------------|----------|
| iPhone 6.7" | 1290 x 2796 | Yes |
| iPhone 6.5" | 1284 x 2778 | Yes |
| iPhone 5.5" | 1242 x 2208 | Optional |
| iPad Pro 12.9" | 2048 x 2732 | If supporting iPad |
| iPad Pro 11" | 1668 x 2388 | If supporting iPad |

### Google Play Store Screenshots

| Type | Resolution | Required |
|------|------------|----------|
| Phone | 1080 x 1920 (min) | Yes |
| 7" Tablet | 1200 x 1920 | If supporting tablets |
| 10" Tablet | 1920 x 1200 | If supporting tablets |
| Feature Graphic | 1024 x 500 | Yes |

## Resizing Screenshots

Use ImageMagick to resize for different devices:

```bash
# Install ImageMagick
brew install imagemagick  # macOS

# Resize for iPhone 6.7"
convert screenshot-1-gameplay.png -resize 1290x2796! screenshot-1-iphone67.png

# Resize for iPhone 6.5"
convert screenshot-1-gameplay.png -resize 1284x2778! screenshot-1-iphone65.png

# Resize for Google Play (already correct size)
# The generated screenshots are 1290x1920, which works for Play Store
```

## Screenshot Guidelines

### iOS App Store
- Maximum 10 screenshots per device size
- First 3 screenshots are most important (shown in search)
- Use portrait orientation for phones
- Include localized screenshots for each language

### Google Play Store
- Minimum 2 screenshots, maximum 8
- Feature graphic is required
- Screenshots should showcase key features
- Add promotional text overlays if desired

## Best Practices

1. **Show the game in action** - Not just menus
2. **Highlight key features** - AI, multiplayer, difficulty levels
3. **Use consistent branding** - Same color scheme as app
4. **Add captions** - Brief text explaining each screen
5. **Order strategically** - Best screenshots first

## Adding Text Overlays

For professional app store screenshots with text callouts, consider using:
- [Previewed](https://previewed.app/) - Device mockup generator
- [AppMockUp](https://app-mockup.com/) - Free screenshot frames
- [Shotsnapp](https://shotsnapp.com/) - Device frame mockups
- Figma/Canva - Custom text overlays

## Usage in Store Listings

1. Upload screenshots in the correct order in App Store Connect / Google Play Console
2. Ensure screenshots are localized if your app supports multiple languages
3. Update screenshots when you add major new features
4. A/B test different screenshot sets to optimize conversion
