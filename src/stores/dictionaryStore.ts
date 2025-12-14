import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Word, Collection, SearchResult } from '../types';
import { dictionaryService } from '../services/DictionaryService';
import { databaseService } from '../services/DatabaseService';

export const useDictionaryStore = defineStore('dictionary', () => {
    const searchResults = ref<SearchResult[]>([]);
    const savedWords = ref<Word[]>([]);
    const collections = ref<Collection[]>([]);
    const isSearching = ref(false);
    const isInitialized = ref(false);

    async function search(query: string) {
        console.log('Store: search called with:', query);
        if (!query.trim()) {
            searchResults.value = [];
            return;
        }

        isSearching.value = true;
        try {
            searchResults.value = await dictionaryService.search(query);
            console.log('Store: search results count:', searchResults.value.length);
        } catch (error) {
            console.error('Search failed:', error);
            searchResults.value = [];
        } finally {
            isSearching.value = false;
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
            await loadCollections();
        } catch (error) {
            console.error('Failed to save word:', error);
            throw error;
        }
    }

    async function deleteWord(wordId: number) {
        try {
            await databaseService.deleteWord(wordId);
            await loadSavedWords();
            await loadCollections();
        } catch (error) {
            console.error('Failed to delete word:', error);
            throw error;
        }
    }

    async function loadSavedWords() {
        try {
            savedWords.value = await databaseService.getSavedWords();
        } catch (error) {
            console.error('Failed to load saved words:', error);
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

    async function loadCollections() {
        try {
            collections.value = await databaseService.getCollections();
        } catch (error) {
            console.error('Failed to load collections:', error);
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

    function isWordSaved(wordId: number): boolean {
        // A word is considered saved if it exists in the savedWords list.
        // Since we enforce collection membership on save, this implies it's in a collection.
        // However, we might want to verify it has at least one collection if we strictly enforce the rule.
        // For now, existence in saved_words table is the source of truth.
        return savedWords.value.some(w => w.id === wordId);
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

    async function resetDatabase() {
        try {
            await databaseService.resetDatabase();
            // Reload everything
            await loadSavedWords();
            await loadCollections();
            searchResults.value = [];
        } catch (error) {
            console.error('Failed to reset database:', error);
            throw error;
        }
    }

    return {
        searchResults,
        savedWords,
        collections,
        isSearching,
        isInitialized,
        search,
        saveWord,
        deleteWord,
        loadSavedWords,
        createCollection,
        deleteCollection,
        renameCollection,
        loadCollections,
        addWordToCollection,
        removeWordFromCollection,
        isWordSaved,
        getCollectionsForWord,
        getWordsInCollection,
        resetDatabase,
    };
});
