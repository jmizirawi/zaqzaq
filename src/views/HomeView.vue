<template>
  <div class="home-container">
    <div class="search-section">
      <SearchBar
        v-model="searchQuery"
        :loading="store.isSearching"
        @search="handleSearch"
        @clear="handleClear"
      />
    </div>

    <div v-if="store.isSearching" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="store.searchResults.length > 0" class="results-container">
      <h3 class="results-count">
        {{ store.searchResults.length }} Results
      </h3>
      <ResultCard
        v-for="result in store.searchResults"
        :key="result.id"
        :result="result"
        :is-saved="store.isWordSaved(result.id)"
      />
    </div>

    <div v-else-if="searchQuery && !store.isSearching" class="empty-state">
      No results found
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDictionaryStore } from '../stores/dictionaryStore';
import SearchBar from '../components/SearchBar.vue';
import ResultCard from '../components/ResultCard.vue';

const store = useDictionaryStore();
const searchQuery = ref('');

// Ensure initial state is empty
onMounted(() => {
  store.searchResults = [];
  searchQuery.value = '';
});

async function handleSearch() {
  console.log('HomeView: handleSearch triggered with query:', searchQuery.value);
  if (!searchQuery.value.trim()) {
    console.log('HomeView: Query is empty');
    store.searchResults = [];
    return;
  }
  await store.search(searchQuery.value);
}

function handleClear() {
  store.searchResults = [];
  searchQuery.value = '';
}


</script>

<style scoped lang="scss">
@import '../styles/variables';
@import '../styles/mixins';

.home-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 4rem;
}

.search-section {
  margin-bottom: $spacing-md;
}

.results-count {
  text-align: center;
  font-size: 1.125rem;
  font-weight: 700;
  color: $color-text-primary;
  margin-bottom: $spacing-md;
}

.loading-state {
  text-align: center;
  padding: 2rem 0;
}

.spinner {
  display: inline-block;
  height: 3rem;
  width: 3rem;
  border-radius: $radius-full;
  border: 4px solid $color-border;
  border-top-color: $color-brand;
  animation: spin 1s linear infinite;
}

.results-container {
  display: flex;
  flex-direction: column;
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
  color: $color-text-tertiary;
  font-weight: 500;
}



@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
