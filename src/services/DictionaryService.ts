import { SearchResult, Dialect } from '../types';
import { databaseService } from './DatabaseService';

export class DictionaryService {
    async search(query: string): Promise<SearchResult[]> {
        if (!query.trim()) return [];

        try {
            const words = await databaseService.searchDictionary(query);
            return words.map(word => ({
                ...word,
                relevance: 1
            }));
        } catch (error) {
            console.error('Search failed:', error);
            return [];
        }
    }

    getDialects(): Dialect[] {
        return ['Palestinian'];
    }
}

export const dictionaryService = new DictionaryService();
