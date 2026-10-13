const retrievalService = require('../services/rag/retrievalService');

/**
 * Perform RAG Retrieval for a given query
 * @route POST /api/v1/rag/retrieve
 */
const retrieve = async (req, res) => {
  try {
    const { query, topK } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const result = await retrievalService.retrieve(query, topK || 5);

    return res.status(200).json({
      success: true,
      query: result.query,
      results: result.results,
      canonicalIngredient: result.canonicalIngredient,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('RAG Retrieval error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during retrieval'
    });
  }
};

module.exports = {
  retrieve
};
