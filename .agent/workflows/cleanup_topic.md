---
description: Thoroughly clean up and semantically organize a single vocabulary topic
---

When the user asks to clean up a specific vocabulary topic in `topics.yaml` (e.g. "Clean up the Body Parts topic"), perform the following steps sequentially to ensure a thorough job:

1. **Fetch Current Topic Data**: 
   - Read `src/data/topics.yaml` to find the target topic and its current `wordIds`.
   - Query the dictionary database (`src-tauri/resources/arabic-dictionary.db`) to retrieve the `LEMMA`, `FORM`, and `GLOSS` for these words.

2. **Frequency Analysis & Obscure Pruning**:
   - Determine the frequency of the topic's words (using previous frequency scripts or contextual analysis).
   - Remove any absolutely duplicate `wordId`s.
   - Remove words that are hyper-obscure (e.g. absolute 0 frequency) unless they are absolutely critical to the topic.

3. **Contextual Pruning (Homonym Check)**:
   - Carefully review the English `GLOSS` of every word specifically in the context of the topic's title.
   - Remove words that are mistranslated homonyms (e.g., if the topic is "Directions", remove "right" if its gloss means "correct", or if the topic is "Physical States", remove "cold" if its gloss means "illness").

4. **Add Missing Words**:
   - Query the database for other high-frequency words that share the semantic space of the topic but are currently missing.
   - Add the `wordId`s of these missing foundational words to the topic's list.
   - For all words in the topic that typically have a plural form, ensure the plural form is also added if it is missing.
   - For the verbs, ensure the perfect and imperfect form are added if it is missing.

5. **Semantic Sorting**:
   - **Logical Order**: If the topic has an inherent sequence (e.g., numbers chronologically, days of the week, time units by duration), explicitly order the words to follow that logical path.
   - **Synonym Clustering**: For all other topics, group words with the exact same core English meaning so that synonyms sit next to each other.
   - **Basic to Complex**: Rank these synonym clusters from the most basic/frequently used concepts to the more complex/rare concepts.
   - **Intra-cluster Sorting**: Within each synonym cluster, place the more commonly used Arabic term at the top.

6. **Update `topics.yaml`**:
   - Replace the old list of `wordIds` for this topic in `src/data/topics.yaml` with the newly refined, pruned, and sorted list. Ensure the YAML structure is perfectly preserved.

7. **Verify & Build**:
   - Run `npm run build` to verify the YAML formatting is correct and the application builds successfully.