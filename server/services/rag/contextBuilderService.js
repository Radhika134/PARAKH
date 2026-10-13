class ContextBuilderService {
  /**
   * Formats retrieved RAG chunks into structured context blocks for LLM reasoning
   * @param {Array} retrievedChunks - Array of chunks returned by retrievalService
   * @param {Object} canonicalIngredient - The MongoDB canonical ingredient (if any)
   * @returns {string} - Formatted context string
   */
  buildContext(retrievedChunks, canonicalIngredient) {
    let contextBuilder = [];

    // Add canonical ingredient information if available
    if (canonicalIngredient) {
      contextBuilder.push('--- CANONICAL DATABASE INGREDIENT INFO ---');
      contextBuilder.push(`Name: ${canonicalIngredient.name}`);
      if (canonicalIngredient.description) {
        contextBuilder.push(`Description: ${canonicalIngredient.description}`);
      }
      if (canonicalIngredient.safety_rating) {
        contextBuilder.push(`General Safety Rating: ${canonicalIngredient.safety_rating}`);
      }
      if (canonicalIngredient.health_effects && canonicalIngredient.health_effects.length > 0) {
        contextBuilder.push(`Known Health Effects: ${canonicalIngredient.health_effects.join(', ')}`);
      }
      if (canonicalIngredient.dietary_flags && canonicalIngredient.dietary_flags.length > 0) {
        contextBuilder.push(`Dietary Flags: ${canonicalIngredient.dietary_flags.join(', ')}`);
      }
      contextBuilder.push('\n');
    }

    // Add retrieved evidence chunks
    if (retrievedChunks && retrievedChunks.length > 0) {
      contextBuilder.push('--- RETRIEVED KNOWLEDGE BASE EVIDENCE ---');
      
      retrievedChunks.forEach((chunk, index) => {
        const meta = chunk.metadata;
        const authority = meta.authority || 'Unknown Authority';
        const title = meta.title || 'Unknown Source';
        const section = meta.section ? ` - ${meta.section}` : '';
        const year = meta.year ? ` (${meta.year})` : '';
        
        contextBuilder.push(`[Source ${index + 1}: ${authority} - ${title}${section}${year}]`);
        if (meta.url) {
          contextBuilder.push(`URL: ${meta.url}`);
        }
        contextBuilder.push(`Excerpt: "${chunk.text}"`);
        // We do not include the similarity score in the final text passed to LLM to avoid confusing it,
        // but it is available in the chunk object.
        contextBuilder.push('\n');
      });
    } else {
      contextBuilder.push('--- RETRIEVED KNOWLEDGE BASE EVIDENCE ---');
      contextBuilder.push('NO SPECIFIC EVIDENCE FOUND IN KNOWLEDGE BASE.');
      contextBuilder.push('\n');
    }

    return contextBuilder.join('\n');
  }
}

const contextBuilderService = new ContextBuilderService();
module.exports = contextBuilderService;
