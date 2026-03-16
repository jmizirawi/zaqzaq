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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-md;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>