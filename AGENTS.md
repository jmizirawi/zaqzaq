# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Zaqzaq is a cross-platform colloquial Palestinian Arabic dictionary app built with **Vue 3 + TypeScript** (frontend) and **Tauri 2 + Rust** (backend shell). Dictionary data comes from the Maknuune open Palestinian Arabic lexicon, stored in a bundled SQLite database (`src-tauri/resources/arabic-dictionary.db`).

## Build & Run Commands

```bash
npm install              # Install frontend dependencies
npm run tauri dev        # Run full app (Vite dev server + Tauri native window)
npm run dev              # Run Vite dev server only (no native shell)
npm run build            # TypeScript check + Vite production build
npm run tauri build      # Full production build (frontend + Rust binary)
npm test                 # Run Vitest in watch mode
npx vitest run           # Run tests once (CI-style)
npx vitest run tests/DictionaryService.test.ts  # Run a single test file
vue-tsc --noEmit         # Type-check the frontend
```

### Mobile targets

```bash
npm run tauri android dev   # Android dev build
npm run tauri ios dev       # iOS dev build
```

## Architecture

### Two-layer app: Vue frontend + Tauri backend

The Rust side (`src-tauri/`) is a thin Tauri shell — no custom Rust commands. All backend functionality uses Tauri plugins:
- `tauri-plugin-sql` (SQLite) — all database access from the frontend
- `tauri-plugin-fs` — file operations for DB initialization (copy from bundled resources)
- `tauri-plugin-opener` — external URL opening

### Frontend data flow

```
Vue Components → Pinia Store (dictionaryStore) → DatabaseService → SQLite (via tauri-plugin-sql)
```

**Single Pinia store** (`src/stores/dictionaryStore.ts`) manages all app state: search results, saved words, collections, and topics. Components never call `DatabaseService` directly.

**DatabaseService** (`src/services/DatabaseService.ts`) is the sole database access layer. It:
- Copies the bundled `arabic-dictionary.db` from Tauri resources into app data on first launch
- Validates DB integrity on startup (size check, table existence)
- Manages both the read-only dictionary `data` table (from Maknuune) and app-created tables (`saved_words`, `collections`, `word_collections`, `topics`, `topic_words`)
- Syncs topic definitions from `src/data/topics.yaml` into SQLite on every initialization

**DictionaryService** (`src/services/DictionaryService.ts`) is a thin wrapper over `DatabaseService.searchDictionary()`.

### Database schema

The bundled DB has a `data` table with uppercase column names (from Maknuune TSV): `ID`, `FORM`, `GLOSS`, `CAPHI__`, `ROOT`, `LEMMA`, `LEMMA_SEARCH`, `ANALYSIS`, `EXAMPLE_USAGE`, etc.

App-created tables use lowercase snake_case: `saved_words`, `collections`, `word_collections`, `topics`, `topic_words`.

Search queries hit multiple columns (`FORM`, `GLOSS`, `CAPHI__`, `ROOT`, `LEMMA`, `LEMMA_SEARCH`, `GLOSS_MSA`) with relevance ordering that differs for Arabic vs English input (detected via Unicode range `\u0600-\u06FF`).

### Key conventions

- **YAML for topic data**: Topics and their word ID lists are defined in `src/data/topics.yaml`, imported at build time via `vite-plugin-yaml`. To add/edit topics, modify this file — the DB is re-synced on every app init.
- **CAPHI transliteration**: The app uses CAPHI++ notation for phonetic transcription. `src/utils/transliterationFormatter.ts` maps CAPHI tokens to display characters. `src/utils/analysisMapping.ts` maps morphological analysis codes (e.g. `NOUN:MS`) to readable labels.
- **Styling**: SCSS with CSS custom properties for light/dark theme support. Variables in `src/styles/_variables.scss`, mixins in `_mixins.scss`. Components use scoped `<style lang="scss">`.
- **Routing**: Two views — `HomeView` (search + topics) and `LibraryView` (saved words + collections).
- **Icons**: Lucide Vue Next — icon names in `topics.yaml` correspond to Lucide component names.


### Testing

Tests use **Vitest** with **happy-dom** environment. Tests live in `tests/` (not co-located). The `DatabaseService` is mocked via `vi.mock()` in tests — Tauri plugin APIs are not available in the test environment. 

Always check your work with the Tauri MCP.

### Topic Vocabulary Cleanup Skill

When I ask you to clean up a specific topic's word list, follow the **`cleanup_topic`** workflow defined in `.agent/workflows/cleanup_topic.md`. This thoroughly cleans a single topic by:
1. Pruning contextually incorrect homonyms
2. Removing obscure words and duplicates
3. Adding missing foundational words
4. Grouping synonyms together and sorting from basic to complex concepts
5. Applying logical sequences (like 1, 2, 3 for numbers) where appropriate
