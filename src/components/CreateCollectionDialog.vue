<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="isOpen" class="dialog-overlay" @click.self="close">
        <div class="dialog-content">
          <div class="dialog-header">
            <h3 class="dialog-title">Create New Collection</h3>
            <button @click="close" class="close-btn">
              <X :size="24" />
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
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onUnmounted } from 'vue';
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
    document.body.style.overflow = 'hidden';
    nextTick(() => {
      inputRef.value?.focus();
    });
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
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

.form-group {
  margin-bottom: $spacing-sm;
}

.collection-input {
  @include input-base;
}

.error-message {
  color: $color-fg-accent-primary;
  font-size: 0.875rem;
  margin-top: $spacing-sm;
}

.cancel-btn {
  @include btn-secondary;
}

.create-btn {
  @include btn-primary;
}
</style>
