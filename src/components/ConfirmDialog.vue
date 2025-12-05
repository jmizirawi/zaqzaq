<template>
  <Teleport to="body">
    <div v-if="isOpen" class="dialog-overlay" @click="close">
      <div class="dialog-content" @click.stop>
        <h3 class="dialog-title">{{ title }}</h3>
        <p class="dialog-message">{{ message }}</p>
        
        <div class="dialog-actions">
          <button @click="close" class="btn-cancel">
            Cancel
          </button>
          <button @click="confirm" class="btn-confirm">
            Delete
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

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
  background-color: $color-card-background;
  border-radius: $radius-xl;
  padding: $spacing-xl;
  width: 90%;
  max-width: 400px;
  box-shadow: $shadow-lg;
  animation: slideIn 0.2s ease-out;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: $spacing-sm;
}

.dialog-message {
  color: $color-text-secondary;
  margin-bottom: $spacing-xl;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
}

.btn-cancel {
  @include btn-neutral;
}

.btn-confirm {
  @include btn-base;
  background-color: $color-danger;
  color: white;
  
  &:hover {
    background-color: $color-danger-bg;
  }
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
