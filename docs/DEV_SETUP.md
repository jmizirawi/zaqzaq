# Zaqzaq — Development Environment Setup

How to run the app locally on desktop, Android emulator, or iOS simulator.

---

## Quick Reference

| Target | Command | Notes |
|--------|---------|-------|
| Desktop (macOS/Windows/Linux) | `npm run dev:desktop` | Opens a native window with HMR |
| Android emulator | `npm run dev:android` | Patches gradle, forwards ports, launches app |
| iOS simulator | `npm run dev:ios-sim` | Clears stale ports, targets iPhone 15 Pro simulator |
| Frontend only (browser) | `npm run dev` | Vite dev server at `http://localhost:1420` — no Tauri APIs |

> All `dev:*` commands start Vite automatically — you do not need to run `npm run dev` separately.

---

## Shared Prerequisites

| Tool | Minimum version | Install |
|------|----------------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Rust | stable | `rustup update stable` |
| Tauri CLI | 2.x | Already in `devDependencies` — no global install needed |

```bash
# Install frontend dependencies (run once, or after pulling new changes)
npm install
```

---

## 1. Desktop

No extra setup required beyond the shared prerequisites.

```bash
npm run dev:desktop
```

This starts the Vite dev server and opens the app in a native window. Frontend changes hot-reload instantly. Rust changes trigger a recompile (~5s incremental).

> To pass extra flags to the Tauri CLI:
> ```bash
> npm run dev:desktop -- --verbose
> ```

---

## 2. Android Emulator

### One-time setup

1. **Install Android Studio** (latest stable) — includes SDK Manager and AVD Manager.

2. **Install the NDK:** Android Studio → Settings → SDK Tools → check **NDK (Side by side)** → Apply.

3. **Add environment variables** to `~/.zshrc` (restart terminal or `source ~/.zshrc` after):

   ```bash
   export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export NDK_HOME="$ANDROID_HOME/ndk/$(ls -1 $ANDROID_HOME/ndk | sort -V | tail -1)"
   export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools"
   ```

4. **Add Rust targets** for Android:

   ```bash
   rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android i686-linux-android
   ```

5. **Create an emulator:**
   - Android Studio → Tools → Device Manager → Create Virtual Device.
   - Pick a device (e.g. **Pixel 7**) and a system image (e.g. API 35, arm64).
   - Click Finish.

### Running the app

1. **Boot the emulator** from Android Studio's Device Manager, or:

   ```bash
   # List emulators
   emulator -list-avds

   # Boot one
   emulator -avd Pixel_7_API_35
   ```

   Wait until the home screen is visible, then verify:

   ```bash
   adb devices
   # Should show: emulator-XXXX   device
   ```

   > Do not proceed until the status reads `device` — not `offline` or `unauthorized`.

2. **Launch the app:**

   ```bash
   npm run dev:android
   ```

   This script automatically:
   - Applies the 16 KB page-size gradle patch (required for Android 15+).
   - Runs `adb reverse` to forward ports 1420/1421 from the emulator to your Mac.
   - Starts the Vite dev server and builds/installs the app.

   > First run compiles the full Rust dependency tree — this takes several minutes but is cached afterward.

   > To target a specific emulator: `npm run dev:android -- 'Pixel_7_API_35'`

3. **Alternative — open in Android Studio** (for logcat/debugger):

   ```bash
   npm run tauri android dev -- --open
   ```

   Run the app from Android Studio's play button. Keep the terminal process alive.

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank screen / `Failed to request http://127.0.0.1:1420/` | Emulator can't reach the dev server. Re-run `npm run dev:android` (it re-does `adb reverse`) |
| `adb reverse` fails: `no devices/emulators found` | Emulator not booted — wait for the home screen, verify `adb devices` shows `device` |
| `NDK_HOME` not found | Install NDK via Android Studio → Settings → SDK Tools → NDK (Side by side) |
| `JAVA_HOME` error | Point it at Android Studio's bundled JBR (see env vars above) |
| Emulator won't boot | Try a different system image, or wipe data in AVD Manager |
| Build hangs on first run | Normal — Rust is compiling the full dependency tree. Subsequent runs are fast |

---

## 3. iOS Simulator

### One-time setup

1. **Install Xcode** (15+) from the Mac App Store.

2. **Install Command-Line Tools:**

   ```bash
   xcode-select --install
   ```

3. **Add Rust targets** for iOS:

   ```bash
   # Simulator (Apple Silicon)
   rustup target add aarch64-apple-ios-sim

   # Physical device (needed later for release builds)
   rustup target add aarch64-apple-ios
   ```

### Running the app

```bash
npm run dev:ios-sim
```

This is the recommended way to launch on the simulator. The script automatically:
- Kills any stale Vite processes holding ports 1420/1421 (a common cause of build failures).
- Targets the **iPhone 15 Pro** simulator by name, bypassing any connected physical device.

The iOS simulator shares your Mac's network stack — no port forwarding needed.

> First run compiles the `aarch64-apple-ios-sim` Rust target — several minutes, cached afterward.

> To target a different simulator, use `dev:ios` with the device name:
> ```bash
> npx tauri ios dev 'iPhone SE (3rd generation)'
> ```

> To list available simulators:
> ```bash
> xcrun simctl list devices available
> ```

**Alternative — open in Xcode** (for breakpoints/debugger):

```bash
npm run tauri ios dev -- --open
```

Run from Xcode's play button. Keep the terminal process alive.

### Testing on a physical device

```bash
npm run dev:ios -- --host
```

The CLI sets `TAURI_DEV_HOST` to your Mac's LAN IP and the device connects over Wi-Fi.

> For a direct tunnel instead of exposing the dev server on LAN, use `--force-ip-prompt` and select the IPv6 address ending in `::2`.

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `Port 1420 is already in use` | A stale Vite process is blocking the port. Use `npm run dev:ios-sim` (it auto-kills stale processes), or manually run `lsof -i :1420 -t \| xargs kill` |
| Build fails: "Connection refused" (WebSocket panic) | The Vite dev server failed to start (usually a port conflict), which killed the parent Tauri process before Xcode's build script could connect. Fix the port issue and retry |
| Physical device detected instead of simulator | A connected iPhone takes priority over simulators. Use `npm run dev:ios-sim` to force the simulator, or disconnect the phone |
| `No such module 'Tauri'` | Run `npm run dev:ios-sim` at least once to generate Swift package files |
| Simulator missing | Run `xcode-select --install`, then restart the terminal |
| Slow first build | Normal — full Rust dependency compilation. Subsequent runs are fast |
| `iOS X.X is not installed` | Open Xcode → Settings → Components and download the matching iOS platform |

---

## Common Issues (All Platforms)

| Problem | Solution |
|---------|----------|
| `npm run build` fails | Check TypeScript errors: `npx vue-tsc --noEmit` |
| Port 1420 already in use | Kill the stale Vite process: `lsof -ti:1420 \| xargs kill` |
| Rust compile errors after updating deps | Run `cargo clean --manifest-path src-tauri/Cargo.toml` and rebuild |
| DB schema changes | Replace `src-tauri/resources/arabic-dictionary.db` with the updated file |

---

## NPM Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server only (no native window) — for frontend work in a browser |
| `npm run dev:desktop` | Full Tauri desktop app with HMR |
| `npm run dev:android` | Android emulator with port forwarding and gradle patches |
| `npm run dev:ios` | iOS — auto-detects device or simulator |
| `npm run dev:ios-sim` | iOS simulator (kills stale ports, targets iPhone 15 Pro) |
| `npm run build` | TypeScript check + Vite production build |
| `npm run android:build` | Android release AAB (with patches) |
| `npm run test` | Run Vitest in watch mode |
