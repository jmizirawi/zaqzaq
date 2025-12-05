<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useDictionaryStore } from './stores/dictionaryStore';
import { databaseService } from './services/DatabaseService';
import Navigation from './components/Navigation.vue';

const store = useDictionaryStore();

async function openAttribution() {
  await openUrl('https://sites.google.com/nyu.edu/palestine-lexicon');
}

onMounted(async () => {
  try {
    // Wait a brief moment for Tauri to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await databaseService.initialize();
    await store.loadSavedWords();
    await store.loadCollections();
    store.isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
});
</script>

<template>
  <div class="app-wrapper">
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
  padding: $spacing-lg $spacing-md;
  width: 100%;
  flex: 1;
}

.app-footer {
  padding: $spacing-lg;
  text-align: center;
  margin-top: auto;
  
  p {
    font-size: 0.75rem;
    color: $color-text-tertiary;
  }
  
  a {
    color: inherit;
    text-decoration: underline;
    cursor: pointer;
    transition: color 0.2s;
    
    &:hover {
      color: $color-text-secondary;
    }
  }
}
</style>