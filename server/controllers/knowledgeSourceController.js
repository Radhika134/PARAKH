/**
 * knowledgeSourceController.js — Controller handlers for trusted knowledge source APIs.
 */

const { getKnowledgeSources, getKnowledgeSourceById, findChunksByKeyword } = require('../services/knowledgeSourceDbService');

/**
 * GET /api/v1/knowledge-sources
 */
async function listKnowledgeSources(req, res) {
  try {
    const authority = req.query.authority || null;
    const keyword = req.query.keyword || null;

    if (keyword) {
      const chunks = await findChunksByKeyword(keyword);
      return res.status(200).json({
        success: true,
        keyword,
        count: chunks.length,
        data: chunks
      });
    }

    const sources = await getKnowledgeSources(authority);
    return res.status(200).json({
      success: true,
      count: sources.length,
      data: sources
    });
  } catch (err) {
    console.error('[knowledgeSourceController] Error listing knowledge sources:', err.message);
    return res.status(500).json({
      error: true,
      code: 'ERR_KNOWLEDGE_SOURCES_FAILED',
      message: 'Failed to retrieve trusted knowledge sources.'
    });
  }
}

/**
 * GET /api/v1/knowledge-sources/:id
 */
async function getKnowledgeSource(req, res) {
  try {
    const sourceId = req.params.id;
    const source = await getKnowledgeSourceById(sourceId);

    if (!source) {
      return res.status(404).json({
        error: true,
        code: 'ERR_KNOWLEDGE_SOURCE_NOT_FOUND',
        message: `No knowledge source document found with ID: ${sourceId}`,
        suggestion: 'Verify source ID (e.g., KS-FSSAI-2022-SEC4).'
      });
    }

    return res.status(200).json({
      success: true,
      data: source
    });
  } catch (err) {
    console.error('[knowledgeSourceController] Error fetching knowledge source:', err.message);
    return res.status(500).json({
      error: true,
      code: 'ERR_KNOWLEDGE_SOURCE_FETCH_FAILED',
      message: 'Failed to retrieve knowledge source document.'
    });
  }
}

module.exports = {
  listKnowledgeSources,
  getKnowledgeSource
};
