/**
 * analyze.js — Express router for product analysis endpoints.
 *
 * Mounted at: /api/v1/analyze
 *
 * Routes:
 *   POST /quality-check  → postQualityCheck controller
 *   POST /ocr            → postOcr controller
 */

const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const { postQualityCheck, postOcr, postExtract } = require('../controllers/analyzeController');

/**
 * wrapMulter — wraps multer.single() in a promise so Express 5
 * async routes get proper error forwarding.
 * 
 * @param {string} fieldName — the multipart form field name
 */
function wrapMulter(fieldName) {
  const middleware = upload.single(fieldName);
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          error: true,
          code: 'ERR_INVALID_IMAGE',
          message: err.message || 'Invalid image file.',
          suggestion: 'Please upload a valid JPG, PNG, or WebP image under 15 MB.',
        });
      }
      next();
    });
  };
}

/**
 * POST /api/v1/analyze/quality-check
 *
 * Accepts a product label image and runs the 3-point OpenCV quality audit
 * via the Python AI sidecar (blur, lighting, framing).
 *
 * Request: multipart/form-data  field: "image" (JPG/PNG/WebP)
 * Response: QualityAuditResponse JSON
 */
router.post('/quality-check', wrapMulter('image'), postQualityCheck);

/**
 * POST /api/v1/analyze/ocr
 *
 * Accepts a product label image and runs EasyOCR text extraction
 * via the Python AI sidecar.
 *
 * Request: multipart/form-data  field: "image" (JPG/PNG/WebP)
 * Response: OCRResult JSON
 */
router.post('/ocr', wrapMulter('image'), postOcr);

/**
 * POST /api/v1/analyze/extract
 *
 * Phase 4 — Product & Ingredient Extraction.
 * Converts raw OCR text into category-aware clean structured product info.
 *
 * Request: application/json  body: { ocrResult: {...} }
 * Response: { success: true, data: ExtractionResult }
 */
router.post('/extract', postExtract);

module.exports = router;

