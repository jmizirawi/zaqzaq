import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Word, Collection, Topic } from '../types';
import { databaseService } from '../services/DatabaseService';

export const useDictionaryStore = defineStore('dictionary', () => {
    // State
    const searchResults = ref<Word[]>([]);
    const savedWords = ref<Word[]>([]);
    const collections = ref<Collection[]>([]);
    const topics = ref<Topic[]>([]);
    const activeTopic = ref<Topic | null>(null);
    const topicWords = ref<Word[]>([]);
    const activeCollectionId = ref<number | null>(null);

    const isSearching = ref(false);
    const isLoadingTopics = ref(false);
    const isInitialized = ref(false);

    // Actions
    async function initialize() {
        await databaseService.initialize();
        await loadSavedWords();
        await loadCollections();
        await loadTopics();
        isInitialized.value = true;
    }

    async function search(query: string) {
        // console.log('Store: search called with:', query);
        // Clear active topic to show search results
        activeTopic.value = null;

        if (!query.trim()) {
            searchResults.value = [];
            return;
        }

        isSearching.value = true;
        try {
            searchResults.value = await databaseService.searchDictionary(query);
            // console.log('Store: search results count:', searchResults.value.length);
        } catch (error) {
            console.error('Search failed:', error);
            searchResults.value = [];
        } finally {
            isSearching.value = false;
        }
    }

    async function loadSavedWords() {
        try {
            savedWords.value = await databaseService.getSavedWords();
        } catch (error) {
            console.error('Failed to load saved words:', error);
        }
    }

    async function saveWord(word: Word, collectionIds: number[]) {
        try {
            if (collectionIds.length === 0) {
                // If no collections selected, delete the word
                await deleteWord(word.id);
                return;
            }

            // 1. Save the word itself
            await databaseService.saveWord(word);

            // 2. Sync collections
            // Get current collections for this word
            const currentCollections = await databaseService.getCollectionsForWord(word.id);
            const currentIds = currentCollections.map(c => c.id);

            // Add to new collections
            const toAdd = collectionIds.filter(id => !currentIds.includes(id));
            for (const id of toAdd) {
                await databaseService.addWordToCollection(word.id, id);
            }

            // Remove from unselected collections
            const toRemove = currentIds.filter(id => !collectionIds.includes(id));
            for (const id of toRemove) {
                await databaseService.removeWordFromCollection(word.id, id);
            }

            // 3. Reload saved words to update UI
            await loadSavedWords();
        } catch (error) {
            console.error('Failed to save word:', error);
            throw error;
        }
    }

    async function deleteWord(wordId: number) {
        try {
            await databaseService.deleteWord(wordId);
            await loadSavedWords();
        } catch (error) {
            console.error('Failed to delete word:', error);
            throw error;
        }
    }

    // Collections
    async function loadCollections() {
        try {
            collections.value = await databaseService.getCollections();
        } catch (error) {
            console.error('Failed to load collections:', error);
        }
    }

    async function createCollection(name: string): Promise<number> {
        try {
            const id = await databaseService.createCollection(name);
            await loadCollections();
            return id;
        } catch (error) {
            console.error('Failed to create collection:', error);
            throw error;
        }
    }

    async function deleteCollection(collectionId: number) {
        try {
            await databaseService.deleteCollection(collectionId);
            await loadCollections();
        } catch (error) {
            console.error('Failed to delete collection:', error);
            throw error;
        }
    }

    async function renameCollection(id: number, name: string) {
        try {
            await databaseService.updateCollection(id, name);
            await loadCollections();
        } catch (error) {
            console.error('Failed to rename collection:', error);
            throw error;
        }
    }

    async function addWordToCollection(wordId: number, collectionId: number) {
        try {
            await databaseService.addWordToCollection(wordId, collectionId);
        } catch (error) {
            console.error('Failed to add word to collection:', error);
            throw error;
        }
    }

    async function removeWordFromCollection(wordId: number, collectionId: number) {
        try {
            await databaseService.removeWordFromCollection(wordId, collectionId);
        } catch (error) {
            console.error('Failed to remove word from collection:', error);
            throw error;
        }
    }

    async function getCollectionsForWord(wordId: number): Promise<Collection[]> {
        try {
            return await databaseService.getCollectionsForWord(wordId);
        } catch (error) {
            console.error('Failed to get collections for word:', error);
            return [];
        }
    }

    async function getWordsInCollection(collectionId: number): Promise<Word[]> {
        try {
            return await databaseService.getWordsInCollection(collectionId);
        } catch (error) {
            console.error('Failed to get words in collection:', error);
            return [];
        }
    }

    // Topics Logic
    async function loadTopics() {
        isLoadingTopics.value = true;
        try {
            topics.value = await databaseService.getTopics();
        } catch (error) {
            console.error('Failed to load topics:', error);
        } finally {
            isLoadingTopics.value = false;
        }
    }

    async function setActiveTopic(topic: Topic | null) {
        activeTopic.value = topic;
        if (topic) {
            isSearching.value = true; // reusing loader state conceptually
            try {
                topicWords.value = await databaseService.getWordsForTopic(topic.id);
            } catch (error) {
                console.error('Failed to load topic words:', error);
                topicWords.value = [];
            } finally {
                isSearching.value = false;
            }
        } else {
            topicWords.value = [];
        }
    }

    function isWordSaved(wordId: number): boolean {
        return savedWords.value.some(w => w.id === wordId);
    }

    async function resetDatabase() {
        try {
            await databaseService.resetDatabase();
            // Reload everything
            await loadSavedWords();
            await loadCollections();
            await loadTopics();
            searchResults.value = [];
        } catch (error) {
            console.error('Failed to reset database:', error);
            throw error;
        }
    }

    return {
        // State
        searchResults,
        savedWords,
        collections,
        topics,
        activeTopic,
        topicWords,
        activeCollectionId,
        isSearching,
        isLoadingTopics,
        isInitialized,

        // Actions
        initialize,
        search,
        saveWord,
        deleteWord,
        loadSavedWords,

        loadCollections,
        createCollection,
        deleteCollection,
        renameCollection,
        addWordToCollection,
        removeWordFromCollection,
        getCollectionsForWord,
        getWordsInCollection,

        loadTopics,
        setActiveTopic,

        isWordSaved,
        resetDatabase,
    };
});
