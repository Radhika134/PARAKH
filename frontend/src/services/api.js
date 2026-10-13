import axios from 'axios'

/**
 * api.js — Axios REST client for PARAKH backend.
 *
 * Base URL: /api (proxied to http://localhost:5001 by Vite during dev)
 * All functions return the full Axios response data (not the response wrapper).
 */

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,  // 60 seconds — Tesseract.js may take time on first run
  headers: { 'Content-Type': 'application/json' },
})

/* ─── Health Check ─── */

/** Check if the backend Express server is running. */
export async function getHealth() {
  const res = await api.get('/health')
  return res.data
}

/* ─── Phase 3: OCR + Quality Check ─── */

/**
 * Run a 3-point image quality audit (blur, lighting, framing) on a product label.
 *
 * @param {File} imageFile — the File object from Dropzone or CameraScanner
 * @returns {Promise<QualityAuditResponse>} — { passed, quality_score, metrics, failure_reasons, temp_image_id }
 */
export async function checkImageQuality(imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile, imageFile.name)

  const res = await api.post('/v1/analyze/quality-check', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

/**
 * Extract text from a product label image using Tesseract.js.
 *
 * @param {File} imageFile — the File object from Dropzone or CameraScanner
 * @returns {Promise<OCRResult>} — { success, rawText, words, avgConfidence, wordCount, charCount }
 */
export async function extractOcrText(imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile, imageFile.name)

  const res = await api.post('/v1/analyze/ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

/* ─── Phase 4: Category-Aware Product & Ingredient Extraction ─── */

/**
 * Extract category-aware product information and ingredient list from OCR result.
 *
 * @param {Object} ocrResult — the OCR result object containing rawText & avgConfidence
 * @returns {Promise<{ success: boolean, data: ExtractionResult }>}
 */
export async function extractProductInfo(ocrResult) {
  const res = await api.post('/v1/analyze/extract', { ocrResult })
  return res.data
}


/* ─── Report Endpoints ─── (Phase 8+) ─── */

/**
 * Fetch a saved transparency report by ID.
 * @param {string} reportId
 * Phase 8: GET /api/v1/reports/:id
 */
export function getReport(reportId) {
  // TODO (Phase 8): Implement real API call
  console.warn('getReport: backend not yet wired (Phase 8)')
  return Promise.resolve(null)
}

/* ─── History Endpoints ─── (Phase 8+) ─── */

/**
 * Fetch the user's analysis history list.
 * Phase 8: GET /api/v1/history
 */
export function getHistory() {
  // TODO (Phase 8): Implement real API call
  console.warn('getHistory: backend not yet wired (Phase 8)')
  return Promise.resolve([])
}

/**
 * Delete a history item by report ID.
 * @param {string} reportId
 * Phase 8: DELETE /api/v1/history/:id
 */
export function deleteHistoryItem(reportId) {
  // TODO (Phase 8): Implement real API call
  console.warn('deleteHistoryItem: backend not yet wired (Phase 8)')
  return Promise.resolve({ success: true })
}

export default api
