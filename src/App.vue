<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useDictionaryStore } from './stores/dictionaryStore';
import TopBar from './components/TopBar.vue';
import BottomNav from './components/BottomNav.vue';

const store = useDictionaryStore();

onMounted(async () => {
  try {
    console.log('App mounted, initializing services...');
    await store.initialize();
    console.log('Initialization complete');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
});
</script>

<template>
  <div class="app-wrapper">
    <TopBar />
    <main class="main-content">
      <RouterView />
    </main>
    <BottomNav />
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
  padding: $spacing-md $spacing-md;
  padding-bottom: calc(56px + env(safe-area-inset-bottom) + $spacing-md);
  width: 100%;
  flex: 1;
}
</style>