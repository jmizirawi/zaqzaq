<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDictionaryStore } from '../stores/dictionaryStore';
import CollectionsTab from '../components/CollectionsTab.vue';
import CollectionDetail from '../components/CollectionDetail.vue';

const store = useDictionaryStore();
const contentTransition = ref('slide-up');

watch(() => store.activeCollectionId, (newVal) => {
  contentTransition.value = newVal !== null ? 'slide-up' : 'slide-down';
});

function handleSelectCollection(id: number) {
  store.activeCollectionId = id;
}
</script>

<template>
  <div class="library-view">
    <Transition :name="contentTransition" mode="out-in">
      <div v-if="store.activeCollectionId === null" key="list">
        <div class="header">
          <h1 class="title">Collections • مجموعات</h1>
        </div>
        <CollectionsTab @select="handleSelectCollection" />
      </div>
      <div v-else key="detail">
        <CollectionDetail :collection-id="store.activeCollectionId" />
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@import '../styles/variables';
@import '../styles/mixins';

.library-view {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: $spacing-md;
}

.header {
  text-align: center;
  margin-bottom: $spacing-sm;
  padding-top: env(safe-area-inset-top);
}

.title {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-fg-primary;
}
</style>
