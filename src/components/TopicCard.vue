
<template>
  <div 
    class="topic-card" 
    @click="$emit('click')"
  >
    <div class="icon-container">
      <component :is="iconComponent" :size="24" :stroke-width="1.5" />
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
  padding: $spacing-md;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 80px;
  position: relative;
  overflow: hidden;
  background-color: $color-bg-secondary;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-md;
  }
}

.icon-container {
  margin-bottom: $spacing-sm;
}

.title {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-sm;
}

.count {
  font-size: $font-size-sm;
  opacity: 0.8;
}
</style>
