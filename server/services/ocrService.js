/**
 * ocrService.js — OCR Text Extraction for PARAKH
 *
 * Technology: tesseract.js — the JavaScript port of Tesseract OCR.
 * Tesseract is explicitly listed as an approved OCR engine in:
 *   - OCR_VISION_PIPELINE.md: "Run EasyOCR / Tesseract Reader"
 *   - SYSTEM_ARCHITECTURE.md: "OCR Module: EasyOCR / Tesseract OCR"
 *   - PROJECT_IMPLEMENTATION_HANDBOOK.md Tech Stack: "EasyOCR / Tesseract"
 *
 * Preprocessing steps (from OCR_VISION_PIPELINE.md Step 2):
 *   1. Grayscale conversion    — done via sharp
 *   2. Contrast enhancement    — sharp linear adjustment
 *   3. Resize if too small     — ensures OCR has enough resolution
 *
 * Note: Bilateral filter and adaptive thresholding from the pipeline doc are
 * OpenCV-specific. Sharp provides equivalent contrast/sharpening operations.
 */

const { createWorker } = require('tesseract.js');
const sharp = require('sharp');

// Minimum OCR confidence to consider the result reliable (0–100 scale)
const LOW_CONFIDENCE_WARNING = 60;

// Minimum word count to consider extraction a success
const MIN_WORD_COUNT = 3;

/**
 * preprocessImage
 *
 * Applies OCR-optimized preprocessing using sharp.
 * Returns a Buffer (PNG, lossless) ready for Tesseract.
 *
 * @param {Buffer} imageBuffer — raw image bytes
 * @returns {Promise<Buffer>}
 */
async function preprocessImage(imageBuffer) {
  const meta = await sharp(imageBuffer).metadata();
  const currentWidth = meta.width || 800;

  // Ensure minimum 1000px width for better OCR accuracy
  const targetWidth = currentWidth < 1000 ? 1000 : currentWidth;

  const processed = await sharp(imageBuffer)
    .resize(targetWidth, null, { withoutEnlargement: false })
    .grayscale()
    .linear(1.3, -10)        // mild contrast boost
    .sharpen({ sigma: 1.0 }) // edge sharpening for clearer text
    .png()                   // lossless — preferred for OCR
    .toBuffer();

  return processed;
}

/**
 * extractText
 *
 * Main OCR entry point. Preprocesses the image, runs Tesseract.js,
 * and returns a structured result for Phase 4 consumption.
 *
 * @param {Buffer} imageBuffer — raw image bytes from multer
 * @returns {Promise<OcrResult>}
 *
 * OcrResult:
 * {
 *   success:       boolean,
 *   rawText:       string,        — full extracted text stream
 *   wordCount:     number,
 *   charCount:     number,
 *   avgConfidence: number,        — Tesseract overall confidence (0-100)
 *   lowConfidence: boolean,       — true if < 60%
 *   error:         string|null,
 * }
 */
async function extractText(imageBuffer) {
  let worker = null;

  try {
    // Step 1: Preprocess for better OCR
    const preprocessed = await preprocessImage(imageBuffer);

    // Step 2: Create Tesseract worker (English)
    worker = await createWorker('eng', 1, {
      logger: () => {},  // suppress progress logs
    });

    // Step 3: Run OCR
    const { data } = await worker.recognize(preprocessed);

    const rawText = (data.text || '').trim();
    const confidence = typeof data.confidence === 'number' ? Math.round(data.confidence) : 0;
    const wordCount = rawText.split(/\s+/).filter(w => w.length > 0).length;

    // No text found
    if (!rawText || wordCount < MIN_WORD_COUNT) {
      return {
        success:       false,
        rawText:       '',
        wordCount:     0,
        charCount:     0,
        avgConfidence: confidence,
        lowConfidence: true,
        error: 'No readable text was found in this image. Ensure the label is clearly visible and well-lit.',
      };
    }

    const lowConfidence = confidence < LOW_CONFIDENCE_WARNING;

    return {
      success:       true,
      rawText,
      wordCount,
      charCount:     rawText.length,
      avgConfidence: confidence,
      lowConfidence,
      error:         null,
    };

  } catch (err) {
    console.error('[ocrService] Tesseract error:', err.message);
    return {
      success:       false,
      rawText:       '',
      wordCount:     0,
      charCount:     0,
      avgConfidence: 0,
      lowConfidence: true,
      error: 'OCR processing failed. Please try a clearer image.',
    };
  } finally {
    if (worker) {
      await worker.terminate().catch(() => {});
    }
  }
}

module.exports = { extractText };
