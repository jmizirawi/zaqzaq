<script setup lang="ts">
import { useDictionaryStore } from '../stores/dictionaryStore';
import CollectionsTab from '../components/CollectionsTab.vue';
import CollectionDetail from '../components/CollectionDetail.vue';

const store = useDictionaryStore();

function handleSelectCollection(id: number) {
  store.activeCollectionId = id;
}
</script>

<template>
  <div class="library-view">
    <div class="header" v-if="store.activeCollectionId === null">
      <h1 class="title">Collections • مجموعات</h1>
    </div>

    <div class="content">
      <CollectionsTab
        v-if="store.activeCollectionId === null"
        @select="handleSelectCollection"
      />
      <CollectionDetail
        v-else
        :collection-id="store.activeCollectionId"
      />
    </div>
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
}

.header {
  text-align: center;
  margin-bottom: $spacing-sm;
}

.title {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-fg-primary;
}
</style>
