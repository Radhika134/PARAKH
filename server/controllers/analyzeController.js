/**
 * analyzeController.js — Business logic for Phase 3 analyze routes.
 *
 * Handles:
 *   POST /api/v1/analyze/quality-check  — image quality audit
 *   POST /api/v1/analyze/ocr            — OCR text extraction
 *
 * Both operations happen within the Express process (no separate runtime).
 * Uses qualityService.js (sharp) and ocrService.js (tesseract.js).
 */

const { runQualityAudit } = require('../services/qualityService');
const { extractText }     = require('../services/ocrService');
const { extractProductAndIngredients } = require('../services/extractionService');

/**
 * postQualityCheck
 *
 * POST /api/v1/analyze/quality-check
 * Accepts: multipart/form-data — field: "image"
 *
 * Runs the 3-point quality audit (sharpness, lighting, framing).
 * Returns QualityAuditResult JSON.
 */
async function postQualityCheck(req, res) {
  if (!req.file) {
    return res.status(400).json({
      error:      true,
      code:       'ERR_NO_IMAGE',
      message:    'No image was provided.',
      suggestion: 'Please upload or capture a product label image first.',
    });
  }

  try {
    const result = await runQualityAudit(req.file.buffer);
    return res.status(200).json(result);

  } catch (err) {
    console.error('[analyzeController] quality check error:', err.message);
    return res.status(500).json({
      error:      true,
      code:       'ERR_QUALITY_FAILED',
      message:    'Quality check encountered an unexpected error.',
      suggestion: 'Please try again with a different image.',
    });
  }
}

/**
 * postOcr
 *
 * POST /api/v1/analyze/ocr
 * Accepts: multipart/form-data — field: "image"
 *
 * Runs preprocessing + Tesseract OCR on the image.
 * Returns OCRResult JSON.
 */
async function postOcr(req, res) {
  if (!req.file) {
    return res.status(400).json({
      error:      true,
      code:       'ERR_NO_IMAGE',
      message:    'No image was provided.',
      suggestion: 'Please upload or capture a product label image first.',
    });
  }

  try {
    const result = await extractText(req.file.buffer);
    return res.status(200).json(result);

  } catch (err) {
    console.error('[analyzeController] OCR error:', err.message);
    return res.status(500).json({
      success:       false,
      error:         true,
      code:          'ERR_OCR_FAILED',
      message:       'Text extraction encountered an unexpected error.',
      suggestion:    'Please try again with a different image.',
      rawText:       '',
      words:         [],
      avgConfidence: 0,
      wordCount:     0,
      charCount:     0,
    });
  }
}

/**
 * postExtract
 *
 * POST /api/v1/analyze/extract
 * Accepts: application/json — body: { ocrResult: {...} } or { rawText: "..." }
 *
 * Processes raw OCR text into category-aware structured product payload.
 * Returns ExtractionResult JSON.
 */
async function postExtract(req, res) {
  try {
    const ocrInput = req.body.ocrResult || req.body;
    if (!ocrInput || (!ocrInput.rawText && typeof ocrInput !== 'string')) {
      return res.status(400).json({
        error: true,
        code: 'ERR_NO_OCR_DATA',
        message: 'No OCR data was provided for extraction.',
        suggestion: 'Please pass OCR result object or rawText string.',
      });
    }

    const extractionResult = extractProductAndIngredients(ocrInput);
    return res.status(200).json({
      success: true,
      data: extractionResult,
    });
  } catch (err) {
    console.error('[analyzeController] Extraction error:', err.message);
    return res.status(500).json({
      error: true,
      code: 'ERR_EXTRACTION_FAILED',
      message: 'Product and ingredient extraction encountered an unexpected error.',
      suggestion: 'Ensure valid OCR text is provided and try again.',
    });
  }
}

module.exports = { postQualityCheck, postOcr, postExtract };

