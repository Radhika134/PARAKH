/**
 * product.js — Express router for product endpoints.
 *
 * Mounted at: /api/v1/products
 */

const express = require('express');
const router = express.Router();
const { postProduct, getProduct, searchProductsHandler } = require('../controllers/productController');

// GET /api/v1/products/search — Search products
router.get('/search', searchProductsHandler);

// GET /api/v1/products/:id — Fetch product by ID
router.get('/:id', getProduct);

// POST /api/v1/products — Save extracted product document
router.post('/', postProduct);

module.exports = router;
