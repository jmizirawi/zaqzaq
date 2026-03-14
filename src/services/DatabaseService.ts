
import Database from "@tauri-apps/plugin-sql";
import { Collection, Word, Topic } from '../types';
import { exists, remove, stat, readFile, writeFile, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';
import { resolveResource, appDataDir } from '@tauri-apps/api/path';

export class DatabaseService {
    private db: Database | null = null;

    async initialize(): Promise<void> {
        const dbName = 'arabic-dictionary.db';

        try {
            // Check for forced reset flag from previous session
            const forceReset = localStorage.getItem('force_reset_db');
            if (forceReset === 'true') {
                console.log('Force reset flag detected. Attempting to remove database...');
                try {
                    await remove(dbName, { baseDir: BaseDirectory.AppData });
                    console.log('Database removed via force reset.');
                } catch (e) {
                    console.warn('Failed to remove database during force reset:', e);
                }
                await this.copyDatabase(dbName);
                localStorage.removeItem('force_reset_db');
            }

            const dbExists = await exists(dbName, { baseDir: BaseDirectory.AppData });

            if (!dbExists) {
                console.log('Database not found, copying from resources...');
                await this.copyDatabase(dbName);
            } else {
                // Check if the existing database is valid (size check)
                const info = await stat(dbName, { baseDir: BaseDirectory.AppData });
                console.log('Existing DB Size:', info.size);

                // The real database is around 8MB. If it's less than 1MB, it's likely corrupted or empty.
                if (info.size < 1000000) {
                    console.warn(`Database file exists but is too small(${info.size} bytes).Re - copying...`);
                    try {
                        await remove(dbName, { baseDir: BaseDirectory.AppData });
                    } catch (e) {
                        console.warn('Failed to remove existing small DB:', e);
                    }
                    await this.copyDatabase(dbName);
                }
            }

            this.db = await Database.load(`sqlite:${dbName}`);

            // Check if 'data' table exists (the main dictionary table)
            const dataTableExists = await this.db.select<any[]>('SELECT name FROM sqlite_master WHERE type="table" AND name="data"');

            if (dataTableExists.length === 0) {
                console.error('CRITICAL: Data table missing even after initialization checks. Forcing reset...');
                await this.resetDatabase();
                return;
            }

            // Check if data table has content
            const countResult = await this.db.select<Array<{ count: number }>>('SELECT COUNT(*) as count FROM data');
            const count = countResult[0]?.count || 0;
            console.log('Database initialized. Data row count:', count);

            if (count === 0) {
                console.warn('Data table exists but is empty. Forcing reset...');
                await this.resetDatabase();
                return;
            }

            await this.initializeTables();

        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    async resetDatabase(): Promise<void> {
        console.log('Resetting database...');

        if (!this.db) {
            console.warn('Database not initialized, cannot reset');
            return;
        }

        try {
            // Drop all app-created tables
            console.log('Dropping existing tables...');
            await this.db.execute('DROP TABLE IF EXISTS topic_words');
            await this.db.execute('DROP TABLE IF EXISTS topics');
            await this.db.execute('DROP TABLE IF EXISTS word_collections');
            await this.db.execute('DROP TABLE IF EXISTS collections');
            await this.db.execute('DROP TABLE IF EXISTS saved_words');
            console.log('Tables dropped successfully');
        } catch (e) {
            console.error('Failed to drop tables:', e);
            throw e;
        }

        // Recreate tables and seed data
        await this.initializeTables();
        console.log('Database reset complete.');
    }

    private async copyDatabase(dbName: string): Promise<void> {
        try {
            const resourcePath = await resolveResource('resources/arabic-dictionary.db');
            console.log('Reading database from:', resourcePath);
            const data = await readFile(resourcePath);
            console.log('Database file read, size:', data.length);

            // Get the actual app data directory path and ensure it exists
            try {
                const appDataPath = await appDataDir();
                console.log('AppData directory path:', appDataPath);
                // Create the directory using the resolved path
                await mkdir(appDataPath, { recursive: true });
                console.log('AppData directory created/ensured');
            } catch (mkdirError) {
                // Directory might already exist, which is fine
                console.log('mkdir result (may already exist):', mkdirError);
            }

            await writeFile(dbName, data, { baseDir: BaseDirectory.AppData });
            console.log('Database copied successfully');
        } catch (error) {
            console.error('Failed to copy database from resources:', error);
            alert(`Copy failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    private async initializeTables(): Promise<void> {
        if (!this.db) return;

        // Saved words table
        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS saved_words(
    id INTEGER PRIMARY KEY,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    transliteration TEXT NOT NULL,
    dialect TEXT NOT NULL,
    example_sentence TEXT,
    example_sentence_translation TEXT,
    original_term TEXT,
    root TEXT,
    root_ntws TEXT,
    root_1 TEXT,
    lemma TEXT,
    lemma_search TEXT,
    lemma_bw TEXT,
    form_bw TEXT,
    analysis TEXT,
    gloss_msa TEXT,
    notes TEXT,
    source TEXT,
    annotator TEXT,
    saved_at INTEGER NOT NULL
)
        `);

        // Attempt to add missing columns if table already exists (migration)
        const columnsToAdd = [
            'root_ntws', 'root_1', 'lemma_search', 'lemma_bw', 'form_bw', 'analysis', 'annotator'
        ];

        for (const col of columnsToAdd) {
            try {
                await this.db.execute(`ALTER TABLE saved_words ADD COLUMN ${col} TEXT`);
            } catch (e) {
                // Column likely already exists, ignore
            }
        }

        // Create collections table
        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS collections(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
)
    `);

        // Create word_collections table
        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS word_collections(
        word_id INTEGER NOT NULL,
        collection_id INTEGER NOT NULL,
        PRIMARY KEY(word_id, collection_id),
        FOREIGN KEY(word_id) REFERENCES saved_words(id) ON DELETE CASCADE,
        FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE
            FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE
    )
        `);

        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS topics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                icon TEXT NOT NULL,
                color TEXT NOT NULL,
                level TEXT NOT NULL DEFAULT 'Essentials',
                display_order INTEGER DEFAULT 0
            )
        `);

        // Drop topic_words to ensure schema update (added display_order)
        // This table is re-seeded on every sync anyway.
        // But check if we want to preserve anything? No, it's fully derived from topic definitions.
        await this.db.execute('DROP TABLE IF EXISTS topic_words');

        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS topic_words (
                topic_id INTEGER NOT NULL,
                word_id INTEGER NOT NULL,
                display_order INTEGER DEFAULT 0,
                PRIMARY KEY(topic_id, word_id),
                FOREIGN KEY(topic_id) REFERENCES topics(id) ON DELETE CASCADE
            )
        `);

        // Seed/Sync topics
        console.log('Syncing topics from JSON...');
        await this.syncTopics();
    }

    // Comprehensive Topic Seeding & Syncing
    private async syncTopics() {
        if (!this.db) return;

        try {
            // Import topics from external YAML file (nested sections format)
            const topicsData = await import('../data/topics.yaml');
            const sections = topicsData.default as Array<{
                section: string;
                topics: Array<{
                    title: string;
                    icon: string;
                    color?: string;
                    wordIds: number[];
                }>;
            }>;

            // Flatten sections into a flat list of topics with level = section name
            const topics: Array<{
                title: string;
                icon: string;
                color?: string;
                level: string;
                wordIds: number[];
            }> = [];
            for (const section of sections) {
                for (const topic of section.topics) {
                    topics.push({
                        ...topic,
                        level: section.section,
                    });
                }
            }

            console.log(`Syncing ${topics.length} topics across ${sections.length} sections...`);

            let order = 0;
            let successCount = 0;
            for (const topic of topics) {
                try {
                    // console.log(`[${order + 1}/${topics.length}] Syncing topic: ${topic.title}`);

                    // 1. Check if topic exists
                    const existing = await this.db.select<Array<{ id: number }>>(
                        'SELECT id FROM topics WHERE title = $1',
                        [topic.title]
                    );

                    let topicId: number;

                    if (existing.length > 0) {
                        // Update existing topic
                        topicId = existing[0].id;
                        await this.db.execute(
                            'UPDATE topics SET icon = $1, color = $2, level = $3, display_order = $4 WHERE id = $5',
                            [topic.icon || 'HelpCircle', topic.color || '', topic.level || 'Essentials', order, topicId]
                        );
                        // console.log(`  -> Topic updated (ID: ${topicId})`);
                    } else {
                        // Create new topic
                        const result = await this.db.execute(
                            'INSERT INTO topics (title, icon, color, level, display_order) VALUES ($1, $2, $3, $4, $5)',
                            [topic.title, topic.icon || 'HelpCircle', topic.color || '', topic.level || 'Essentials', order]
                        );
                        topicId = result.lastInsertId || 0;
                        console.log(`  -> Topic created with ID: ${topicId}`);
                    }

                    if (!topicId) {
                        console.error(`  -> ERROR: Invalid topicId for topic ${topic.title}. Skipping.`);
                        order++;
                        continue;
                    }

                    // 2. Re-seed words for this topic (Clear and Re-add)
                    // This ensures changes to keywords in JSON are reflected

                    // First, get currently associated words to see if we need to change anything?
                    // actually, unconditional delete/insert is safer for syncing keywords, 
                    // but might differ if we had manual associations (we don't seems like).
                    await this.db.execute('DELETE FROM topic_words WHERE topic_id = $1', [topicId]);

                    // Find words based on IDs - respecting order
                    if (topic.wordIds && topic.wordIds.length > 0) {
                        // Use a transaction or batch insert? For now, simple loop is fine or batch insert.
                        let wordOrder = 0;
                        for (const wordId of topic.wordIds) {
                            try {
                                await this.db.execute(
                                    'INSERT OR IGNORE INTO topic_words (topic_id, word_id, display_order) VALUES ($1, $2, $3)',
                                    [topicId, wordId, wordOrder]
                                );
                                wordOrder++;
                            } catch (err) {
                                console.error(`  -> Failed to insert word ${wordId}:`, err);
                            }
                        }
                    }

                    successCount++;
                    order++;
                } catch (error) {
                    console.error(`Failed to sync topic '${topic.title}':`, error);
                    order++;
                }
            }
            console.log(`Topics sync complete. Processed ${successCount}/${topics.length} topics.`);

            // Clean up topics that are no longer in the YAML file
            const yamlTitles = topics.map(t => t.title);
            if (yamlTitles.length > 0) {
                const allDbTopics = await this.db!.select<Array<{ id: number; title: string }>>(
                    'SELECT id, title FROM topics'
                );
                const staleTopics = allDbTopics.filter(t => !yamlTitles.includes(t.title));
                for (const stale of staleTopics) {
                    console.log(`Removing stale topic: "${stale.title}" (ID: ${stale.id})`);
                    await this.db!.execute('DELETE FROM topic_words WHERE topic_id = $1', [stale.id]);
                    await this.db!.execute('DELETE FROM topics WHERE id = $1', [stale.id]);
                }
                if (staleTopics.length > 0) {
                    console.log(`Removed ${staleTopics.length} stale topic(s).`);
                }
            }

        } catch (error) {
            console.error('Failed to sync topics:', error);
        }
    }

    async saveWord(word: Word): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.execute(
            `INSERT OR REPLACE INTO saved_words
    (id, term, definition, transliteration, dialect, example_sentence, example_sentence_translation, original_term, root, root_ntws, root_1, lemma, lemma_search, lemma_bw, form_bw, analysis, gloss_msa, notes, source, annotator, saved_at)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
            [
                word.id,
                word.term,
                word.definition,
                word.transliteration,
                word.dialect,
                word.exampleSentence || '',
                word.exampleSentenceTranslation || '',
                word.originalTerm || '',
                word.root || '',
                word.rootNtws || '',
                word.root1 || '',
                word.lemma || '',
                word.lemmaSearch || '',
                word.lemmaBw || '',
                word.formBw || '',
                word.analysis || '',
                word.glossMsa || '',
                word.notes || '',
                word.source || '',
                word.annotator || '',
                Date.now()
            ]
        );
    }

    async getSavedWords(): Promise<Word[]> {
        if (!this.db) throw new Error('Database not initialized');

        const results = await this.db.select<Array<{
            id: number;
            term: string;
            definition: string;
            transliteration: string;
            dialect: string;
            example_sentence: string;
            example_sentence_translation: string;
            original_term: string;
            root: string;
            root_ntws: string;
            root_1: string;
            lemma: string;
            lemma_search: string;
            lemma_bw: string;
            form_bw: string;
            analysis: string;
            gloss_msa: string;
            notes: string;
            source: string;
            annotator: string;
        }>>('SELECT * FROM saved_words ORDER BY saved_at DESC');

        return results.map(row => ({
            id: row.id,
            term: row.term,
            definition: row.definition,
            transliteration: row.transliteration,
            dialect: row.dialect as any,
            exampleSentence: row.example_sentence,
            exampleSentenceTranslation: row.example_sentence_translation,
            originalTerm: row.original_term,
            root: row.root,
            rootNtws: row.root_ntws,
            root1: row.root_1,
            lemma: row.lemma,
            lemmaSearch: row.lemma_search,
            lemmaBw: row.lemma_bw,
            formBw: row.form_bw,
            analysis: row.analysis,
            glossMsa: row.gloss_msa,
            notes: row.notes,
            source: row.source,
            annotator: row.annotator
        }));
    }

    async deleteWord(wordId: number): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.execute('DELETE FROM saved_words WHERE id = $1', [wordId]);
    }

    async createCollection(name: string): Promise<number> {
        if (!this.db) throw new Error('Database not initialized');

        console.log('Creating collection with name:', name);

        try {
            const insertResult = await this.db.execute(
                'INSERT OR IGNORE INTO collections (name, created_at) VALUES ($1, $2)',
                [name, Date.now()]
            );
            console.log('Insert result:', insertResult);
        } catch (e) {
            console.error('Insert failed:', e);
            throw e;
        }

        const rows = await this.db.select<Array<{ id: number }>>(
            'SELECT id FROM collections WHERE name = $1',
            [name]
        );
        console.log('Select result:', rows);

        const id = rows[0]?.id || 0;
        console.log('Returning ID:', id);
        return id;
    }

    async getCollections(): Promise<Collection[]> {
        if (!this.db) throw new Error('Database not initialized');

        const results = await this.db.select<Array<{
            id: number;
            name: string;
            created_at: number;
            word_count: number;
        }>>(`
            SELECT c.*, (SELECT COUNT(*) FROM word_collections wc WHERE wc.collection_id = c.id) as word_count 
            FROM collections c 
            ORDER BY created_at DESC
        `);

        return results.map(row => ({
            id: row.id,
            name: row.name,
            createdAt: row.created_at,
            wordCount: row.word_count
        }));
    }

    async deleteCollection(collectionId: number): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        console.log('DatabaseService: Deleting collection with id:', collectionId);
        await this.db.execute('DELETE FROM collections WHERE id = $1', [collectionId]);
        console.log('DatabaseService: Collection deleted');
    }

    async updateCollection(id: number, name: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.execute('UPDATE collections SET name = $1 WHERE id = $2', [name, id]);
    }

    async addWordToCollection(wordId: number, collectionId: number): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.execute(
            'INSERT OR IGNORE INTO word_collections (word_id, collection_id) VALUES ($1, $2)',
            [wordId, collectionId]
        );
    }

    async removeWordFromCollection(wordId: number, collectionId: number): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.execute(
            'DELETE FROM word_collections WHERE word_id = $1 AND collection_id = $2',
            [wordId, collectionId]
        );
    }

    async getWordsInCollection(collectionId: number): Promise<Word[]> {
        if (!this.db) throw new Error('Database not initialized');

        const results = await this.db.select<Array<{
            id: number;
            term: string;
            definition: string;
            transliteration: string;
            dialect: string;
            example_sentence: string;
            example_sentence_translation: string;
            original_term: string;
            root: string;
            root_ntws: string;
            root_1: string;
            lemma: string;
            lemma_search: string;
            lemma_bw: string;
            form_bw: string;
            analysis: string;
            gloss_msa: string;
            notes: string;
            source: string;
            annotator: string;
        }>>(
            `SELECT sw.* FROM saved_words sw
       INNER JOIN word_collections wc ON sw.id = wc.word_id
       WHERE wc.collection_id = $1`,
            [collectionId]
        );

        return results.map(row => ({
            id: row.id,
            term: row.term,
            definition: row.definition,
            transliteration: row.transliteration,
            dialect: row.dialect as any,
            exampleSentence: row.example_sentence,
            exampleSentenceTranslation: row.example_sentence_translation,
            originalTerm: row.original_term,
            root: row.root,
            rootNtws: row.root_ntws,
            root1: row.root_1,
            lemma: row.lemma,
            lemmaSearch: row.lemma_search,
            lemmaBw: row.lemma_bw,
            formBw: row.form_bw,
            analysis: row.analysis,
            glossMsa: row.gloss_msa,
            notes: row.notes,
            source: row.source,
            annotator: row.annotator
        }));
    }

    async getCollectionsForWord(wordId: number): Promise<Collection[]> {
        if (!this.db) throw new Error('Database not initialized');

        const results = await this.db.select<Array<{
            id: number;
            name: string;
            created_at: number;
            word_count: number;
        }>>(
            `SELECT c.* FROM collections c
       INNER JOIN word_collections wc ON c.id = wc.collection_id
       WHERE wc.word_id = $1`,
            [wordId]
        );

        return results.map(row => ({
            id: row.id,
            name: row.name,
            createdAt: row.created_at
        }));
    }

    async searchDictionary(query: string): Promise<Word[]> {
        if (!this.db) throw new Error('Database not initialized');

        const isArabic = /[\u0600-\u06FF]/.test(query);
        const exactQuery = query;
        const startsWithQuery = `${query}%`;
        const containsQuery = `%${query}%`;

        console.log('Searching for:', query);
        console.log('Patterns:', { exactQuery, startsWithQuery, containsQuery });

        let orderByClause = '';
        if (isArabic) {
            // Prioritize LEMMA_SEARCH for Arabic
            orderByClause = `
                ORDER BY 
                CASE WHEN LEMMA_SEARCH = $2 THEN 0 ELSE 1 END,
    CASE WHEN LEMMA_SEARCH LIKE $3 THEN 0 ELSE 1 END,
        CASE WHEN LEMMA_SEARCH LIKE $4 THEN 0 ELSE 1 END,
            LENGTH(LEMMA_SEARCH) ASC
                `;
        } else {
            // Prioritize GLOSS for English
            orderByClause = `
                ORDER BY 
                CASE WHEN GLOSS = $2 THEN 0 ELSE 1 END,
    CASE WHEN GLOSS LIKE $3 THEN 0 ELSE 1 END,
        CASE WHEN GLOSS LIKE $4 THEN 0 ELSE 1 END,
            LENGTH(GLOSS) ASC
            `;
        }

        const results = await this.db.select<Array<{
            ID: string;
            FORM: string;
            GLOSS: string;
            CAPHI__: string;
            EXAMPLE_USAGE: string;
            ROOT: string;
            ROOT_NTWS: string;
            ROOT_1: string;
            LEMMA: string;
            LEMMA_SEARCH: string;
            LEMMA_BW: string;
            FORM_BW: string;
            ANALYSIS: string;
            GLOSS_MSA: string;
            NOTES: string;
            SOURCE: string;
            ANNOTATOR: string;
        }>>(
            `SELECT * FROM data 
       WHERE FORM LIKE $1 
       OR GLOSS LIKE $1 
       OR CAPHI__ LIKE $1
       OR ROOT LIKE $1
       OR LEMMA LIKE $1
       OR LEMMA_SEARCH LIKE $1
       OR GLOSS_MSA LIKE $1
       ${orderByClause}
       LIMIT 50`,
            [containsQuery, exactQuery, startsWithQuery, containsQuery]
        );

        console.log('Search results count:', results.length);


        return results.map(row => {
            const r = row as any;
            return {
                id: parseInt(r.ID || r.id) || 0,
                term: r.FORM || r.form,
                definition: r.GLOSS || r.gloss,
                transliteration: r.CAPHI__ || r.caphi__,
                dialect: 'Palestinian',
                exampleSentence: r.EXAMPLE_USAGE || r.example_usage,
                exampleSentenceTranslation: '',
                originalTerm: '',
                root: r.ROOT || r.root,
                rootNtws: r.ROOT_NTWS || r.root_ntws,
                root1: r.ROOT_1 || r.root_1,
                lemma: r.LEMMA || r.lemma,
                lemmaSearch: r.LEMMA_SEARCH || r.lemma_search,
                lemmaBw: r.LEMMA_BW || r.lemma_bw,
                formBw: r.FORM_BW || r.form_bw,
                analysis: r.ANALYSIS || r.analysis,
                glossMsa: r.GLOSS_MSA || r.gloss_msa,
                notes: r.NOTES || r.notes,
                source: r.SOURCE || r.source,
                annotator: r.ANNOTATOR || r.annotator
            };
        });
    }

    async getTopics(): Promise<Topic[]> {
        if (!this.db) throw new Error('Database not initialized');
        const results = await this.db.select<Array<{ id: number, title: string, icon: string, color: string, level: string }>>('SELECT * FROM topics ORDER BY display_order ASC');
        return results.map(r => ({ ...r, level: r.level || 'Essentials', words: [] }));
    }

    async getWordsForTopic(topicId: number): Promise<Word[]> {
        if (!this.db) throw new Error('Database not initialized');

        // Join with the main dictionary data table
        // Note: The main table is 'data', columns are uppercase usually like CAPHI__, GLOSS etc.
        const results = await this.db.select<any[]>(`
            SELECT d.* FROM data d
            JOIN topic_words tw ON d.ID = tw.word_id
            WHERE tw.topic_id = $1
            ORDER BY tw.display_order ASC
        `, [topicId]);

        return results.map(row => {
            const r = row as any;
            return {
                id: parseInt(r.ID || r.id) || 0,
                term: r.FORM || r.form,
                definition: r.GLOSS || r.gloss,
                transliteration: r.CAPHI__ || r.caphi__,
                dialect: 'Palestinian',
                exampleSentence: r.EXAMPLE_USAGE || r.example_usage,
                exampleSentenceTranslation: '',
                originalTerm: '',
                root: r.ROOT || r.root,
                rootNtws: r.ROOT_NTWS || r.root_ntws,
                root1: r.ROOT_1 || r.root_1,
                lemma: r.LEMMA || r.lemma,
                lemmaSearch: r.LEMMA_SEARCH || r.lemma_search,
                lemmaBw: r.LEMMA_BW || r.lemma_bw,
                formBw: r.FORM_BW || r.form_bw,
                analysis: r.ANALYSIS || r.analysis,
                glossMsa: r.GLOSS_MSA || r.gloss_msa,
                notes: r.NOTES || r.notes,
                source: r.SOURCE || r.source,
                annotator: r.ANNOTATOR || r.annotator
            };
        });
    }
}

export const databaseService = new DatabaseService();
