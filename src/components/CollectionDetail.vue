<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useDictionaryStore } from '../stores/dictionaryStore';
import ResultCard from '../components/ResultCard.vue';
import { ArrowLeft, Pencil } from 'lucide-vue-next';
import { Word } from '../types';

const props = defineProps<{
  collectionId: number;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const store = useDictionaryStore();
const words = ref<Word[]>([]);
const collectionName = ref('');
const isEditing = ref(false);
const editedName = ref('');
const titleInput = ref<HTMLInputElement | null>(null);

async function loadData() {
  // Find collection name from store
  const collection = store.collections.find(c => c.id === props.collectionId);
  collectionName.value = collection?.name || 'Collection';
  editedName.value = collectionName.value;

  // Load words
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
    // Revert on error
    editedName.value = collectionName.value;
  } finally {
    isEditing.value = false;
  }
}

onMounted(loadData);

watch(() => props.collectionId, loadData);
</script>

<template>
  <div class="collection-detail">
    <div class="header">
      <button @click="emit('back')" class="back-btn">
        <ArrowLeft :size="20" />
        Back
      </button>
      
      <div v-if="isEditing" class="title-edit-container">
        <input 
          ref="titleInput"
          v-model="editedName" 
          @blur="saveTitle" 
          @keyup.enter="saveTitle"
          class="title-input"
        />
      </div>
      <div v-else class="title-container" @click="startEditing">
        <h1 class="title">{{ collectionName }}</h1>
        <button class="edit-btn" title="Rename collection">
          <Pencil :size="16" />
        </button>
      </div>
      
      <div class="spacer"></div> <!-- Spacer to balance the flex layout if needed, or just use absolute for back button -->
    </div>

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

.header {
  @include flex-center;
  position: relative;
  margin-bottom: $spacing-md;
  min-height: 40px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-md;
    height: auto;
  }
}

.back-btn {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  color: $color-text-secondary;
  font-weight: 500;
  transition: color 0.2s;
  position: absolute;
  left: 0;
  
  &:hover {
    color: $color-text-primary;
  }

  @media (max-width: 640px) {
    position: static;
  }
}

.title-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-md;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    
    .edit-btn {
      opacity: 1;
    }
  }
}

.title-edit-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon {
  color: $color-brand;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  color: $color-text-primary;
  margin: 0;
}

.edit-btn {
  @include btn-icon;
  opacity: 0;
  padding: $spacing-xs;
  
  @media (max-width: 640px) {
    opacity: 1;
  }
}

.title-input {
  @include input-base;
  font-size: 2rem;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid $color-brand;
  background: transparent;
  border-radius: 0;
  text-align: center;
  width: auto;
  min-width: 200px;
  padding: 0;
  margin: 0;
  
  &:focus {
    border-color: $color-brand;
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: $color-text-tertiary;
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}
</style>
