
<template>
  <div class="topics-grid">
    <div v-if="store.isLoadingTopics" class="loading">
      <div class="spinner"></div>
    </div>
    <template v-else>
      <div v-for="(level, index) in topicLevels" :key="level" class="level-section" :style="{ '--section-index': index }">
        <h2 class="level-heading">{{ getLevelDisplayName(level) }}</h2>
        <div class="grid">
          <TopicCard
            v-for="(topic, cardIndex) in getTopicsByLevel(level)"
            :key="topic.id"
            :topic="topic"
            :style="{ '--card-index': cardIndex }"
            class="topic-card-animated"
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
  animation: fade-up 0.35s ease both;
  animation-delay: calc(var(--section-index) * 60ms);

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
  animation: fade-up 0.35s ease both;
  animation-delay: calc(var(--section-index) * 60ms + 20ms);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: $spacing-md;

  @media (max-width: 359px) {
    grid-template-columns: 1fr;
  }
}

.topic-card-animated {
  animation: fade-up 0.3s ease both;
  animation-delay: calc(var(--section-index) * 60ms + var(--card-index) * 25ms + 50ms);
}

.loading {
  display: flex;
  justify-content: center;
  padding: $spacing-xl;
}

.spinner {
  width: 28px;
  height: 28px;
  border-radius: $radius-full;
  border: 3px solid $color-border;
  border-top-color: $color-fg-accent-primary;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
