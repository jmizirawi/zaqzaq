<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useDictionaryStore } from '../stores/dictionaryStore';
import { Plus, Folder, Trash2, Pencil } from 'lucide-vue-next';
import { Collection } from '../types';
import ConfirmDialog from './ConfirmDialog.vue';
import CreateCollectionDialog from './CreateCollectionDialog.vue';

const store = useDictionaryStore();

const showCreateDialog = ref(false);

const editingCollectionId = ref<number | null>(null);
const editingName = ref('');
const renameInput = ref<HTMLInputElement[] | null>(null);

const showDeleteDialog = ref(false);
const collectionToDelete = ref<number | null>(null);

const collections = computed(() => store.collections);

function openCreateDialog() {
  showCreateDialog.value = true;
}

function handleCreate(name: string) {
  // Collection creation is handled inside the dialog component
  // We just need to close the dialog, which is also handled by the dialog's close event
  // But we can add any post-creation logic here if needed
  console.log('Collection created:', name);
}

function confirmDelete(id: number) {
  collectionToDelete.value = id;
  showDeleteDialog.value = true;
}

async function handleDelete() {
  if (collectionToDelete.value === null) return;
  
  try {
    await store.deleteCollection(collectionToDelete.value);
  } catch (error) {
    console.error('Error deleting collection:', error);
  } finally {
    showDeleteDialog.value = false;
    collectionToDelete.value = null;
  }
}

function startRenaming(collection: Collection) {
  editingCollectionId.value = collection.id;
  editingName.value = collection.name;
  nextTick(() => {
    if (renameInput.value && renameInput.value.length > 0) {
      renameInput.value[0]?.focus();
    }
  });
}

async function saveRename(id: number) {
  if (editingCollectionId.value !== id) return;

  if (!editingName.value.trim()) {
    editingCollectionId.value = null;
    return;
  }

  try {
    await store.renameCollection(id, editingName.value);
  } catch (error) {
    console.error('Failed to rename collection:', error);
    alert('Failed to rename collection.');
  } finally {
    editingCollectionId.value = null;
  }
}

defineEmits<{
  (e: 'select', id: number): void;
}>();
</script>

<template>
  <div class="collections-tab">
    <div class="actions">
      <button
        @click="openCreateDialog"
        class="new-collection-btn"
      >
        <Plus :size="20" />
        New Collection
      </button>
    </div>

    <div v-if="collections.length === 0" class="empty-state">
      <div class="empty-icon">
        <Folder class="icon" />
      </div>
      <h3 class="empty-title">
        No collections yet
      </h3>
      <p class="empty-text">
        Create collections to organize your saved words
      </p>
    </div>

    <div v-else class="collections-grid">
      <div
        v-for="collection in collections"
        :key="collection.id"
        class="collection-card"
        @click="$emit('select', collection.id)"
      >
        <div class="card-content">
          <div class="card-info">
            <div v-if="editingCollectionId === collection.id" class="edit-name-container" @click.stop>
                <input 
                    v-model="editingName"
                    @keyup.enter="saveRename(collection.id)"
                    @blur="saveRename(collection.id)"
                    ref="renameInput"
                    class="rename-input"
                />
            </div>
            <div v-else>
              <h3 class="collection-name">
                {{ collection.name }}
              </h3>
              <p class="collection-count">
                {{ collection.wordCount || 0 }} words
              </p>
            </div>
          </div>
          
          <div class="card-actions">
            <button
                @click.stop="startRenaming(collection)"
                class="action-btn edit-btn"
                title="Rename"
            >
                <Pencil :size="24" />
            </button>
            <button
                @click.stop="confirmDelete(collection.id)"
                class="action-btn delete-btn"
                title="Delete"
            >
                <Trash2 :size="24" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <CreateCollectionDialog
      :is-open="showCreateDialog"
      @close="showCreateDialog = false"
      @create="handleCreate"
    />

    <ConfirmDialog
      :is-open="showDeleteDialog"
      title="Delete Collection"
      message="Are you sure you want to delete this collection? This action cannot be undone."
      @close="showDeleteDialog = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<style scoped lang="scss">
@import '../styles/variables';
@import '../styles/mixins';

.collections-tab {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.actions {
  @include flex-center;
  margin-bottom: $spacing-md;
}

.new-collection-btn {
  @include btn-primary;
  border-radius: $radius-full;
}

.new-collection-form {
  background-color: $color-bg-secondary;
  border-radius: $radius-lg;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.form-group {
  display: flex;
  gap: $spacing-sm;
}

.collection-input {
  @include input-base;
  flex: 1;
}

.create-btn {
  @include btn-secondary;
}

.cancel-btn {
  @include btn-secondary;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.empty-icon {
  color: $color-fg-accent-secondary;
  margin-bottom: $spacing-md;
}

.icon {
  width: 6rem;
  height: 6rem;
  margin: 0 auto;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $color-fg-primary;
  margin-bottom: $spacing-sm;
}

.empty-text {
  color: $color-fg-secondary;
}

.collections-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-md;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.collection-card {
  @include card-base;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
}

.card-content {
  @include flex-between;
  align-items: flex-start;
}

.card-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  flex: 1;
}

.folder-icon {
  color: $color-fg-accent-primary;
}

.collection-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: $color-fg-primary;
}

.collection-count {
  font-size: 0.875rem;
  color: $color-fg-secondary;
}

.card-actions {
  display: flex;
  gap: $spacing-sm;
}

.action-btn {
  @include btn-icon;
}

.delete-btn {
  @include btn-danger-icon;
}

.edit-btn {
  @include btn-icon;
}

.edit-name-container {
  flex: 1;
}

.rename-input {
  @include input-base;
  padding: $spacing-xs;
  font-size: 1.25rem;
  font-weight: 600;
  border-color: $color-fg-accent-primary;
}
</style>
