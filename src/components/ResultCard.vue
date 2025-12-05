<template>
  <div class="result-card">
    <div class="card-content">
      <div class="bookmark-container">
        <button @click="handleBookmarkClick" class="bookmark-btn">
          <BookmarkCheck v-if="isSaved" class="icon filled" :size="24" />
          <Bookmark v-else class="icon" :size="24" />
        </button>
      </div>

      <div class="word-info">

        <div class="tags-container">
          <span class="tag">{{ getReadableAnalysis(result.analysis) }}</span>
          <span v-if="result.notes" class="tag">{{ result.notes }}</span>
        </div>

        <h3 class="term" dir="rtl">
          {{ result.term }}
        </h3>
        
        <h4 class="definition" dir="ltr">
          {{ result.definition }} 
        </h4>

        <div class="detail-section" v-if="result.exampleSentence">
            <p class="detail-label">Example</p>
            <p class="detail-value" dir="rtl">
              {{ result.exampleSentence }}
            </p>
        </div>

        <button @click="showDetails = !showDetails" class="details-toggle">
          {{ showDetails ? 'Hide Details' : 'Show Details' }}
        </button>

        <div v-if="showDetails" class="details-grid">

          <div v-if="result.source" class="detail-section">
            <span class="detail-label">Source</span>
            <span class="detail-value">{{ result.source }}</span>
          </div>

          <div class="detail-section" v-if="result.glossMsa">
            <p class="detail-label">MSA</p>
            <p class="detail-value"dir="rtl">{{ result.glossMsa }}</p>
          </div>

          <div class="detail-section">
            <span class="detail-label">Root</span>
            <span v-if="result.root" class="detail-value">{{ result.root }}</span>
            <span v-if="result.rootNtws" class="detail-value">{{ result.rootNtws }}</span>
          </div>

        </div>

        <!-- 

        <div v-if="showDetails" class="details-grid">
          <div class="detail-item">
            <span class="detail-label">ID</span>
            <span class="detail-value">{{ result.id }}</span>
          </div>

          <div v-if="result.root1" class="detail-item">
            <span class="detail-label">ROOT_1</span>
            <span class="detail-value">{{ result.root1 }}</span>
          </div>
          <div v-if="result.lemma" class="detail-item">
            <span class="detail-label">LEMMA</span>
            <span class="detail-value">{{ result.lemma }}</span>
          </div>
          <div v-if="result.lemmaSearch" class="detail-item">
            <span class="detail-label">LEMMA_SEARCH</span>
            <span class="detail-value">{{ result.lemmaSearch }}</span>
          </div>
          <div v-if="result.lemmaBw" class="detail-item">
            <span class="detail-label">LEMMA_BW</span>
            <span class="detail-value">{{ result.lemmaBw }}</span>
          </div>
          <div v-if="result.formBw" class="detail-item">
            <span class="detail-label">FORM_BW</span>
            <span class="detail-value">{{ result.formBw }}</span>
          </div>
          <div v-if="result.analysis" class="detail-item">
            <span class="detail-label">ANALYSIS</span>
            <span class="detail-value">{{ result.analysis }}</span>
          </div>
          <div v-if="result.glossMsa" class="detail-item">
            <span class="detail-label">GLOSS_MSA</span>
            <span class="detail-value">{{ result.glossMsa }}</span>
          </div>
          <div v-if="result.notes" class="detail-item">
            <span class="detail-label">NOTES</span>
            <span class="detail-value"></span>
          </div>
          <div v-if="result.annotator" class="detail-item">
            <span class="detail-label">ANNOTATOR</span>
            <span class="detail-value">{{ result.annotator }}</span>
          </div>
        </div> -->
      </div>
    </div>

    <AddToCollectionDialog
      v-if="showCollectionDialog"
      :word-id="result.id"
      :initial-collection-ids="currentCollections"
      @close="showCollectionDialog = false"
      @save="handleSaveToCollections"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Bookmark, BookmarkCheck } from 'lucide-vue-next';
import { SearchResult } from '../types';
import AddToCollectionDialog from './AddToCollectionDialog.vue';
import { useDictionaryStore } from '../stores/dictionaryStore';
import { getReadableAnalysis } from '../utils/analysisMapping';

const props = defineProps<{
  result: SearchResult;
  isSaved: boolean;
}>();

const store = useDictionaryStore();
const showDetails = ref(false);
const showCollectionDialog = ref(false);
const currentCollections = ref<number[]>([]);

async function handleBookmarkClick() {
  if (props.isSaved) {
    // If already saved, fetch current collections to pre-select
    const collections = await store.getCollectionsForWord(props.result.id);
    currentCollections.value = collections.map(c => c.id);
  } else {
    currentCollections.value = [];
  }
  showCollectionDialog.value = true;
}

async function handleSaveToCollections(collectionIds: number[]) {
  try {
    await store.saveWord(props.result, collectionIds);
    showCollectionDialog.value = false;
  } catch (error) {
    console.error('Failed to save word to collections:', error);
  }
}
</script>

<style scoped lang="scss">
@import '../styles/variables';
@import '../styles/mixins';

.result-card {
  @include card-base;
  background: linear-gradient(to bottom right, $color-card-background, #F2F2ED);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  margin-bottom: $spacing-lg;
  direction: rtl;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: row-reverse;
}

.bookmark-container {
  flex-shrink: 0;
}

.bookmark-btn {
  @include btn-icon;
  color: $color-text-tertiary;

  &:hover {
    color: $color-brand;
  }

  .filled {
    color: $color-brand;
  }
}

.word-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: right;
  overflow-wrap: break-word;
  max-width: 100%;
}

.tags-container {
  margin-bottom: 0.75rem;
}

.tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: $spacing-xs 0.75rem;
  margin-right: $spacing-sm;
  border-radius: $radius-full;
  background-color: rgba(143, 155, 133, 0.15);
  color: #4A5540;
  border: 1px solid rgba(143, 155, 133, 0.2);
}

.term {
  font-size: 2rem;
  font-weight: 700;
  color: $color-text-primary;
  margin-bottom: 0;
  line-height: 1.5;
}

.definition {
  font-size: 1.5rem;
  color: $color-text-primary;
  margin-bottom: $spacing-md;
  line-height: 1.5;
}

.details-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-lg;
  width: 100%;
  margin-top: $spacing-lg;
  padding-top: $spacing-lg;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-section {
  flex: 1 1 calc(33.333% - 1.5rem);
  min-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.detail-label {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: $color-sage;
  text-transform: uppercase;
  text-align: right;
  margin-bottom: $spacing-xs;
}

.detail-value {
  font-size: 1.1rem;
  color: #2D2D2D;
  text-align: right;
  line-height: 1.6;
}

.details-toggle {
  background: none;
  border: none;
  color: $color-brand;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: $spacing-md;
  padding: 0;
  text-decoration: none;
  
  &:hover {
    color: $color-brand-hover;
  }
}
</style>
