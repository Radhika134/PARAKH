import { createContext, useContext, useState } from 'react'

/**
 * AnalysisContext
 * Holds the state for the active product analysis flow.
 *
 * Fields:
 *   uploadedImage   — the File object selected or captured by the user (or null)
 *   imagePreviewUrl — blob URL string for displaying the image in UI (or null)
 *   qualityResult   — quality-check result object from backend (or null) [Phase 3]
 *   ocrResult       — OCR extraction result from backend (or null) [Phase 3]
 *   currentReport   — the final AI-generated report (or null) [Phase 7]
 */

const AnalysisContext = createContext(null)

export function AnalysisProvider({ children }) {
  const [uploadedImage,    setUploadedImage]    = useState(null)
  const [imagePreviewUrl,  setImagePreviewUrl]  = useState(null)
  const [qualityResult,    setQualityResult]    = useState(null)
  const [ocrResult,        setOcrResult]        = useState(null)   // Phase 3
  const [extractionResult, setExtractionResult] = useState(null)   // Phase 4
  const [currentReport,    setCurrentReport]    = useState(null)

  /**
   * setImageInput — convenience function that sets both the File and its
   * preview blob URL together. This keeps the two values in sync.
   *
   * @param {File}   file       - The selected/captured File object
   * @param {string} previewUrl - Blob URL (from URL.createObjectURL)
   */
  function setImageInput(file, previewUrl) {
    // Revoke the old preview URL to avoid memory leaks
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    setUploadedImage(file)
    setImagePreviewUrl(previewUrl)
  }

  /**
   * clearImageInput — remove the selected image and clean up the blob URL.
   */
  function clearImageInput() {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    setUploadedImage(null)
    setImagePreviewUrl(null)
  }

  /**
   * resetAnalysis — full reset when the user starts a brand-new scan.
   */
  function resetAnalysis() {
    clearImageInput()
    setQualityResult(null)
    setOcrResult(null)
    setExtractionResult(null)
    setCurrentReport(null)
  }

  const value = {
    // Image input (set by Dropzone or CameraScanner)
    uploadedImage,
    imagePreviewUrl,
    setImageInput,
    clearImageInput,

    // Legacy setter (kept for backwards compatibility with QualityCheckPage Phase 1)
    setUploadedImage,

    // Quality check result (set in Phase 3)
    qualityResult,
    setQualityResult,

    // OCR result (set in Phase 3)
    ocrResult,
    setOcrResult,

    // Extraction result (set in Phase 4)
    extractionResult,
    setExtractionResult,

    // Final report (set in Phase 7)
    currentReport,
    setCurrentReport,

    // Full reset
    resetAnalysis,
  }


  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  )
}

// Custom hook — components import this instead of useContext + AnalysisContext
export function useAnalysis() {
  return useContext(AnalysisContext)
}
