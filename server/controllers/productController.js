/**
 * productController.js — Controller handlers for product database APIs.
 */

const { saveProductPayload, getProductById, searchProducts } = require('../services/productDbService');

/**
 * POST /api/v1/products
 * Persists a Phase 4 extracted product payload into MongoDB.
 */
async function postProduct(req, res) {
  try {
    const { extractionResult, extraData } = req.body;

    if (!extractionResult) {
      return res.status(400).json({
        error: true,
        code: 'ERR_INVALID_PAYLOAD',
        message: 'Missing extractionResult in request body.',
        suggestion: 'Provide structured product payload from Phase 4 extraction.'
      });
    }

    const savedProduct = await saveProductPayload(extractionResult, extraData || {});
    return res.status(201).json({
      success: true,
      data: savedProduct
    });
  } catch (err) {
    console.error('[productController] Error saving product:', err.message);
    return res.status(500).json({
      error: true,
      code: 'ERR_PRODUCT_SAVE_FAILED',
      message: 'Failed to persist product document.',
      suggestion: 'Ensure valid product schema and try again.'
    });
  }
}

/**
 * GET /api/v1/products/:id
 */
async function getProduct(req, res) {
  try {
    const productId = req.params.id;
    const product = await getProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: true,
        code: 'ERR_PRODUCT_NOT_FOUND',
        message: `No product document found with ID: ${productId}`,
        suggestion: 'Verify the product ID and try again.'
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    console.error('[productController] Error fetching product:', err.message);
    return res.status(500).json({
      error: true,
      code: 'ERR_PRODUCT_FETCH_FAILED',
      message: 'Failed to retrieve product document.'
    });
  }
}

/**
 * GET /api/v1/products/search?q=query
 */
async function searchProductsHandler(req, res) {
  try {
    const query = req.query.q || req.query.barcode || '';
    const results = await searchProducts(query);

    return res.status(200).json({
      success: true,
      query,
      count: results.length,
      data: results
    });
  } catch (err) {
    console.error('[productController] Error searching products:', err.message);
    return res.status(500).json({
      error: true,
      code: 'ERR_PRODUCT_SEARCH_FAILED',
      message: 'Product search encountered an error.'
    });
  }
}

module.exports = {
  postProduct,
  getProduct,
  searchProductsHandler
};
