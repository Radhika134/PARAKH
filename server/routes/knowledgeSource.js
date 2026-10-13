/**
 * knowledgeSource.js — Express router for trusted knowledge source endpoints.
 *
 * Mounted at: /api/v1/knowledge-sources
 */

const express = require('express');
const router = express.Router();
const { listKnowledgeSources, getKnowledgeSource } = require('../controllers/knowledgeSourceController');

// GET /api/v1/knowledge-sources — List regulatory sources or search chunks by keyword
router.get('/', listKnowledgeSources);

// GET /api/v1/knowledge-sources/:id — Fetch knowledge document by ID
router.get('/:id', getKnowledgeSource);

module.exports = router;
