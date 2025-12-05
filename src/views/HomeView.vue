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

onMounted(async () => {
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
  gap: $spacing-lg;
  padding-bottom: $spacing-xxl;
}

.search-section {
  margin-bottom: $spacing-md;
}

.results-count {
  text-align: center;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-fg-primary;
  margin-bottom: $spacing-md;
}

.loading-state {
  text-align: center;
  padding: $spacing-lg 0;
}

.spinner {
  display: inline-block;
  height: $spacing-lg;
  width: $spacing-lg;
  border-radius: $radius-full;
  border: 4px solid $color-border;
  border-top-color: $color-fg-accent-primary;
  animation: spin 1s linear infinite;
}

.results-container {
  display: flex;
  flex-direction: column;
}

.empty-state {
  text-align: center;
  padding: $spacing-lg 0;
  color: $color-fg-secondary;
  font-weight: $font-weight-normal;
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
