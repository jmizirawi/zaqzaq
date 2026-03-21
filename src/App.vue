<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { useDictionaryStore } from './stores/dictionaryStore';
import TopBar from './components/TopBar.vue';
import BottomNav from './components/BottomNav.vue';

const store = useDictionaryStore();
const router = useRouter();

const TAB_ORDER: Record<string, number> = { '/': 0, '/library': 1 };
const transitionName = ref('slide-left');
const mainContent = ref<HTMLElement | null>(null);

router.beforeEach((to, from) => {
  const toIdx = TAB_ORDER[to.path] ?? 0;
  const fromIdx = TAB_ORDER[from.path] ?? 0;
  transitionName.value = toIdx >= fromIdx ? 'slide-left' : 'slide-right';
});

watch([() => store.activeTopic, () => store.activeCollectionId], () => {
  mainContent.value?.scrollTo({ top: 0 });
});

onMounted(async () => {
  // WKWebView on iOS doesn't initialize env(safe-area-inset-*) correctly on first
  // paint. Dispatching a resize event forces recalculation, same as what rotation does.
  setTimeout(() => window.dispatchEvent(new Event('resize')), 0);

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
    <main ref="mainContent" class="main-content">
      <RouterView v-slot="{ Component, route }">
        <Transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
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