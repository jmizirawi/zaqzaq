# Zaqzaq — Android Release Guide

Testing on emulators and publishing to the Google Play Store.

---

## 1. Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| macOS | 13+ (Ventura) | Build machine for Android |
| Android Studio | Latest stable | Includes SDK Manager & AVD Manager |
| Rust | stable | `rustup update stable` |
| Node.js | 18+ | |
| Tauri CLI | 2.x | Installed via `devDependencies` — no global install needed |

### One-time Rust target setup

```bash
# Android (all common ABIs)
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android i686-linux-android
```

### Environment variables

Add these to your shell profile (`~/.zshrc`) and restart your terminal (or run `source ~/.zshrc`):

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export NDK_HOME="$ANDROID_HOME/ndk/$(ls -1 $ANDROID_HOME/ndk | sort -V | tail -1)"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools"
```

> The NDK must be installed first: **Android Studio → Settings → SDK Tools → NDK (Side by side)**.

---

## 2. Preparation & Versioning

1. Open `src-tauri/tauri.conf.json`.
2. Increment the `"version"` string (e.g. `"0.0.4"` → `"0.0.5"`).
3. Tauri automatically syncs this to `versionName` (e.g. `0.0.5`) and `versionCode` (auto-calculated integer, e.g. `1000005`).

> `package.json` has its own `"version"` field that is **not** read by the mobile build pipeline — only `tauri.conf.json` controls the version shown in the Play Store.

### Verify your environment

```bash
npm install                # Ensure frontend deps are up to date
npm run build              # Verify the frontend production build passes
```

---

## 3. Testing on an Emulator

> For full dev environment setup (prerequisites, environment variables, emulator creation), see [DEV_SETUP.md](DEV_SETUP.md).

### Step 1: Create an emulator (if you don't have one)

1. Open **Android Studio → Tools → Device Manager**.
2. Click **Create Virtual Device**.
3. Choose a device profile (e.g., **Pixel 7**).
4. Select a system image — pick the latest stable API level (e.g., API 35, arm64).
   - If not already downloaded, click the **Download** link next to the image.
5. Click **Finish** to create the AVD.

### Step 2: Launch the emulator and wait for it to fully boot

Start it from Android Studio's **Device Manager**, or from the terminal:

```bash
# List available emulators
emulator -list-avds

# Launch one (replace with your AVD name)
emulator -avd Pixel_7_API_35
```

Wait until the home screen is visible and responsive, then verify adb can see it:

```bash
adb devices
# Expected: emulator-XXXX   device
```

> **Do not proceed until the status reads `device`** — not `offline` or `unauthorized`.

### Step 3: Run the app on the emulator

```bash
npm run android:dev
```

This script runs `adb reverse` to forward ports 1420 (Vite) and 1421 (HMR) from the emulator to your Mac, then launches the app. The manual `adb reverse` step is necessary because the Tauri CLI's automatic port forwarding is only reliable when the emulator is fully ready before the CLI starts — which isn't guaranteed. `adb reverse` must be re-run after any emulator cold boot; this script handles that automatically.

> If you have multiple emulators running, the Tauri CLI will prompt you to choose one.

> To target a specific emulator by name, pass it as an argument (use the AVD name from `emulator -list-avds`):
> ```bash
> npm run android:dev -- 'Pixel_7_API_35'
> ```

**Alternative: deploy via Android Studio**

If you prefer using Android Studio's debugger and logcat, pass `--open` instead:

```bash
npm run tauri android dev -- --open
```

This opens Android Studio with the project loaded. Run the app from there using the play button. Keep the terminal process alive — killing it closes the dev session.

### Step 4: Test

- Verify search works for Arabic and English queries.
- Open a topic and browse vocabulary.
- Save a word, verify it shows in the Library.
- Switch between light and dark themes.
- Rotate the device and check layout.

---

## 4. Building & Publishing to Google Play

### Step 1: Verify signing is configured

The release keystore is already set up:

- **Keystore file:** `zaqzaq-release-key.jks` (project root)
- **Signing config:** `src-tauri/gen/android/key.properties`

> ⚠️ Keep the `.jks` file safe — if you lose it, you cannot push updates to the same Play Store listing.

### Step 2: Build the release AAB

```bash
npm run android:build
```

> Use `npm run android:build` (not `npm run tauri android build` directly) — it runs the patch script first to ensure 16 KB page size support is in place.

The signed Android App Bundle will be at:

```
src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab
```

### Step 3: Verify 16 KB memory page size support

Google Play requires native libraries to be aligned to 16 KB page boundaries (mandatory for Android 15+ devices). Verify this before uploading:

```bash
~/Library/Android/sdk/ndk/$(ls ~/Library/Android/sdk/ndk | sort -V | tail -1)/toolchains/llvm/prebuilt/darwin-x86_64/bin/llvm-readelf \
  -l src-tauri/gen/android/app/build/intermediates/merged_native_libs/universalRelease/mergeUniversalReleaseNativeLibs/out/lib/arm64-v8a/libzaqzaq_lib.so \
  | grep LOAD
```

All `Align` values must be `0x4000`. If any show `0x1000`, the linker flags aren't being applied — clean the Rust build cache and rebuild:

```bash
cargo clean --manifest-path src-tauri/Cargo.toml
npm run android:build
```

> **Root cause reminder:** the 16 KB fix depends on `.cargo/config.toml` existing at the **project root** (not just `src-tauri/.cargo/`). The `scripts/patch-android.sh` script creates this automatically. If you ever re-initialize the Android project with `tauri android init`, run `npm run android:patch` to restore all fixes.

### Step 4: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console).
2. Select the **Zaqzaq** app (or create a new app if this is the first release).
3. Navigate to **Release → Production** (or **Internal Testing** / **Closed Testing** for a test run first).
4. Click **Create new release**.
5. Upload the `.aab` file.
6. Add release notes describing what changed in this version.
7. Click **Review release → Start rollout to Production**.

### Google Play first-time checklist

If this is your first submission, you'll also need:

- [ ] **Store listing**: App title, short/full description, screenshots (phone + tablet).
- [ ] **Content rating**: Complete the IARC questionnaire.
- [ ] **Privacy policy**: URL to your privacy policy page.
- [ ] **App category**: Education → Language / Dictionary.
- [ ] **Target audience**: Declare age groups.
- [ ] **Data safety form**: Declare what user data the app collects (Zaqzaq stores data locally only).

---

## 5. Troubleshooting

### General

| Problem | Solution |
|---------|----------|
| `npm run build` fails | Check TypeScript errors: `npx vue-tsc --noEmit` |
| DB schema changes | Replace `src-tauri/resources/arabic-dictionary.db` with the updated file |
| Stale frontend assets | Run `npm run build` before mobile builds |

### Android

| Problem | Solution |
|---------|----------|
| Blank screen / `Failed to request http://127.0.0.1:1420/` | Emulator can't reach the Mac dev server. Use `npm run android:dev` which runs `adb reverse` automatically |
| `adb reverse` fails with `no devices/emulators found` | Emulator not fully booted — wait for the home screen, check `adb devices` shows `device`, then retry |
| `NDK_HOME` not found | Install the NDK via **Android Studio → Settings → SDK Tools → NDK (Side by side)** |
| Signing error on build | Verify `src-tauri/gen/android/key.properties` has the correct paths and passwords |
| Play Console: "does not support 16 KB memory page sizes" | Run `cargo clean --manifest-path src-tauri/Cargo.toml`, then `npm run android:build`. Verify with `llvm-readelf` (see § 4 Step 3) — all `Align` values must be `0x4000`. Also confirm `.cargo/config.toml` exists at the project root. |
| Emulator won't boot | Try a different system image, or wipe data in AVD Manager |
| `JAVA_HOME` error | Point it at Android Studio's bundled JBR (see § 1) |
