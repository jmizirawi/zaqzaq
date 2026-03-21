#!/bin/bash
# Ensures 16 KB page size support in the Android release build.
# Re-run this if you ever re-initialize the Android project with `tauri android init`.

# Ensure .cargo/config.toml exists at the project root (where the build runs from).
# Cargo searches from the working directory upward, so src-tauri/.cargo/ is not found.
if [ ! -f ".cargo/config.toml" ]; then
  mkdir -p .cargo
  cp src-tauri/.cargo/config.toml .cargo/config.toml
  echo "patch-android: copied .cargo/config.toml to project root."
fi

GRADLE_FILE="src-tauri/gen/android/app/build.gradle.kts"

if grep -q "useLegacyPackaging" "$GRADLE_FILE"; then
  echo "patch-android: already patched, skipping."
  exit 0
fi

python3 - "$GRADLE_FILE" <<'EOF'
import sys, re

path = sys.argv[1]
text = open(path).read()

old = '            proguardFiles(\n                *fileTree(".") { include("**/*.pro") }\n                    .plus(getDefaultProguardFile("proguard-android-optimize.txt"))\n                    .toList().toTypedArray()\n            )\n        }'
new = old.replace(
    '            )\n        }',
    '            )\n            packaging {\n                jniLibs.useLegacyPackaging = false\n            }\n        }'
)

if old not in text:
    print("patch-android: WARNING - expected block not found. File may have changed.")
    sys.exit(1)

open(path, 'w').write(text.replace(old, new))
print("patch-android: 16 KB page size fix applied.")
EOF
