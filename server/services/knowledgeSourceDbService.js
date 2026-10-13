/**
 * knowledgeSourceDbService.js — Trusted Regulatory Knowledge Base Service
 *
 * Manages trusted regulatory documents and research sources from FSSAI, WHO, FDA, PubMed.
 * Preserves source provenance for evidence-backed transparency reports in Phase 6 RAG.
 */

const KnowledgeSource = require('../models/KnowledgeSource');
const { isDbConnected } = require('../config/db');

// In-memory fallback dataset for development when MongoDB is offline
const inMemoryKnowledgeSources = new Map();

/**
 * getKnowledgeSources
 * Returns list of trusted knowledge sources.
 */
async function getKnowledgeSources(authorityFilter = null) {
  if (isDbConnected()) {
    try {
      const query = authorityFilter ? { authority_level: authorityFilter } : {};
      const docs = await KnowledgeSource.find(query).lean();
      return docs;
    } catch (err) {
      console.error('[knowledgeSourceDbService] Fetch error:', err.message);
    }
  }

  const results = [];
  for (const src of inMemoryKnowledgeSources.values()) {
    if (!authorityFilter || src.authority_level === authorityFilter) {
      results.push(src);
    }
  }
  return results;
}

/**
 * getKnowledgeSourceById
 */
async function getKnowledgeSourceById(sourceId) {
  if (!sourceId) return null;

  if (isDbConnected()) {
    try {
      const doc = await KnowledgeSource.findOne({ source_id: sourceId }).lean();
      if (doc) return doc;
    } catch (err) {
      console.error('[knowledgeSourceDbService] Query error:', err.message);
    }
  }

  return inMemoryKnowledgeSources.get(sourceId) || null;
}

/**
 * findChunksByKeyword
 * Searches content_chunks across trusted knowledge sources for a given ingredient keyword.
 * Preserves document provenance (title, section, authority, URL).
 */
async function findChunksByKeyword(keyword) {
  if (!keyword) return [];

  const lowerKw = keyword.toLowerCase().trim();

  if (isDbConnected()) {
    try {
      const sources = await KnowledgeSource.find({
        'content_chunks.ingredient_keyword': { $regex: lowerKw, $options: 'i' }
      }).lean();

      const matchedChunks = [];
      for (const src of sources) {
        for (const chunk of src.content_chunks || []) {
          if (chunk.ingredient_keyword && chunk.ingredient_keyword.toLowerCase().includes(lowerKw)) {
            matchedChunks.push({
              chunk_id: chunk.chunk_id,
              text: chunk.text,
              domain: chunk.domain,
              authority: src.authority_level,
              source_title: src.title,
              section: src.section,
              publication_year: src.publication_year,
              url: src.url
            });
          }
        }
      }
      return matchedChunks;
    } catch (err) {
      console.error('[knowledgeSourceDbService] Chunk search error:', err.message);
    }
  }

  // Fallback in-memory query
  const matched = [];
  for (const src of inMemoryKnowledgeSources.values()) {
    for (const chunk of src.content_chunks || []) {
      if (chunk.ingredient_keyword && chunk.ingredient_keyword.toLowerCase().includes(lowerKw)) {
        matched.push({
          chunk_id: chunk.chunk_id,
          text: chunk.text,
          domain: chunk.domain,
          authority: src.authority_level,
          source_title: src.title,
          section: src.section,
          publication_year: src.publication_year,
          url: src.url
        });
      }
    }
  }
  return matched;
}

/**
 * upsertKnowledgeSource
 */
async function upsertKnowledgeSource(data) {
  if (!data || !data.source_id) return null;

  const doc = {
    source_id: data.source_id,
    authority_level: data.authority_level || 'REGULATORY_STANDARD',
    title: data.title,
    section: data.section || 'General Guidelines',
    publication_year: data.publication_year || 2022,
    url: data.url || '',
    content_chunks: data.content_chunks || [],
    created_at: new Date()
  };

  if (isDbConnected()) {
    try {
      const saved = await KnowledgeSource.findOneAndUpdate(
        { source_id: data.source_id },
        doc,
        { upsert: true, new: true, runValidators: true }
      );
      return saved.toObject();
    } catch (err) {
      console.error('[knowledgeSourceDbService] Upsert error:', err.message);
    }
  }

  inMemoryKnowledgeSources.set(doc.source_id, doc);
  return doc;
}

module.exports = {
  getKnowledgeSources,
  getKnowledgeSourceById,
  findChunksByKeyword,
  upsertKnowledgeSource
};
