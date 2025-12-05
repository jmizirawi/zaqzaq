```vue
<script setup lang="ts">
import { ref } from 'vue';
import CollectionsTab from '../components/CollectionsTab.vue';
import CollectionDetail from '../components/CollectionDetail.vue';

const selectedCollectionId = ref<number | null>(null);

function handleSelectCollection(id: number) {
  selectedCollectionId.value = id;
}

function handleBack() {
  selectedCollectionId.value = null;
}
</script>

<template>
  <div class="library-view">
    <div class="header" v-if="!selectedCollectionId">
      <h1 class="title">Collections • مجموعات</h1>
    </div>

    <div class="content">
      <CollectionsTab
        v-if="!selectedCollectionId"
        @select="handleSelectCollection"
      />
      <CollectionDetail
        v-else
        :collection-id="selectedCollectionId"
        @back="handleBack"
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
