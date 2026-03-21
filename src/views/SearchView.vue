<template>
  <div class="home-container">
    <div v-if="!store.activeTopic" :class="['search-section', { 'search-sticky': searchQuery }]">
      <SearchBar
        v-model="searchQuery"
        :loading="store.isSearching"
        @search="handleSearch"
        @clear="handleClear"
      />
    </div>

    <div class="transition-wrapper">
    <Transition :name="contentTransition" mode="out-in">
      <!-- Loading State -->
      <div v-if="store.isSearching && !store.activeTopic" key="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <!-- Search Results Mode -->
      <div v-else-if="searchQuery" key="results" class="results-container">
         <div v-if="store.searchResults.length > 0">
            <h3 class="results-count">
              {{ store.searchResults.length }} Results
            </h3>
            <ResultCard
              v-for="(result, index) in store.searchResults"
              :key="result.id"
              :result="result"
              :is-saved="store.isWordSaved(result.id)"
              class="result-animated"
              :style="{ '--card-index': index }"
            />
         </div>
         <div v-else-if="!store.isSearching" class="empty-state">
            No results found
         </div>
      </div>

      <!-- Topic Detail Mode -->
      <div v-else-if="store.activeTopic" key="topic" class="topic-detail-container">
        <TopicDetailView />
      </div>

      <!-- Discovery Mode (Default) -->
      <div v-else key="discovery" class="discovery-container">
        <div class="source-credit">
          <p>Powered by <a href="#" @click.prevent="openLink('https://sites.google.com/nyu.edu/palestine-lexicon')">Maknuune</a>—The Open Palestinian Arabic Lexicon</p>
        </div>
        <TopicsGrid />
      </div>
    </Transition>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useDictionaryStore } from '../stores/dictionaryStore';
import SearchBar from '../components/SearchBar.vue';
import ResultCard from '../components/ResultCard.vue';
import TopicsGrid from '../components/TopicsGrid.vue';
import TopicDetailView from '../components/TopicDetailView.vue';
import { debounce } from '../utils/debounce';
import { openUrl } from '@tauri-apps/plugin-opener';

const store = useDictionaryStore();

function openLink(url: string) {
  openUrl(url);
}
const searchQuery = ref('');
const contentTransition = computed(() => store.activeTopic ? 'slide-up' : 'slide-down');

onMounted(async () => {
  // Ensure fresh state on mount logic if needed, but activeTopic persistence might be desired.
  // If we want to reset search on mount:
  if(store.searchResults.length > 0 && !searchQuery.value) {
      store.searchResults = [];
  }
});

const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
        store.searchResults = [];
        return;
    }
    await store.search(query);
}, 300); // 300ms delay

// Watch for search query changes and trigger debounced search
watch(searchQuery, (newVal) => {
    // Clear active topic immediately when typing starts
    if (newVal.trim()) {
        store.activeTopic = null;
        debouncedSearch(newVal);
    } else {
        // If empty, clear results immediately (no debounce needed for clearing)
        store.searchResults = [];
    }
});

async function handleSearch() {
  console.log('SearchView: handleSearch triggered with query:', searchQuery.value);
  // Immediate search on Enter key (bypasses debounce or races it safely)
  if (!searchQuery.value.trim()) {
    store.searchResults = [];
    return;
  }
  await store.search(searchQuery.value);
}

function handleClear() {
  store.searchResults = [];
  searchQuery.value = '';
  store.activeTopic = null; // Go back to grid
}

</script>

<style scoped lang="scss">
@import '../styles/variables';
@import '../styles/mixins';

.home-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  padding-bottom: $spacing-md;
}

.search-section {
  margin: 0 (-$spacing-md);
  padding: $spacing-sm $spacing-md;
  padding-top: calc(env(safe-area-inset-top) + #{$spacing-sm});
  margin-bottom: $spacing-md;
}

.search-sticky {
  position: sticky;
  top: 0;
  z-index: 80;
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

.section-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-fg-primary;
  margin-bottom: $spacing-md;
  margin-left: $spacing-xs;
}

.source-credit {
  text-align: center;
  padding: 0;
  color: $color-fg-secondary;
  font-size: $font-size-sm;
  a {
    color: $color-fg-accent-primary;
    text-decoration: none;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-animated {
  animation: fade-up 0.3s ease both;
  animation-delay: calc(var(--card-index) * 40ms);
}
</style>
