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

/**
 * Android back-button support.
 * Sub-pages (topic detail, collection detail) are state-driven, not URL-driven,
 * so the WebView has no history entry to pop. We push a sentinel entry when
 * entering a sub-page and listen for popstate to clear the detail state.
 */
let handlingPopstate = false;

watch(() => store.activeTopic, (newVal, oldVal) => {
  mainContent.value?.scrollTo({ top: 0 });
  if (newVal && !oldVal && !handlingPopstate) {
    history.pushState({ subpage: 'topic' }, '');
  }
});

watch(() => store.activeCollectionId, (newVal, oldVal) => {
  mainContent.value?.scrollTo({ top: 0 });
  if (newVal != null && oldVal == null && !handlingPopstate) {
    history.pushState({ subpage: 'collection' }, '');
  }
});

window.addEventListener('popstate', () => {
  handlingPopstate = true;
  if (store.activeTopic) {
    store.setActiveTopic(null);
  } else if (store.activeCollectionId !== null) {
    store.activeCollectionId = null;
  }
  handlingPopstate = false;
});

/**
 * iOS WKWebView safe area fix.
 * WKWebView may miscalculate env(safe-area-inset-*) and viewport height
 * on initial paint with viewport-fit=cover (WebKit Bug 191872).
 * This reads insets via a test element and injects them as CSS custom
 * properties (--safe-inset-top/bottom), mirroring the Android native approach.
 */
function setupIOSSafeArea() {
  if (!/iPhone|iPad|iPod/.test(navigator.userAgent)) return;

  const root = document.documentElement;

  const readAndApplyInsets = () => {
    const el = document.createElement('div');
    el.style.cssText =
      'position:fixed;left:-9999px;visibility:hidden;' +
      'padding-top:env(safe-area-inset-top,0px);' +
      'padding-bottom:env(safe-area-inset-bottom,0px);';
    document.body.appendChild(el);
    const s = getComputedStyle(el);
    const top = parseFloat(s.paddingTop) || 0;
    const bottom = parseFloat(s.paddingBottom) || 0;
    document.body.removeChild(el);

    root.style.setProperty('--safe-inset-top', `${top}px`);
    root.style.setProperty('--safe-inset-bottom', `${bottom}px`);
  };

  readAndApplyInsets();

  window.addEventListener('resize', readAndApplyInsets);
  window.visualViewport?.addEventListener('resize', readAndApplyInsets);
}

/**
 * Track the visual viewport size so dialogs stay visible when the
 * software keyboard is open. Sets --visual-viewport-height and
 * --visual-viewport-offset-top as CSS custom properties.
 */
function setupVisualViewport() {
  const vv = window.visualViewport;
  if (!vv) return;

  const root = document.documentElement;

  const update = () => {
    root.style.setProperty('--visual-viewport-height', `${vv.height}px`);
    root.style.setProperty('--visual-viewport-offset-top', `${vv.offsetTop}px`);
  };

  update();
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
}

onMounted(async () => {
  setupIOSSafeArea();
  setupVisualViewport();

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
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overscroll-behavior: none;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-md;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>