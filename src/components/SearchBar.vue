<template>
  <div class="search-container">
    <input
      :value="modelValue"
      @input="handleInput"
      @keyup.enter="handleSearch"
      :placeholder="placeholder || 'Search • ابحث'"
      class="search-input"
      type="search"
      enterkeyhint="search"
      dir="auto"
    />
    <button
      v-if="modelValue"
      @click="handleClear"
      class="clear-button"
    >
      <X :size="24" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';

defineProps<{
  modelValue: string;
  placeholder?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'search': [];
  'clear': [];
}>();

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

function handleSearch() {
  console.log('SearchBar: handleSearch triggered');
  emit('search');
}

function handleClear() {
  emit('update:modelValue', '');
  emit('clear');
}
</script>

<style scoped lang="scss">
@import '../styles/variables';
@import '../styles/mixins';

.search-container {
  margin: 0 auto;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  border-radius: 9999px; // Pill shape
  border: none;
  background-color: $color-bg-input;
  color: $color-fg-primary;
  outline: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;

  &::placeholder {
    color: $color-fg-secondary;
    font-weight: 500;
  }

  &:focus {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
}

.clear-button {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: $color-fg-secondary;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    filter: brightness(1.2);
  }
}
</style>
