
<template>
  <div class="topic-detail">
    <div class="header">
      <button @click="goBack" class="back-btn">
        <ArrowLeft :size="20" />
        Back
      </button>
      
      <div class="title-container">
        <h1 class="title">{{ store.activeTopic?.title }}</h1>
        <!-- <p class="subtitle" v-if="store.topicWords">{{ store.topicWords.length }} words</p> -->
      </div>
      
    </div>
    
    <div v-if="store.isSearching" class="loading">Loading words...</div>
    
    <div v-else class="words-list">
      <div v-if="store.topicWords.length === 0" class="empty">
        No words in this collection yet.
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
import { ArrowLeft } from 'lucide-vue-next';

const store = useDictionaryStore();

function goBack() {
  store.setActiveTopic(null);
}
</script>

<style scoped lang="scss">
@import '../styles/variables';
@import '../styles/mixins';

.topic-detail {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.subtitle {
  color: $color-fg-secondary;
  display: block;
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md; // Match HomeView gap if possible or ResultCard margin
}

.loading, .empty {
  text-align: center;
  padding: $spacing-xl;
  color: $color-fg-secondary;
}
</style>
