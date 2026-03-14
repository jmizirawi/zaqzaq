<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useDictionaryStore } from './stores/dictionaryStore';
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

async function resetDB() {
  console.log('Reset button clicked');
  const confirmed = confirm('Are you sure you want to reset the database? This will clear all saved words, collections, and re-seed topics.');
  console.log('User confirmed:', confirmed);
  
  if (confirmed) {
    try {
      console.log('Starting database reset...');
      await store.resetDatabase();
      console.log('Reset complete, reloading...');
      alert('Database reset successfully! Reloading...');
      window.location.reload();
    } catch (error) {
      console.error('Reset failed:', error);
      alert(`Failed to reset database: ${error}`);
    }
  }
}

onMounted(async () => {
  try {
    // Removed setTimeout. Tauri plugins should be ready on mount.
    console.log('App mounted, initializing services...');
    
    // Use the store's initialize action which handles DB init and loading all data (saved words, collections, topics)
    await store.initialize();
    
    // store.isInitialized = true; // Handled within store.initialize now? Let's check store. Yes it is.
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
      <!--<button @click="resetDB" class="reset-link">Reset Database (Dev)</button>-->
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
  
  .reset-link {
    display: block;
    margin-top: $spacing-sm;
    font-size: 0.75rem;
    color: $color-fg-secondary;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    opacity: 0.5;
    
    &:hover {
      opacity: 1;
      color: $color-fg-accent-primary;
    }
  }
}
</style>