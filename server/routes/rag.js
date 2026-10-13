const express = require('express');
const router = express.Router();
const ragController = require('../controllers/ragController');

// POST /api/v1/rag/retrieve
router.post('/retrieve', ragController.retrieve);

module.exports = router;
