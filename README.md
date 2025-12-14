# Zaqzaq Palestinian Dictionary App - README

## 🌟 Overview

**Zaqzaq (زَقْزَق)** is a cross-platform colloquial Palestinian Arabic dictionary application, using word data from [Maknuune](https://sites.google.com/nyu.edu/palestine-lexicon), an open Palestinian Arabic lexicon. Built with Vue 3, Tauri, and TypeScript.

## ✨ Features

- 🔍 **Bilingual Search**: English or Arabic input
- 💾 **Save Words**: Persistent local storage with SQLite
- 📂 **Collections**: Organize words into custom collections

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Rust (for Tauri)
- Platform-specific tools:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Visual Studio C++ Build Tools
  - **Linux**: WebKit2GTK development libraries

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run tauri dev

# Run tests
npm test

# Build for production
npm run tauri build
```

## 🏗️ Project Structure

```
zaqzaq/
├── src/                   # Vue 3 frontend
│   ├── assets/            # Static assets (fonts, images)
│   ├── components/        # Reusable UI components
│   ├── router/            # Vue Router configuration
│   ├── services/          # Business logic & API services
│   ├── stores/            # Pinia state management
│   ├── styles/            # Global SCSS styles & mixins
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Helper functions
│   └── views/             # Page views
├── src-tauri/             # Tauri backend (Rust)
└── tests/                 # Unit tests
```

## 📱 Mobile Setup

### Android
```bash
npm run tauri android init
npm run tauri android dev
```

### iOS
```bash
npm run tauri ios init
npm run tauri ios dev
```

## 🧪 Testing

Unit tests are written with Vitest:

```bash
npm test              # Run tests
npm run test:ui       # Open test UI (if installed)
```

## 🛠️ Tech Stack

- **Frontend**: Vue 3, TypeScript
- **Styling**: SCSS/SASS
- **State**: Pinia
- **Routing**: Vue Router
- **Backend**: Tauri 2, Rust
- **Database**: SQLite via tauri-plugin-sql
- **Icons**: Lucide Vue Next
- **Testing**: Vitest, Happy-DOM

---

Made with ❤️ using Vue and Tauri
