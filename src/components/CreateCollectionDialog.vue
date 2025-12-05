<template>
  <Teleport to="body">
    <div v-if="isOpen" class="dialog-overlay" @click.self="close">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3 class="dialog-title">Create New Collection</h3>
          <button @click="close" class="close-btn">
            <X :size="20" />
          </button>
        </div>

        <div class="dialog-body">
          <div class="form-group">
            <input
              v-model="collectionName"
              placeholder="Collection name"
              class="collection-input"
              @keyup.enter="handleCreate"
              ref="inputRef"
            />
          </div>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>

        <div class="dialog-footer">
          <button @click="close" class="cancel-btn">Cancel</button>
          <button
            @click="handleCreate"
            class="create-btn"
            :disabled="!collectionName.trim()"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { X } from 'lucide-vue-next';
import { useDictionaryStore } from '../stores/dictionaryStore';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create', name: string): void;
}>();

const store = useDictionaryStore();
const collectionName = ref('');
const errorMessage = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    collectionName.value = '';
    errorMessage.value = '';
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});

async function handleCreate() {
  if (!collectionName.value.trim()) return;

  try {
    await store.createCollection(collectionName.value);
    emit('create', collectionName.value);
    close();
  } catch (error) {
    console.error('Failed to create collection:', error);
    errorMessage.value = 'Failed to create collection. Name may already exist.';
  }
}

function close() {
  emit('close');
}
</script>

<style scoped lang="scss">
@import '../styles/variables';
@import '../styles/mixins';

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
  backdrop-filter: blur(4px);
}

.dialog-content {
  background-color: $color-background;
  border-radius: $radius-lg;
  width: 90%;
  max-width: 400px;
  box-shadow: $shadow-lg;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
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

.form-group {
  margin-bottom: $spacing-sm;
}

.collection-input {
  @include input-base;
  padding: $spacing-md;
  font-size: 1rem;
}

.error-message {
  color: $color-danger;
  font-size: 0.875rem;
  margin-top: $spacing-sm;
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

.create-btn {
  @include btn-primary;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
