export type Dialect = 'Palestinian';

export interface Word {
    id: number;
    term: string; // FORM
    definition: string; // GLOSS
    transliteration: string; // CAPHI++
    dialect: Dialect;
    exampleSentence?: string; // EXAMPLE_USAGE
    exampleSentenceTranslation?: string;
    originalTerm?: string;

    // New fields from Maknuune TSV
    root?: string; // ROOT
    rootNtws?: string; // ROOT_NTWS
    root1?: string; // ROOT_1
    lemma?: string; // LEMMA
    lemmaSearch?: string; // LEMMA_SEARCH
    lemmaBw?: string; // LEMMA_BW
    formBw?: string; // FORM_BW
    analysis?: string; // ANALYSIS
    glossMsa?: string; // GLOSS_MSA
    notes?: string; // NOTES
    source?: string; // SOURCE
    annotator?: string; // ANNOTATOR

    relevance?: number; // Optional relevance score for search results
}

export interface SearchResult extends Word {
    relevance: number;
}



export interface Collection {
    id: number;
    name: string;
    createdAt: number; // Timestamp
    wordCount?: number;
}
