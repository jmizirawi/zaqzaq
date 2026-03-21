# Zaqzaq — Release Guide

Platform-specific release guides:

| Platform | Guide |
|----------|-------|
| Android (Google Play) | [RELEASE_ANDROID.md](RELEASE_ANDROID.md) |
| iOS (Apple App Store) | [RELEASE_IOS.md](RELEASE_IOS.md) |
| Windows (Microsoft Store) | [RELEASE_WINDOWS.md](RELEASE_WINDOWS.md) |

---

## Versioning

All platforms share the same version source: `src-tauri/tauri.conf.json`.

1. Open `src-tauri/tauri.conf.json`.
2. Increment the `"version"` string (e.g. `"0.0.4"` → `"0.0.5"`).
3. Rebuild for the target platform — Tauri syncs the version to all store metadata automatically.

> `package.json` has its own `"version"` field that is **not** read by the build pipeline — only `tauri.conf.json` controls the version shown in the stores.

## Pre-build checklist (all platforms)

```bash
npm install        # Ensure frontend deps are up to date
npm run build      # Verify the frontend production build passes
```
