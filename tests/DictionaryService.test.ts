import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DictionaryService } from '../src/services/DictionaryService';
import { databaseService } from '../src/services/DatabaseService';

// Mock DatabaseService
vi.mock('../src/services/DatabaseService', () => ({
    databaseService: {
        searchDictionary: vi.fn(),
        initialize: vi.fn(),
    }
}));

describe('DictionaryService', () => {
    const service = new DictionaryService();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should search for English terms', async () => {
        const mockResults = [
            { id: 1, term: 'عامل ايه', definition: 'How are you?', transliteration: '3amel eh', dialect: 'Egyptian' },
            { id: 2, term: 'شلونك', definition: 'How are you?', transliteration: 'shlonak', dialect: 'Gulf' },
            { id: 3, term: 'كيفك', definition: 'How are you?', transliteration: 'kifak', dialect: 'Levantine' },
        ];
        (databaseService.searchDictionary as any).mockResolvedValue(mockResults);

        const results = await service.search('how are you');
        expect(results.length).toBe(3);
        expect(results.some(r => r.dialect === 'Egyptian')).toBe(true);
        expect(databaseService.searchDictionary).toHaveBeenCalledWith('how are you');
    });

    it('should search for car', async () => {
        const mockResults = [
            { id: 5, term: 'سيارة', definition: 'Car', transliteration: 'sayyara', dialect: 'Levantine' },
            { id: 6, term: 'عربية', definition: 'Car', transliteration: '3arabiyya', dialect: 'Egyptian' },
        ];
        (databaseService.searchDictionary as any).mockResolvedValue(mockResults);

        const results = await service.search('car');
        expect(results.length).toBe(2);
        expect(results.some(r => r.term === 'عربية')).toBe(true);
    });

    it('should return empty array for no match', async () => {
        (databaseService.searchDictionary as any).mockResolvedValue([]);
        const results = await service.search('nonexistentword12345');
        expect(results.length).toBe(0);
    });

    it('should search by transliteration', async () => {
        const mockResults = [
            { id: 1, term: 'عامل ايه', definition: 'How are you?', transliteration: '3amel eh', dialect: 'Egyptian' },
        ];
        (databaseService.searchDictionary as any).mockResolvedValue(mockResults);

        const results = await service.search('3amel eh');
        expect(results.length).toBe(1);
        expect(results[0].dialect).toBe('Egyptian');
    });

    it('should return all supported dialects', async () => {
        const dialects = await service.getDialects();
        expect(dialects).toContain('Egyptian');
        expect(dialects).toContain('Levantine');
        expect(dialects).toContain('Gulf');
        expect(dialects).toContain('Maghrebi');
        expect(dialects.length).toBe(7);
    });
});
