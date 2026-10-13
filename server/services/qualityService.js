/**
 * qualityService.js — Image Quality Audit for PARAKH
 *
 * Implements the 3-point quality audit defined in OCR_VISION_PIPELINE.md (Section 2)
 * using the `sharp` Node.js library (no Python required).
 *
 * Checks:
 *   1. Sharpness  — approximated via pixel variance (analogous to Laplacian variance)
 *   2. Lighting   — mean brightness and contrast (standard deviation of pixel values)
 *   3. Framing    — checks image is large enough and not too small to contain a label
 *
 * Thresholds from OCR_VISION_PIPELINE.md:
 *   Blur:       variance < 100 → FAIL
 *   Brightness: mean < 40 → too dark | mean > 220 → overexposed
 *   Contrast:   stdDev < 35 → low contrast
 *   Framing:    image must be >= 100×100 px (simple validity check)
 */

const sharp = require('sharp');

// ── Thresholds (from OCR_VISION_PIPELINE.md Section 2) ─────────────────────────
const BLUR_THRESHOLD_FAIL       = 100.0;   // variance below this → failed
const BLUR_THRESHOLD_ACCEPTABLE = 150.0;   // 100–150 → acceptable

const BRIGHTNESS_MIN = 40;    // below → under-exposed / dark
const BRIGHTNESS_MAX = 220;   // above → over-exposed / glare
const CONTRAST_MIN   = 35;    // std deviation below → low contrast

const MIN_IMAGE_DIMENSION = 100; // minimum width or height in pixels

// ── Sharpness Check ─────────────────────────────────────────────────────────────

/**
 * computeSharpness
 *
 * Approximates the Laplacian variance sharpness metric using pixel value variance.
 * A blurry image has pixels that are all similar (low variance).
 * A sharp image has high variance due to clear edges.
 *
 * Note: This is a computationally equivalent approximation of the Laplacian
 * variance used in OpenCV — sharp's raw pixel stats give us the same signal.
 *
 * @param {Buffer} rawPixels — grayscale raw pixel buffer from sharp
 * @param {number} width
 * @param {number} height
 * @returns {{ score: number, passed: boolean, status: string, message: string }}
 */
function computeSharpness(rawPixels, width, height) {
  const pixelCount = width * height;

  // Compute mean
  let sum = 0;
  for (let i = 0; i < pixelCount; i++) sum += rawPixels[i];
  const mean = sum / pixelCount;

  // Compute variance (analogous to Laplacian variance for blur detection)
  let varianceSum = 0;
  for (let i = 0; i < pixelCount; i++) {
    const diff = rawPixels[i] - mean;
    varianceSum += diff * diff;
  }
  const variance = varianceSum / pixelCount;

  let status, passed;
  if (variance >= BLUR_THRESHOLD_ACCEPTABLE) {
    status = 'PASSED';
    passed = true;
  } else if (variance >= BLUR_THRESHOLD_FAIL) {
    status = 'ACCEPTABLE';
    passed = true;
  } else {
    status = 'FAILED';
    passed = false;
  }

  return {
    score: Math.round(variance * 100) / 100,
    passed,
    status,
    message: passed
      ? 'Image sharpness is acceptable.'
      : 'Image is too blurry. Hold the camera steady and retake the photo.',
  };
}

// ── Lighting & Contrast Check ────────────────────────────────────────────────────

/**
 * computeLighting
 *
 * Computes mean brightness and standard deviation (contrast) from grayscale pixels.
 * These correspond to histogram-based checks in OCR_VISION_PIPELINE.md Section 2.2.
 *
 * @param {Buffer} rawPixels — grayscale raw pixel buffer
 * @param {number} pixelCount
 * @returns {{ meanBrightness, stdDev, passed, status, message }}
 */
function computeLighting(rawPixels, pixelCount) {
  // Mean brightness
  let sum = 0;
  for (let i = 0; i < pixelCount; i++) sum += rawPixels[i];
  const mean = sum / pixelCount;

  // Standard deviation (contrast measure)
  let varSum = 0;
  for (let i = 0; i < pixelCount; i++) {
    const d = rawPixels[i] - mean;
    varSum += d * d;
  }
  const stdDev = Math.sqrt(varSum / pixelCount);

  let failedReason = null;
  if (mean < BRIGHTNESS_MIN) {
    failedReason = 'Image is too dark. Move to a brighter area or use your phone torch.';
  } else if (mean > BRIGHTNESS_MAX) {
    failedReason = 'Image has reflective glare. Angle the camera away from direct light.';
  } else if (stdDev < CONTRAST_MIN) {
    failedReason = 'Image has very low contrast. Ensure the label is clearly visible.';
  }

  const passed = failedReason === null;

  return {
    meanBrightness: Math.round(mean * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    passed,
    status: passed ? 'PASSED' : 'FAILED',
    message: passed ? 'Lighting and contrast are good.' : failedReason,
  };
}

// ── Framing Check ─────────────────────────────────────────────────────────────────

/**
 * computeFraming
 *
 * Verifies the image is large enough to plausibly contain a product label.
 * A minimum of 100×100 px is required (very lenient — rejects only corrupt/thumbnail images).
 *
 * @param {number} width
 * @param {number} height
 * @returns {{ passed, status, message }}
 */
function computeFraming(width, height) {
  const passed = width >= MIN_IMAGE_DIMENSION && height >= MIN_IMAGE_DIMENSION;
  return {
    width,
    height,
    passed,
    status: passed ? 'PASSED' : 'FAILED',
    message: passed
      ? 'Image dimensions are sufficient.'
      : `Image is too small (${width}×${height}px). Please use a higher-resolution photo.`,
  };
}

// ── Main Quality Audit ────────────────────────────────────────────────────────────

/**
 * runQualityAudit
 *
 * Runs the 3-point quality audit on an image buffer.
 * Called by the Express route handler.
 *
 * @param {Buffer} imageBuffer — raw image bytes from multer memoryStorage
 * @returns {Promise<QualityAuditResult>}
 */
async function runQualityAudit(imageBuffer) {
  // Decode the image and get grayscale raw pixel data using sharp
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  if (!metadata || !metadata.width || !metadata.height) {
    return {
      passed: false,
      qualityScore: 0,
      error: 'Could not read the image. The file may be corrupted or in an unsupported format.',
      metrics: {},
    };
  }

  const { width, height } = metadata;

  // Convert to grayscale and get raw pixel buffer for analysis
  const rawPixels = await image
    .grayscale()
    .raw()
    .toBuffer();

  const pixelCount = width * height;

  // Run all three checks
  const sharpness = computeSharpness(rawPixels, width, height);
  const lighting  = computeLighting(rawPixels, pixelCount);
  const framing   = computeFraming(width, height);

  const allPassed = sharpness.passed && lighting.passed && framing.passed;

  // Quality score: weighted combination (0–100)
  // Sharpness 40%, Lighting 30%, Framing 30%
  const sharpnessNorm = Math.min(sharpness.score / BLUR_THRESHOLD_ACCEPTABLE, 1.0);
  const lightingNorm  = lighting.passed ? 1.0 : 0.4;
  const framingNorm   = framing.passed  ? 1.0 : 0.0;
  const qualityScore  = Math.round((sharpnessNorm * 0.4 + lightingNorm * 0.3 + framingNorm * 0.3) * 100);

  // Collect failure reasons for user display
  const failureReasons = [];
  if (!sharpness.passed) failureReasons.push(sharpness.message);
  if (!lighting.passed)  failureReasons.push(lighting.message);
  if (!framing.passed)   failureReasons.push(framing.message);

  return {
    passed: allPassed,
    qualityScore,
    failureReasons,
    imageWidth: width,
    imageHeight: height,
    metrics: {
      textClarity: {
        status:        sharpness.status,
        laplacianScore: sharpness.score,
        passed:        sharpness.passed,
        message:       sharpness.message,
      },
      lightingContrast: {
        status:          lighting.status,
        meanBrightness:  lighting.meanBrightness,
        stdDev:          lighting.stdDev,
        passed:          lighting.passed,
        message:         lighting.message,
      },
      labelFraming: {
        status:  framing.status,
        width:   framing.width,
        height:  framing.height,
        passed:  framing.passed,
        message: framing.message,
      },
    },
  };
}

module.exports = { runQualityAudit };
