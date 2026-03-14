<template>
  <nav class="bottom-nav">
    <router-link to="/" class="nav-tab" active-class="active" @click.native="handleHomeClick">
      <Search :size="22" />
      <span class="nav-label">Search</span>
    </router-link>

    <router-link to="/library" class="nav-tab" active-class="active" @click.native="handleLibraryClick">
      <BookMarked :size="22" />
      <span class="nav-label">Collections</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { Search, BookMarked } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import { useDictionaryStore } from '../stores/dictionaryStore';

const route = useRoute();
const store = useDictionaryStore();

function handleHomeClick() {
  // If already on home, reset to topics grid
  if (route.path === '/') {
    store.activeTopic = null;
    store.searchResults = [];
  }
}

function handleLibraryClick() {
  // If already on library, reset to collections list
  if (route.path === '/library') {
    store.activeCollectionId = null;
  }
}
</script>

<style scoped lang="scss">
@import '../styles/variables';

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: $color-bg-primary;
  border-top: 1px solid $color-border;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
  height: 56px;
}

.nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex: 1;
  height: 100%;
  color: $color-fg-secondary;
  text-decoration: none;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;

  &.active {
    color: $color-fg-accent-primary;
  }
}

.nav-label {
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  letter-spacing: 0.02em;
}
</style>
