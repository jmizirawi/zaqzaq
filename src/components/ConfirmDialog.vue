<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="isOpen" class="dialog-overlay" @click="close">
        <div class="dialog-content" @click.stop>
          <div class="dialog-header">
            <h3 class="dialog-title">{{ title }}</h3>
            <button @click="$emit('close')" class="close-btn">
              <X :size="20" />
            </button>
          </div>
          <div class="dialog-body">
            <p class="dialog-message">{{ message }}</p>
          </div>

          <div class="dialog-footer">
            <button @click="close" class="btn-cancel">
              Cancel
            </button>
            <button @click="confirm" class="btn-confirm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

function close() {
  emit('close');
}

function confirm() {
  emit('confirm');
}
</script>

<style scoped lang="scss">
@import '../styles/variables';
@import '../styles/mixins';

.btn-cancel {
  @include btn-secondary;
}

.btn-confirm {
  @include btn-primary;
}
</style>
