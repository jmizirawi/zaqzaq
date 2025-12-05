<template>
  <Teleport to="body">
    <div class="dialog-overlay" @click.self="$emit('close')">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3 class="dialog-title">Save to Collection</h3>
          <button @click="$emit('close')" class="close-btn">
            <X :size="20" />
          </button>
        </div>

        <div class="dialog-body">
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
            No collections found. Create one below.
          </div>

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
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { X, Plus } from 'lucide-vue-next';
import { useDictionaryStore } from '../stores/dictionaryStore';

const props = defineProps<{
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

onMounted(async () => {
  // Ensure collections are loaded
  if (collections.value.length === 0) {
    await store.loadCollections();
  }
  
  if (props.initialCollectionIds) {
    selectedCollectionIds.value = [...props.initialCollectionIds];
  }
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

.error-message {
  color: $color-danger;
  font-size: 0.875rem;
  margin-top: $spacing-sm;
}
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background-color: $color-background;
  border-radius: $radius-lg;
  width: 90%;
  max-width: 400px;
  box-shadow: $shadow-lg;
  overflow: hidden;
}

.dialog-header {
  @include flex-between;
  padding: $spacing-md $spacing-lg;
}

.dialog-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: $color-text-primary;
  margin: 0;
}

.close-btn {
  @include btn-icon;
}

.dialog-body {
  padding: $spacing-lg;
}

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
  gap: 0.75rem;
  cursor: pointer;
  padding: $spacing-sm;
  border-radius: $radius-md;
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
  accent-color: $color-brand;
}

.collection-name {
  color: $color-text-secondary;
  font-weight: 500;
}

.empty-collections {
  text-align: center;
  color: $color-text-tertiary;
  margin-bottom: $spacing-lg;
  font-size: 0.875rem;
}

.new-collection-section {
  display: flex;
  gap: $spacing-sm;
}

.new-collection-input {
  @include input-base;
  padding: $spacing-sm 0.75rem;
  font-size: 0.875rem;
}

.create-btn {
  @include btn-neutral;
  padding: $spacing-sm;
}

.dialog-footer {
  padding: $spacing-md $spacing-lg;
  background-color: rgba(0, 0, 0, 0.02);
  border-top: 1px solid $color-border;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-btn {
  @include btn-neutral;
  background-color: $color-white;
  border: 1px solid $color-border;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.save-btn {
  @include btn-primary;
}
</style>
