<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useDictionaryStore } from '../stores/dictionaryStore';
import ResultCard from '../components/ResultCard.vue';
import { Pencil } from 'lucide-vue-next';
import { Word } from '../types';

const props = defineProps<{
  collectionId: number;
}>();

const store = useDictionaryStore();
const words = ref<Word[]>([]);
const collectionName = ref('');
const isEditing = ref(false);
const editedName = ref('');
const titleInput = ref<HTMLInputElement | null>(null);

async function loadData() {
  const collection = store.collections.find(c => c.id === props.collectionId);
  collectionName.value = collection?.name || 'Collection';
  editedName.value = collectionName.value;
  words.value = await store.getWordsInCollection(props.collectionId);
}

function startEditing() {
  editedName.value = collectionName.value;
  isEditing.value = true;
  nextTick(() => {
    titleInput.value?.focus();
  });
}

async function saveTitle() {
  if (!editedName.value.trim() || editedName.value === collectionName.value) {
    isEditing.value = false;
    return;
  }

  try {
    await store.renameCollection(props.collectionId, editedName.value);
    collectionName.value = editedName.value;
  } catch (error) {
    console.error('Failed to rename collection:', error);
    editedName.value = collectionName.value;
  } finally {
    isEditing.value = false;
  }
}

onMounted(loadData);

watch(() => props.collectionId, loadData);
watch(() => store.savedWords, loadData, { deep: true });
</script>

<template>
  <div class="collection-detail">
    <!-- Inline rename controls (title is shown in TopBar) -->
    <!-- <div class="rename-bar">
      <template v-if="isEditing">
        <input
          ref="titleInput"
          v-model="editedName"
          @blur="saveTitle"
          @keyup.enter="saveTitle"
          class="title-input"
        />
      </template>
      <template v-else>
        <button class="rename-btn" @click="startEditing" title="Rename collection">
          <Pencil :size="14" />
          <span>Rename</span>
        </button>
      </template>
    </div> -->

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
@import '../styles/mixins';

.collection-detail {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.rename-bar {
  display: flex;
  justify-content: center;
}

.rename-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-md;
  border: none;
  background: transparent;
  color: $color-fg-secondary;
  cursor: pointer;
  font-size: $font-size-sm;
  border-radius: $radius-full;
  transition: color 0.2s, background-color 0.2s;

  &:hover {
    color: $color-fg-primary;
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.title-input {
  @include input-base;
  text-align: center;
  max-width: 300px;
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
