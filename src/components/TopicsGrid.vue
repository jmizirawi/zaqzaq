
<template>
  <div class="topics-grid">
    <div v-if="store.isLoadingTopics" class="loading">Loading topics...</div>
    <template v-else>
      <div v-for="level in topicLevels" :key="level" class="level-section">
        <h2 class="level-heading">{{ getLevelDisplayName(level) }}</h2>
        <div class="grid">
          <TopicCard 
            v-for="topic in getTopicsByLevel(level)" 
            :key="topic.id" 
            :topic="topic"
            @click="selectTopic(topic)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDictionaryStore } from '../stores/dictionaryStore';
import TopicCard from './TopicCard.vue';
import { Topic } from '../types';

const store = useDictionaryStore();

// Derive unique section names from topics, preserving the YAML file order (via display_order)
const topicLevels = computed(() => {
  const seen = new Set<string>();
  const levels: string[] = [];
  // Topics are already sorted by display_order from the DB query
  for (const t of store.topics as Topic[]) {
    if (!seen.has(t.level)) {
      seen.add(t.level);
      levels.push(t.level);
    }
  }
  return levels;
});

// The level field already contains the full section name from topics.yaml
function getLevelDisplayName(level: string): string {
  return level;
}

// Get topics filtered by level (section name)
function getTopicsByLevel(level: string): Topic[] {
  return store.topics.filter((t: Topic) => t.level === level);
}

function selectTopic(topic: Topic) {
  store.setActiveTopic(topic);
}
</script>

<style scoped lang="scss">
@import '../styles/variables';

.topics-grid {
  width: 100%;
}

.level-section {
  margin-bottom: $spacing-xxl;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.level-heading {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-fg-primary;
  margin: 0 0 $spacing-md 0;
  padding: $spacing-md 0;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: $spacing-md;

  @media (max-width: 359px) {
    grid-template-columns: 1fr;
  }
}

.loading {
  text-align: center;
  color: $color-fg-secondary;
  padding: $spacing-xl;
}
</style>
