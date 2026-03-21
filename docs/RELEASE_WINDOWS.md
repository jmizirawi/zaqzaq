# Zaqzaq — Windows Release Guide

Testing locally and publishing to the Microsoft Store.

> Windows builds must run on a Windows machine. Use a physical Windows PC, a Windows VM (Parallels, VMware, or UTM on Apple Silicon), or a Windows-based CI runner.

---

## 1. Prerequisites

| Tool | Notes |
|------|-------|
| Windows | 10 (1903+) or 11 |
| Visual Studio 2022 | Select the **Desktop development with C++** workload (includes MSVC and Windows SDK) |
| Rust (stable) | Install via [rustup.rs](https://rustup.rs). Accept the default MSVC toolchain. |
| Node.js 18+ | |
| WebView2 Runtime | Pre-installed on Windows 11; download from Microsoft for Windows 10 if missing |
| Tauri CLI 2.x | Installed via `devDependencies` — no global install needed |

### One-time Rust target setup

```powershell
rustup target add x86_64-pc-windows-msvc    # 64-bit Intel/AMD (required)
rustup target add aarch64-pc-windows-msvc   # ARM64 (optional)
```

---

## 2. Preparation & Versioning

1. Open `src-tauri/tauri.conf.json`.
2. Increment the `"version"` string (e.g. `"0.0.4"` → `"0.0.5"`).
3. The Microsoft Store rejects packages with a version number equal to or lower than the current live version — always bump before building a submission.

> `package.json` has its own `"version"` field that is **not** used by the Tauri build pipeline — only `tauri.conf.json` controls the version embedded in the MSIX.

### Verify your environment

```powershell
npm install                # Ensure frontend deps are up to date
npm run build              # Verify the frontend production build passes
```

---

## 3. Testing Locally

### Step 1: Run the app in development mode

```powershell
npm run tauri dev
```

Tauri compiles the Rust core, starts the Vite dev server, and opens the app in a native WebView2 window. Hot-reload is active — frontend changes apply instantly without a full rebuild.

### Step 2: Test

- Verify search works for Arabic and English queries.
- Open a topic and browse vocabulary.
- Save a word, verify it shows in the Library.
- Switch between light and dark themes.
- Resize the window and check layout at different sizes.
- Test keyboard navigation (Tab, Enter, Escape).
- Right-click and verify no unwanted context menu appears.

---

## 4. Building & Publishing to the Microsoft Store

### Step 1: Register on Microsoft Partner Center

1. Go to [partner.microsoft.com/dashboard](https://partner.microsoft.com/dashboard).
2. Sign in with a Microsoft account. If you don't have a developer account, enroll in the **Windows & Xbox** program and pay the one-time registration fee (~$19 USD for individuals).
3. Go to **Windows & Xbox → Overview → + New product → App**.
4. Enter the app name **Zaqzaq** and click **Reserve product name**.

### Step 2: Get your Package Identity from Partner Center

Microsoft assigns a unique identity to your app that must be embedded in the MSIX package. Mismatched values will cause Partner Center to reject the upload.

1. In Partner Center, open the **Zaqzaq** app page.
2. Go to **Product management → App identity**.
3. Note the three values:
   - **Package/Identity/Name** (e.g. `12345.Zaqzaq`)
   - **Package/Identity/Publisher** (e.g. `CN=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`)
   - **Package/Properties/PublisherDisplayName** (your display name)

### Step 3: Configure the MSIX package identity

Open `src-tauri/tauri.conf.json` and add or update the `bundle` section to target MSIX and embed the identity values from Partner Center:

```json
"bundle": {
  "targets": ["msix"],
  "publisher": "Your Publisher Display Name",
  "windows": {
    "packageIdentityName": "12345.Zaqzaq",
    "publisherDisplayName": "Your Publisher Display Name"
  }
}
```

> Replace these values exactly with what Partner Center shows on the **App identity** page. The `packageIdentityName` and publisher CN must match precisely — even a trailing space will cause the upload to fail.

### Step 4: Obtain a code-signing certificate

MSIX packages must be signed to be installable locally and uploadable to the Store. For Store distribution, Microsoft re-signs the package after certification — but you still need to sign it to produce a structurally valid MSIX.

**Option A: EV or standard code-signing certificate (recommended for production)**

Purchase a certificate from a trusted CA such as DigiCert or Sectigo. Install it in the Windows certificate store, then set the thumbprint in `tauri.conf.json`:

```json
"bundle": {
  "windows": {
    "certificateThumbprint": "PASTE_YOUR_CERT_THUMBPRINT_HERE",
    "digestAlgorithm": "sha256",
    "timestampUrl": "http://timestamp.digicert.com"
  }
}
```

**Option B: Self-signed certificate (local testing only)**

```powershell
# Run in PowerShell as Administrator
# Replace the Subject CN with your Publisher ID from Partner Center
$cert = New-SelfSignedCertificate `
  -Type Custom `
  -Subject "CN=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" `
  -KeyUsage DigitalSignature `
  -FriendlyName "Zaqzaq Dev Cert" `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3","2.5.29.19={text}")

# Print the thumbprint — paste it into tauri.conf.json
$cert.Thumbprint
```

> Self-signed packages are not trusted by other machines. Use Option A before submitting to the Store.

### Step 5: Build the MSIX package

From the project root on the Windows machine:

```powershell
# x64 (required)
npm run tauri build -- --target x86_64-pc-windows-msvc --bundles msix

# ARM64 (optional — for ARM Windows devices like Surface Pro X)
npm run tauri build -- --target aarch64-pc-windows-msvc --bundles msix
```

The signed MSIX files will be at:

```
src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msix/zaqzaq_X.X.X_x64.msix
src-tauri/target/aarch64-pc-windows-msvc/release/bundle/msix/zaqzaq_X.X.X_arm64.msix
```

> If you build both architectures, upload both packages in the same Partner Center submission — the Store serves the correct one per device.

### Step 6: Sideload and test the MSIX locally

Verify the package installs and runs correctly before submitting to the Store.

1. Enable Developer Mode: **Settings → System → For developers → Developer Mode: On**.
2. Install the package (PowerShell, run as Administrator):

```powershell
Add-AppxPackage -Path "path\to\zaqzaq_X.X.X_x64.msix"
```

3. Launch **Zaqzaq** from the Start menu and run the full test checklist from Section 3 Step 2.
4. Verify the app tile, icon, and display name look correct in the Start menu.

To uninstall after testing:

```powershell
Get-AppxPackage *zaqzaq* | Remove-AppxPackage
```

> If installation fails with "error 0x800B0109" (certificate not trusted), your self-signed cert isn't in the Trusted Root store. For local testing only: `Import-Certificate -FilePath cert.cer -CertStoreLocation Cert:\LocalMachine\Root`

### Step 7: Upload to Microsoft Partner Center

1. Go to [partner.microsoft.com/dashboard](https://partner.microsoft.com/dashboard) and open the **Zaqzaq** app.
2. Click **Start your submission** (first release) or **+ New submission** (updates).
3. Work through each section of the submission form:

   **Pricing and availability**
   - Set price to **Free**.
   - Select markets — start with all markets or limit to specific regions.

   **App properties**
   - Category: **Education**.
   - Subcategory: **Reference**.
   - System requirements: leave defaults (WebView2 is bundled by the MSIX).

   **Age ratings**
   - Complete the IARC questionnaire. Zaqzaq is a dictionary app — it should qualify for an "Everyone" or equivalent rating.

   **Store listing** (complete for each language you support)
   - **Description**: 150–10,000 characters.
   - **Screenshots**: At least one desktop screenshot at 1366×768 or larger (PNG or JPEG).
   - **Short description**: Up to 270 characters, shown in search results.
   - **Keywords**: Comma-separated search terms (e.g. `Arabic, Palestinian, dictionary, language`).
   - **Privacy policy URL**: Required — link to your privacy policy page.

   **Packages**
   - Drag and drop your `.msix` file(s).
   - Wait for Partner Center to validate — it checks the package identity, publisher, and certificate against your account. Fix any flagged errors before proceeding.

4. Click **Submit to the Store**.

Review typically takes **1–3 business days**. You will receive an email when certification passes or if there are issues.

### Microsoft Store first-time checklist

If this is your first submission, you'll also need:

- [ ] **Reserve the app name** in Partner Center before building (the reserved name must match exactly).
- [ ] **Store listing**: Title, description, screenshots (desktop at 1366×768+), and optionally a promotional image (2160×1080).
- [ ] **Age rating**: Complete the IARC questionnaire in the **Age ratings** section.
- [ ] **Privacy policy URL**: Required. Zaqzaq stores all data locally — note this in your policy.
- [ ] **App properties**: Set category (**Education**) and subcategory (**Reference**).
- [ ] **Pricing**: Set to **Free**.
- [ ] **Publisher profile**: Ensure your Partner Center account has a complete publisher profile (display name, contact info, payout details if monetizing).
- [ ] **Package identity configured**: `packageIdentityName` and publisher CN in `tauri.conf.json` must match the **App identity** page in Partner Center exactly.

---

## 5. Troubleshooting

### General

| Problem | Solution |
|---------|----------|
| `npm run build` fails | Check TypeScript errors: `npx vue-tsc --noEmit` |
| DB schema changes | Replace `src-tauri/resources/arabic-dictionary.db` with the updated file |
| Stale frontend assets | Run `npm run build` before building the MSIX |

### Windows

| Problem | Solution |
|---------|----------|
| `npm run tauri dev` fails with MSVC linker error | Ensure **Visual Studio 2022** is installed with the **Desktop development with C++** workload, then run `rustup target add x86_64-pc-windows-msvc` |
| WebView2 not found | Download and install the WebView2 Evergreen Runtime from Microsoft; it is pre-installed on Windows 11 but may be missing on older Windows 10 builds |
| MSIX build fails: "no certificate found" | Set `certificateThumbprint` in `tauri.conf.json` to the thumbprint of a valid cert installed in `Cert:\CurrentUser\My` |
| `Add-AppxPackage` fails: error 0x800B0109 (untrusted cert) | For local testing only, import the signing cert into `Cert:\LocalMachine\Root`. Do not do this for end-user distribution — use a CA-issued cert instead |
| Partner Center: "Publisher does not match" | The `publisher` CN in your MSIX does not match the value on your **App identity** page. Re-check `tauri.conf.json` and rebuild |
| Partner Center: "Package identity name does not match" | The `packageIdentityName` in `tauri.conf.json` must exactly match the **Package/Identity/Name** on the Partner Center **App identity** page |
| Partner Center: "Version must be higher than existing" | Increment the version in `tauri.conf.json` before rebuilding — the Store rejects packages with the same or lower version number |
| App crashes on launch (WebView2 init error) | Confirm WebView2 Runtime is installed and up to date. Check Windows Event Viewer for details |
| Slow first build | Normal — Rust compiles the entire dependency tree on the first run for a new target; subsequent builds are cached |
