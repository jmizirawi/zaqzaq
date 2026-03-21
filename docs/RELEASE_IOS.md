# Zaqzaq — iOS Release Guide

Testing on simulators and publishing to the Apple App Store.

---

## 1. Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| macOS | 13+ (Ventura) | Required for iOS builds |
| Xcode | 15+ | Install from the Mac App Store |
| Xcode Command-Line Tools | — | `xcode-select --install` |
| Rust | stable | `rustup update stable` |
| Node.js | 18+ | |
| Tauri CLI | 2.x | Installed via `devDependencies` — no global install needed |

### One-time Rust target setup

```bash
# iOS simulator (Apple Silicon mac)
rustup target add aarch64-apple-ios-sim

# iOS device
rustup target add aarch64-apple-ios
```

---

## 2. Preparation & Versioning

1. Open `src-tauri/tauri.conf.json`.
2. Increment the `"version"` string (e.g. `"0.0.4"` → `"0.0.5"`).
3. Tauri automatically syncs this to `CFBundleShortVersionString` and `CFBundleVersion`.

> `package.json` has its own `"version"` field that is **not** read by the mobile build pipeline — only `tauri.conf.json` controls the version shown in the App Store.

### Verify your environment

```bash
npm install                # Ensure frontend deps are up to date
npm run build              # Verify the frontend production build passes
```

---

## 3. Testing on a Simulator

Unlike Android, the iOS simulator runs as a process on your Mac and shares the host's network stack. It can reach `localhost:1420` directly — **no port forwarding needed**.

### Step 1: Run the app on the simulator

```bash
npm run tauri ios dev
```

Tauri will auto-select a booted simulator, or boot one if none is running. On first run, Rust compiles the `aarch64-apple-ios-sim` target — this takes several minutes but is cached on subsequent runs.

> To target a specific simulator by name:
> ```bash
> npm run tauri ios dev -- 'iPhone 16'
> ```

> To list available simulators:
> ```bash
> xcrun simctl list devices available
> ```

**Alternative: deploy via Xcode**

```bash
npm run tauri ios dev -- --open
```

Opens Xcode with the project. Run and debug from there. Keep the terminal process alive.

### Step 2: Test

- Verify search works for Arabic and English queries.
- Open a topic and browse vocabulary.
- Save a word, verify it shows in the Library.
- Switch between light and dark themes.
- Rotate the device and check layout.
- Test swipe-back gesture navigation.
- Check that the app fills the screen correctly with safe area insets (notch / Dynamic Island).

---

## 4. Building & Publishing to the App Store

### Step 1: Accept Apple Developer contracts (if prompted)

Before your first release (or after Apple updates their agreements), you may need to accept contracts in App Store Connect:

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com).
2. Accept any pending agreements shown in the banner, or go to **Agreements, Tax, and Banking**.
3. The Account Holder role is required to accept contracts.

Skipping this causes a 403 error when uploading via Transporter.

### Step 2: Ensure a Distribution Certificate exists (one-time setup)

You need an **Apple Distribution** certificate installed in your Keychain (separate from the Apple Development cert):

1. Go to [developer.apple.com → Certificates, IDs & Profiles](https://developer.apple.com/account/resources/certificates/list).
2. Check if an **Apple Distribution** certificate exists and is not expired.
3. If not, click **+** → select **Apple Distribution** → follow the CSR flow:
   - Open **Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority**
   - Enter your Apple ID email, select **Saved to disk**, save the `.certSigningRequest` file
   - Upload it in the developer portal, download the resulting `.cer` file, double-click to install
4. Create an **App Store** distribution provisioning profile (Profiles → + → App Store Connect) using the distribution cert, then download and double-click to install.

### Step 3: Configure signing in Xcode (one-time setup)

Signing must be configured in Xcode once. After that it is saved in the project file and you won't need to open Xcode again for future releases.

1. Open the project: `open src-tauri/gen/apple/zaqzaq.xcodeproj`
2. Select the **zaqzaq_iOS** target in the project navigator.
3. Go to the **Signing & Capabilities** tab.
4. Ensure:
   - **Automatically manage signing** is checked.
   - **Team** is set to your Apple Developer team.
   - **Bundle Identifier** is `com.zaqzaq-palestinian-dictionary.app`.
5. **Important:** Do NOT manually change **Code Signing Identity** in the Build Settings tab. Leave it at the default (`Apple Development`). Xcode's automatic signing handles switching to the distribution cert during export — overriding it manually causes conflicts.
6. Close Xcode.

> **Do not archive from Xcode directly** (`Product → Archive`). Tauri's Xcode build script requires the Tauri CLI to be running alongside it (it needs a WebSocket server). Archiving from Xcode alone will fail with a "Connection refused" panic.

### Step 4: Build the release IPA

```bash
npm run tauri ios build -- --export-method app-store-connect
```

The `--export-method app-store-connect` flag is required. Without it, the export defaults to development signing and Transporter will reject the IPA with a "Missing code-signing certificate" error.

This compiles the Rust core for `aarch64-apple-ios`, builds the frontend, archives the app, and exports a distribution-signed `.ipa`. The file will be at:

```
src-tauri/gen/apple/build/arm64/zaqzaq.ipa
```

> On first run, Rust compiles the entire dependency tree — this takes several minutes but is cached on subsequent runs.

### Step 5: Upload via Transporter

1. Install **Transporter** from the [Mac App Store](https://apps.apple.com/us/app/transporter/id1450874784) if you haven't already.
2. Open Transporter and sign in with your Apple ID.
3. Click **+** (or drag the `.ipa` into the window).
4. Select `src-tauri/gen/apple/build/arm64/zaqzaq.ipa`.
5. Click **Deliver**.
6. Wait for Transporter to finish — it will show a success message and Apple will send a confirmation email when the build finishes processing (usually a few minutes).

### Step 6: Submit for review on App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com).
2. Select the **Zaqzaq** app.
3. Under **App Store → iOS App**, click **+** next to the version or create a new version if needed.
4. Fill in:
   - **What's New in This Version** (release notes).
   - Screenshots for each required device size (6.7", 6.5", 5.5" — and optionally iPad).
   - App description, keywords, support URL, etc. (first release only).
5. Scroll to the **Build** section and click **Select a Build** — choose the build you just uploaded.
6. Complete the **App Review Information** section (contact info, demo account if needed).
7. Click **Add for Review → Submit to App Review**.

### App Store first-time checklist

If this is your first submission, you'll also need:

- [ ] **App Store listing**: Name, subtitle, description, keywords, screenshots, and promotional text.
- [ ] **App Privacy**: Declare data collection practices in App Store Connect → App Privacy.
- [ ] **Age Rating**: Complete the age rating questionnaire.
- [ ] **Pricing**: Set the app price (or Free).
- [ ] **App Review Information**: Contact info + notes for the reviewer.

---

## 5. Troubleshooting

### General

| Problem | Solution |
|---------|----------|
| `npm run build` fails | Check TypeScript errors: `npx vue-tsc --noEmit` |
| DB schema changes | Replace `src-tauri/resources/arabic-dictionary.db` with the updated file |
| Stale frontend assets | Run `npm run build` before mobile builds |

### iOS

| Problem | Solution |
|---------|----------|
| Code signing error | Open **Xcode → Settings → Accounts**, add your Apple ID, then re-select the team in **Signing & Capabilities** and close Xcode |
| `npm run tauri ios build` fails with signing error | Ensure the Xcode signing setup (Step 3) has been completed and the team is saved in the project file |
| IPA not found at expected path | Check `src-tauri/gen/apple/build/arm64/` — the filename matches the app name. If empty, check build output for errors |
| Transporter: "package is invalid" | Rebuild the IPA — the previous export may be corrupted or unsigned |
| Transporter: "No suitable application records were found" | The bundle ID in the IPA doesn't match any app in App Store Connect. Verify `com.zaqzaq-palestinian-dictionary.app` is registered |
| Transporter: 403 "You do not have required contracts" | Accept pending agreements in App Store Connect (see Step 1). Requires Account Holder role |
| Transporter: "Missing code-signing certificate" | The IPA was exported with a development cert. Rebuild using `npm run tauri ios build -- --export-method app-store-connect` |
| Build fails: "Connection refused" (WebSocket panic) | You archived directly from Xcode instead of using the Tauri CLI. Always use `npm run tauri ios build -- --export-method app-store-connect` |
| Export fails: "requires a provisioning profile" | Automatic signing was turned off and the export options lacked a profile. Turn **Automatically manage signing** back on in Xcode |
| Xcode warning: "conflicting provisioning settings" | Automatic signing is on but Code Signing Identity was manually set in Build Settings. Reset it to `Apple Development` (Automatic Certificate Selectors) in Build Settings, or just leave Build Settings alone and only configure signing in the Signing & Capabilities tab |
| Simulator missing | Run `xcode-select --install`, then restart the terminal |
| Slow first build | Normal — Rust compiles the entire dependency tree on the first run |
| `No such module 'Tauri'` | Run `npm run tauri ios dev` at least once to generate the Swift package files |
| Testing on a physical iOS device | Run `npm run tauri ios dev -- --host`; the CLI sets `TAURI_DEV_HOST` to your Mac's LAN IP and the device connects over Wi-Fi. For a direct secure tunnel instead of exposing the dev server on your LAN, use `--force-ip-prompt` and select the IPv6 address ending in `::2` |
| `iOS X.X is not installed` | The connected device is running an iOS version whose SDK isn't in Xcode yet. Open **Xcode → Settings → Components** and download the matching iOS platform |
| `developer disk image could not be mounted` | Open Xcode directly with the device connected — Xcode will install developer support files automatically. Also check **Settings → VPN & Device Management** on the device to trust the developer certificate |
