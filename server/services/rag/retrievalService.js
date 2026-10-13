const embeddingService = require('./embeddingService');
const vectorStoreService = require('./vectorStoreService');
const Ingredient = require('../../models/Ingredient');

class RetrievalService {
  /**
   * Performs semantic similarity retrieval and hybrid enrichment
   * @param {string} query - The search query (e.g. ingredient name)
   * @param {number} topK - Number of results to return
   * @returns {Object} - The retrieval results and canonical MongoDB data
   */
  async retrieve(query, topK = 5) {
    if (!query || query.trim() === '') {
      return {
        query,
        results: [],
        canonicalIngredient: null,
        metadata: {
          resultCount: 0,
          topK,
          message: 'Empty query provided'
        }
      };
    }

    // 1. Generate query embedding
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // 2. Perform Cosine Similarity search in the vector store
    // Use threshold 0.60 as per Phase 6 rules
    const vectorResults = await vectorStoreService.search(queryEmbedding, topK, 0.60);

    // 3. Perform Hybrid Enrichment: Lookup canonical ingredient in MongoDB
    // We normalize the query for DB search (lowercase, trim)
    const normalizedQuery = query.toLowerCase().trim();
    const canonicalIngredient = await Ingredient.findOne({
      $or: [
        { name: new RegExp(`^${normalizedQuery}$`, 'i') },
        { aliases: new RegExp(`^${normalizedQuery}$`, 'i') }
      ]
    }).lean();

    return {
      query,
      results: vectorResults.map(res => ({
        text: res.text,
        score: res.score,
        metadata: res.metadata
      })),
      canonicalIngredient: canonicalIngredient || null,
      metadata: {
        resultCount: vectorResults.length,
        topK,
        thresholdUsed: 0.60
      }
    };
  }
}

const retrievalService = new RetrievalService();
module.exports = retrievalService;
