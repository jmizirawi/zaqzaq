<template>
  <div class="topic-detail">
    <div v-if="store.isSearching" class="loading">Loading words...</div>

    <div v-else class="words-list">
      <div v-if="store.topicWords.length === 0" class="empty">
        No words in this topic yet.
      </div>
      <ResultCard
        v-for="word in store.topicWords"
        :key="word.id"
        :result="word"
        :is-saved="store.isWordSaved(word.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDictionaryStore } from '../stores/dictionaryStore';
import ResultCard from './ResultCard.vue';

const store = useDictionaryStore();
</script>

<style scoped lang="scss">
@import '../styles/variables';

.topic-detail {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.loading, .empty {
  text-align: center;
  padding: $spacing-xl;
  color: $color-fg-secondary;
}
</style>
