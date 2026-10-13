/**
 * productDbService.js — Database Persistence Service for PARAKH Products
 *
 * Persists Phase 4 extracted product & ingredient payloads into MongoDB.
 * Handles DB connection checks and fallback gracefully.
 */

const Product = require('../models/Product');
const { isDbConnected } = require('../config/db');

// In-memory fallback cache for development when DB is offline
const inMemoryProducts = new Map();

/**
 * generateProductId
 */
function generateProductId() {
  const randomHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
  return `PRD-${Date.now().toString(36).toUpperCase()}-${randomHex}`;
}

/**
 * saveProductPayload
 * Maps Phase 4 extracted payload into Product schema and saves to MongoDB.
 *
 * @param {Object} extractionResult — Phase 4 Extraction Payload
 * @param {Object} extraData — Optional barcode, batch_number, image_url
 * @returns {Promise<Object>} Persisted Product Document
 */
async function saveProductPayload(extractionResult, extraData = {}) {
  const safePayload = extractionResult || {};
  const {
    product = {},
    ingredients = [],
    warnings = [],
    claims = [],
    usage = [],
    nutrition = [],
    allergens = [],
    extractionMetadata = {}
  } = safePayload;

  const productId = extraData.product_id || generateProductId();

  const productDoc = {
    product_id: productId,
    barcode: extraData.barcode || null,
    brand_name: product.brand || null,
    product_name: product.name || 'Unidentified Product',
    domain_category: product.category || 'unknown',
    batch_number: extraData.batch_number || null,
    raw_ocr_text: safePayload.raw_ocr_text || '',
    extracted_ingredients: ingredients.map(ing => ({
      name: ing.name,
      originalText: ing.originalText || ing.name,
      extractionConfidence: ing.extractionConfidence || 75
    })),
    warnings: warnings || [],
    claims: claims || [],
    usage: usage || [],
    nutrition: nutrition || [],
    allergens: allergens || [],
    extraction_metadata: {
      source: extractionMetadata.source || 'ocr',
      ocrConfidence: extractionMetadata.ocrConfidence || 0,
      extractionConfidenceScore: extractionMetadata.extractionConfidenceScore || 0,
      productNameDetected: Boolean(extractionMetadata.productNameDetected),
      brandDetected: Boolean(extractionMetadata.brandDetected),
      categoryDetected: Boolean(extractionMetadata.categoryDetected),
      ingredientsDetected: Boolean(extractionMetadata.ingredientsDetected),
      ingredientsCount: ingredients.length,
      isComplete: Boolean(extractionMetadata.isComplete !== false),
      lowConfidence: Boolean(extractionMetadata.lowConfidence),
      uncertainties: extractionMetadata.uncertainties || []
    },
    image_url: extraData.image_url || null,
    created_at: new Date()
  };

  if (isDbConnected()) {
    try {
      const saved = await Product.findOneAndUpdate(
        { product_id: productId },
        productDoc,
        { upsert: true, new: true, runValidators: true }
      );
      return saved.toObject();
    } catch (err) {
      console.error('[productDbService] MongoDB save error:', err.message);
    }
  }

  // In-memory fallback
  inMemoryProducts.set(productId, productDoc);
  return productDoc;
}

/**
 * getProductById
 */
async function getProductById(productId) {
  if (isDbConnected()) {
    try {
      const doc = await Product.findOne({ product_id: productId }).lean();
      if (doc) return doc;
    } catch (err) {
      console.error('[productDbService] MongoDB query error:', err.message);
    }
  }

  return inMemoryProducts.get(productId) || null;
}

/**
 * searchProducts
 */
async function searchProducts(query) {
  if (!query) return [];

  if (isDbConnected()) {
    try {
      const docs = await Product.find({
        $or: [
          { product_name: { $regex: query, $options: 'i' } },
          { brand_name: { $regex: query, $options: 'i' } },
          { barcode: query }
        ]
      }).limit(20).lean();
      return docs;
    } catch (err) {
      console.error('[productDbService] MongoDB search error:', err.message);
    }
  }

  // In-memory fallback
  const results = [];
  const lowerQuery = query.toLowerCase();
  for (const product of inMemoryProducts.values()) {
    if (
      (product.product_name && product.product_name.toLowerCase().includes(lowerQuery)) ||
      (product.brand_name && product.brand_name.toLowerCase().includes(lowerQuery)) ||
      (product.barcode && product.barcode === query)
    ) {
      results.push(product);
    }
  }
  return results;
}

module.exports = {
  saveProductPayload,
  getProductById,
  searchProducts
};
