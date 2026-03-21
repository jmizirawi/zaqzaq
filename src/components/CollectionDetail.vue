<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useDictionaryStore } from '../stores/dictionaryStore';
import ResultCard from '../components/ResultCard.vue';
import { Word } from '../types';

const props = defineProps<{
  collectionId: number;
}>();

const store = useDictionaryStore();
const words = ref<Word[]>([]);

async function loadData() {
  words.value = await store.getWordsInCollection(props.collectionId);
}

onMounted(loadData);

watch(() => props.collectionId, loadData);
watch(() => store.savedWords, loadData, { deep: true });
</script>

<template>
  <div class="collection-detail">
    <div v-if="words.length === 0" class="empty-state">
      <p class="empty-text">No words in this collection yet.</p>
    </div>

    <div v-else class="words-list">
      <div v-for="word in words" :key="word.id" class="word-item">
        <ResultCard :result="{ ...word, relevance: 1 }" :is-saved="true" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '../styles/variables';

.collection-detail {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: $color-fg-secondary;
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}
</style>
