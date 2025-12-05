<script setup lang="ts">
import { computed } from 'vue';
import { useDictionaryStore } from '../stores/dictionaryStore';
import ResultCard from '../components/ResultCard.vue';

const store = useDictionaryStore();

const savedWords = computed(() => store.savedWords);


</script>

<template>
  <div class="saved-tab">
    <div class="stats" v-if="savedWords.length > 0">
      <p class="subtitle">
        {{ savedWords.length }} word{{ savedWords.length !== 1 ? 's' : '' }} saved
      </p>
    </div>

    <div v-if="savedWords.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
        </svg>
      </div>
      <h3 class="empty-title">
        No saved words yet
      </h3>
      <p class="empty-text">
        Search for words and save them to build your collection
      </p>
      <router-link
        to="/"
        class="cta-button"
      >
        Start Searching
      </router-link>
    </div>

    <div v-else class="saved-list">
      <div
        v-for="word in savedWords"
        :key="word.id"
        class="saved-item"
      >
        <ResultCard
          :result="{ ...word, relevance: 1 }"
          :is-saved="true"

        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.saved-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stats {
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: #4A4A4A;
  font-size: 0.875rem;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.empty-icon {
  color: #8F9B85; // Sage Green
  margin-bottom: 1rem;
}

.icon {
  width: 6rem;
  height: 6rem;
  margin: 0 auto;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F1F1F;
  margin-bottom: 0.5rem;
}

.empty-text {
  color: #4A4A4A;
}

.cta-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #8B1E24; // Brand Maroon
  color: white;
  border-radius: 9999px;
  transition: background-color 0.2s;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    background-color: #6d171c;
  }
}

.saved-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.saved-item {
  position: relative;
}
</style>
