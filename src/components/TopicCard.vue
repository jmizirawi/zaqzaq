
<template>
  <div 
    class="topic-card" 
    @click="$emit('click')"
  >
    <div class="icon-container">
      <component :is="iconComponent" :size="32" :stroke-width="1.5" />
    </div>
    <div class="content">
      <h3 class="title">{{ topic.title }}</h3>
      <!-- <p class="count" v-if="topic.words">{{ topic.words.length }} words</p> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Topic } from '../types';
import * as LucideIcons from 'lucide-vue-next';

const props = defineProps<{
  topic: Topic;
}>();

defineEmits<{
  (e: 'click'): void
}>();

const iconComponent = computed(() => {
  // Try to find the icon in the Lucide set
  const icon = (LucideIcons as any)[props.topic.icon];
  // Fallback to Sparkles if not found
  return icon || LucideIcons.Sparkles;
});
</script>

<style scoped lang="scss">
@import '../styles/variables';

.topic-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: $spacing-lg;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 160px;
  position: relative;
  overflow: hidden;
  background-color: $color-bg-secondary;

  /* Color variants matching tailwind-ish names from DB seeder but mapping to actual SCSS variables or colors */
  // &.bg-red-100 { background-color: #FEE2E2; color: #991B1B; :deep(svg) { color: #DC2626; } }
  // &.bg-blue-100 { background-color: #DBEAFE; color: #1E40AF; :deep(svg) { color: #2563EB; } }
  // &.bg-green-100 { background-color: #DCFCE7; color: #166534; :deep(svg) { color: #16A34A; } }
  // &.bg-yellow-100 { background-color: #FEF9C3; color: #854D0E; :deep(svg) { color: #CA8A04; } }

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-md;
  }
}

.icon-container {
  margin-bottom: $spacing-md;
}

.title {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-xs;
}

.count {
  font-size: $font-size-sm;
  opacity: 0.8;
}
</style>
