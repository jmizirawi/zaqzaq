<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useDictionaryStore } from './stores/dictionaryStore';
import { databaseService } from './services/DatabaseService';
import Navigation from './components/Navigation.vue';
// import ErrorOverlay from './components/ErrorOverlay.vue';
import { errorState } from './utils/errorLogger';

const store = useDictionaryStore();

async function openAttribution() {
  try {
    await openUrl('https://sites.google.com/nyu.edu/palestine-lexicon');
  } catch (e) {
    console.error('Failed to open URL', e);
    errorState.addError('Failed to open attribution URL', 'App.vue', String(e));
  }
}

onMounted(async () => {
  try {
    // Removed setTimeout. Tauri plugins should be ready on mount.
    console.log('App mounted, initializing services...');
    
    await databaseService.initialize();
    await store.loadSavedWords();
    await store.loadCollections();
    
    store.isInitialized = true;
    console.log('Initialization complete');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    errorState.addError(
      `Initialization Error: ${error instanceof Error ? error.message : String(error)}`,
      'App.vue:onMounted',
      error instanceof Error ? error.stack : undefined
    );
  }
});
</script>

<template>
  <div class="app-wrapper">
    <!-- <ErrorOverlay /> -->
    <Navigation />
    <main class="main-content">
      <RouterView />
    </main>
    
    <footer class="app-footer">
      <p>
        Dictionary data from 
        <a href="#" @click.prevent="openAttribution">Maknuune</a>, an open Palestinian Arabic lexicon
      </p>
    </footer>
  </div>
</template>

<style scoped lang="scss">
@import './styles/variables';
@import './styles/mixins';

.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-xl $spacing-md;
  width: 100%;
  flex: 1;
}

.app-footer {
  padding: $spacing-lg;
  text-align: center;
  margin-top: auto;
  
  p {
    font-size: 0.75rem;
    color: $color-fg-secondary;
  }
  
  a {
    color: inherit;
    text-decoration: underline;
    cursor: pointer;
    transition: color 0.2s;
    
    &:hover {
      color: $color-fg-primary;
    }
  }
}
</style>