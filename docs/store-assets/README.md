# Zaqzaq – App Store Assets

All store assets (screenshots, feature graphic, icons) live in this directory.

```
docs/store-assets/
├── feature-graphic.html        ← Google Play feature graphic (1024×500)
├── screenshot-frame.html       ← Framing tool for promotional screenshots
├── android/
│   ├── feature-graphic.png     ← export from feature-graphic.html
│   └── screenshots/            ← raw + framed phone screenshots
└── apple/
    ├── iphone/                 ← iPhone screenshots (6.9" primary, 6.5" secondary)
    └── ipad/                   ← iPad 12.9" screenshots
```

---

## Required assets checklist

### Google Play Store
| Asset | Size | Format | Status |
|---|---|---|---|
| Feature graphic | 1024 × 500 | PNG/JPG | use `feature-graphic.html` |
| Hi-res icon | 512 × 512 | PNG (no alpha) | already in `src-tauri/icons/` |
| Phone screenshots (×2–8) | 9:16 ratio, min 320px | PNG/JPG | capture from emulator |
| 7" tablet screenshots | optional | PNG/JPG | |
| 10" tablet screenshots | optional | PNG/JPG | |

### Apple App Store Connect
| Asset | Dimensions | Format | Status |
|---|---|---|---|
| iPhone 6.9" screenshots (×1–10) | 1290×2796 or 1320×2868 | PNG/JPG | required |
| iPhone 6.5" screenshots (×1–10) | 1284×2778 or 1242×2688 | PNG/JPG | required if no 6.9" |
| iPad 12.9" screenshots (×1–10) | 2048×2732 | PNG/JPG | required if iPad supported |

> Apple requires at least **1 screenshot per required device class** before submission.

---

## Step 1 – Capture raw screenshots

### iOS Simulator
```bash
# Start the iOS app
npm run ios

# List available simulators
xcrun simctl list devices

# Screenshot the booted simulator (saves to ~/Desktop by default)
xcrun simctl io booted screenshot ~/Desktop/zaqzaq-01-search.png

# Or use the Simulator menu: File › Save Screen (Cmd+S)
```

Recommended simulator sizes:
- **iPhone 16 Pro Max** → covers the 6.9" requirement (1320×2868)
- **iPhone 11 Pro Max** → covers the 6.5" requirement (1284×2778)
- **iPad Pro 12.9-inch (6th generation)** → covers iPad requirement

### Android Emulator
```bash
# Start the Android app
npm run android

# Screenshot via adb (device must be booted)
adb shell screencap -p /sdcard/zaqzaq-01-search.png
adb pull /sdcard/zaqzaq-01-search.png ~/Desktop/

# Or use Android Studio: emulator toolbar › Camera icon
```

---

## Step 2 – Suggested screenshot sequence

Capture these 5 screens on each device/simulator:

| # | Screen | How to reach |
|---|---|---|
| 1 | Search — empty / home | Launch the app |
| 2 | Search — results | Type "bread" or "خبز" |
| 3 | Topics browse | Tap the Topics tab |
| 4 | Topic detail | Tap any topic card |
| 5 | Collections | Tap the Collections tab |

---

## Step 3 – Create framed promotional screenshots

Open `screenshot-frame.html` in Chrome, load each raw screenshot using the file picker,
set the headline and caption for that screen, then export:

```bash
# Using shot-scraper (pip install shot-scraper)
shot-scraper screenshot-frame.html \
  -w 1290 -h 2796 \
  -o apple/iphone/01-search.png

# Using capture-website-cli (npx)
npx capture-website screenshot-frame.html \
  --width=1290 --height=2796 \
  --output=apple/iphone/01-search.png
```

---

## Step 4 – Export the feature graphic

```bash
# Using shot-scraper
shot-scraper feature-graphic.html \
  -w 1024 -h 500 \
  -o android/feature-graphic.png

# Using capture-website-cli
npx capture-website feature-graphic.html \
  --width=1024 --height=500 \
  --output=android/feature-graphic.png
```

Or in Chrome DevTools:
1. Open `feature-graphic.html`
2. Open DevTools → Device Toolbar (Cmd+Shift+M)
3. Set custom dimensions to **1024 × 500**
4. Cmd+Shift+P → "Capture screenshot"

---

## Store listing copy

**App name:** Zaqzaq – Palestinian Arabic
**Subtitle (Apple, 30 chars):** Colloquial Arabic Dictionary
**Short description (Google Play, 80 chars):** Learn Palestinian colloquial Arabic with an open bilingual dictionary.

**Full description:**
> Zaqzaq (زَقْزَق) is a colloquial Palestinian Arabic dictionary built on Maknuune, an open Palestinian Arabic lexicon.
>
> **Features**
> - Search in English or Arabic — find words from either direction
> - Browse by topic — everyday vocabulary organised into categories
> - Save words — bookmark entries for later review
> - Build collections — organise saved words into your own themed sets
> - Works fully offline — no internet connection needed after install
>
> Word data is sourced from the Maknuune open Palestinian Arabic lexicon.

**Keywords (Apple, 100 chars):** arabic,palestinian,dictionary,colloquial,dialect,language,amiyya,darija,bilingual,vocabulary

**Category:** Education
**Age rating:** 4+ / Everyone
**Privacy:** No data collected; all data stored locally on device.
