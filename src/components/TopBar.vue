<template>
  <header v-if="isDetailView" class="top-bar">
    <div class="top-bar-content">
      <button @click="goBack" class="back-btn">
        <ArrowLeft :size="20" />
      </button>
      <h1 class="detail-title">{{ detailTitle }}</h1>
      <div class="spacer"></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import { useDictionaryStore } from '../stores/dictionaryStore';

const route = useRoute();
const store = useDictionaryStore();

const isDetailView = computed(() => {
  // Topic detail on home page
  if (route.path === '/' && store.activeTopic) return true;
  // Collection detail on library page
  if (route.path === '/library' && store.activeCollectionId !== null) return true;
  return false;
});

const detailTitle = computed(() => {
  if (route.path === '/' && store.activeTopic) {
    return store.activeTopic.title;
  }
  if (route.path === '/library' && store.activeCollectionId !== null) {
    const collection = store.collections.find(c => c.id === store.activeCollectionId);
    return collection?.name || 'Collection';
  }
  return '';
});

function goBack() {
  if (route.path === '/' && store.activeTopic) {
    store.setActiveTopic(null);
  } else if (route.path === '/library' && store.activeCollectionId !== null) {
    store.activeCollectionId = null;
  }
}
</script>

<style scoped lang="scss">
@import '../styles/variables';

.top-bar {
  background-color: $color-bg-primary;
  padding-top: env(safe-area-inset-top);
  position: sticky;
  top: 0;
  z-index: 90;
}

.top-bar-content {
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-sm $spacing-md;
  min-height: 48px;
  gap: $spacing-sm;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-sm;
  border: none;
  background: transparent;
  color: $color-fg-accent-primary;
  cursor: pointer;
  border-radius: $radius-full;
  transition: background-color 0.2s;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.detail-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-fg-primary;
  margin: 0;
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spacer {
  width: 36px; // Match back button width for centering
  flex-shrink: 0;
}

// Logo styles (reused from old Navigation.vue)
.logo-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.logo-image {
  height: $spacing-xxl;
  width: auto;
}

.logo {
  font-size: $font-size-base;
  font-weight: $font-weight-normal;
  color: $color-fg-accent-primary;
  line-height: 1;
  margin: 0;
  text-align: left;
}

.logo-subtitle {
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;
  display: block;
  color: $color-fg-accent-primary;
  line-height: 1;
  margin-top: 0.5rem;
  text-align: left;
}
</style>
