<template>
  <Teleport to="body">
    <Transition name="dialog">
    <div v-if="isOpen" class="dialog-overlay" @click.self="$emit('close')">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3 class="dialog-title">Save to Collection</h3>
          <button @click="$emit('close')" class="close-btn">
            <X :size="24" />
          </button>
        </div>

        <div class="dialog-body">

          <div class="new-collection-section">
            <input
              v-model="newCollectionName"
              placeholder="New collection name"
              class="new-collection-input"
              @keyup.enter="createCollection"
            />
            <button
              @click="createCollection"
              class="create-btn"
              :disabled="!newCollectionName.trim()"
            >
              <Plus :size="16" />
            </button>
          </div>

          <div class="collections-list" v-if="collections.length > 0">
            <label
              v-for="collection in collections"
              :key="collection.id"
              class="collection-item"
            >
              <input
                type="checkbox"
                :value="collection.id"
                v-model="selectedCollectionIds"
                class="checkbox"
              />
              <span class="collection-name">{{ collection.name }}</span>
            </label>
          </div>
          <div v-else class="empty-collections">
            No collections found. Create one to start saving words.
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>

        <div class="dialog-footer">
          <button @click="$emit('close')" class="cancel-btn">Cancel</button>
          <button
            @click="handleSave"
            class="save-btn"
            :disabled="selectedCollectionIds.length === 0"
          >
            Save
          </button>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { X, Plus } from 'lucide-vue-next';
import { useDictionaryStore } from '../stores/dictionaryStore';

const props = defineProps<{
  isOpen: boolean;
  wordId: number;
  initialCollectionIds?: number[];
}>();

const emit = defineEmits<{
  'close': [];
  'save': [collectionIds: number[]];
}>();

const store = useDictionaryStore();
const { collections } = storeToRefs(store);
const selectedCollectionIds = ref<number[]>([]);
const newCollectionName = ref('');
const errorMessage = ref('');

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
    
    // Ensure collections are loaded
    if (collections.value.length === 0) {
      await store.loadCollections();
    }
    
    if (props.initialCollectionIds) {
      selectedCollectionIds.value = [...props.initialCollectionIds];
    }
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

async function createCollection() {
  if (!newCollectionName.value.trim()) return;
  
  try {
    const id = await store.createCollection(newCollectionName.value);
    
    // Automatically select the new collection
    selectedCollectionIds.value.push(id);
    newCollectionName.value = '';
    errorMessage.value = '';
  } catch (error) {
    console.error('Failed to create collection:', error);
    errorMessage.value = 'Failed to create collection. Name may already exist.';
  }
}
function handleSave() {
  emit('save', selectedCollectionIds.value);
}
</script>

<style scoped lang="scss">
@import '../styles/variables';
@import '../styles/mixins';

.collections-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: $spacing-lg;
}

.collection-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  cursor: pointer;
  padding: $spacing-md;
  border-radius: $radius-full;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: $radius-sm;
  border: 1px solid $color-border;
  cursor: pointer;
  accent-color: $color-bg-accent-primary;
}

.collection-name {
  color: $color-fg-secondary;
  font-weight: 500;
}

.empty-collections {
  text-align: center;
  color: $color-fg-secondary;
  margin-bottom: $spacing-lg;
  font-size: 0.875rem;
}

.new-collection-section {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;
}

.new-collection-input {
  @include input-base;
}

.create-btn {
  @include btn-secondary;
  padding: $spacing-md;
}

.cancel-btn {
  @include btn-secondary;
}

.save-btn {
  @include btn-primary;
}
</style>
