import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import ReticleOverlay from '../components/common/ReticleOverlay'
import ExtractedInfoView from '../components/analyze/ExtractedInfoView'
import { useAnalysis } from '../context/AnalysisContext'
import { checkImageQuality, extractOcrText, extractProductInfo } from '../services/api'


/**
 * QualityCheckPage — Screen S-3
 * Route: /quality-check
 *
 * Phase 3: Connects to real backend quality check + OCR.
 *
 * State machine:
 *   CHECKING_QUALITY → quality check running
 *   QUALITY_FAILED   → quality audit found issues
 *   QUALITY_PASSED   → ready to extract text
 *   RUNNING_OCR      → OCR in progress
 *   OCR_DONE         → text extracted, ready to proceed
 *   ERROR            → backend/network failure
 */

const SCREEN = {
  CHECKING_QUALITY: 'checking_quality',
  QUALITY_FAILED:   'quality_failed',
  QUALITY_PASSED:   'quality_passed',
  RUNNING_OCR:      'running_ocr',
  OCR_DONE:         'ocr_done',
  ERROR:            'error',
}

// ── Reusable quality check row ────────────────────────────────────────────────
function CheckRow({ label, detail, passed, failMessage }) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
      passed
        ? 'bg-emerald-50/50 border-emerald-100'
        : 'bg-red-50/50 border-red-100'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
      }`}>
        {passed ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
        {!passed && failMessage && (
          <p className="text-xs font-medium text-red-600 mt-1.5 leading-relaxed">{failMessage}</p>
        )}
      </div>
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 self-start mt-0.5 ${
        passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
      }`}>
        {passed ? 'Passed' : 'Failed'}
      </span>
    </div>
  )
}

// ── Loading spinner with label ─────────────────────────────────────────────────
function LoadingSpinner({ label, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-brand-600 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
function QualityCheckPage() {
  const navigate = useNavigate()
  const { uploadedImage, imagePreviewUrl, setQualityResult, setOcrResult, setExtractionResult } = useAnalysis()

  const [screen, setScreen]         = useState(SCREEN.CHECKING_QUALITY)
  const [qualityData, setQualityData] = useState(null)
  const [ocrData, setOcrData]       = useState(null)
  const [extractionData, setExtractionData] = useState(null)
  const [isExtracting, setIsExtracting]     = useState(false)
  const [errorMsg, setErrorMsg]     = useState('')
  const [ocrError, setOcrError]     = useState('')  // error shown on quality-passed screen

  // ── On mount: redirect if no image, otherwise run quality check ────────────
  useEffect(() => {
    if (!uploadedImage) {
      navigate('/analyze', { replace: true })
      return
    }
    doQualityCheck()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Quality check ──────────────────────────────────────────────────────────
  async function doQualityCheck() {
    setScreen(SCREEN.CHECKING_QUALITY)
    setQualityData(null)
    setOcrData(null)
    setExtractionData(null)
    setErrorMsg('')
    setOcrError('')

    try {
      const result = await checkImageQuality(uploadedImage)
      setQualityData(result)
      setQualityResult(result)

      setScreen(result.passed ? SCREEN.QUALITY_PASSED : SCREEN.QUALITY_FAILED)
    } catch (err) {
      console.error('[QualityCheckPage] quality check error:', err)
      setErrorMsg(friendlyNetworkError(err))
      setScreen(SCREEN.ERROR)
    }
  }

  // ── OCR & Phase 4 Extraction ────────────────────────────────────────────────
  async function doOcr() {
    setScreen(SCREEN.RUNNING_OCR)
    setOcrError('')
    setExtractionData(null)

    try {
      const result = await extractOcrText(uploadedImage)
      setOcrData(result)
      setOcrResult(result)

      // If OCR succeeded, run Phase 4 Category-Aware Extraction
      if (result && result.success) {
        setIsExtracting(true)
        try {
          const extractedResponse = await extractProductInfo(result)
          if (extractedResponse?.success) {
            setExtractionData(extractedResponse.data)
            setExtractionResult(extractedResponse.data)
          }
        } catch (extractErr) {
          console.error('[QualityCheckPage] Extraction service error:', extractErr)
        } finally {
          setIsExtracting(false)
        }
      }

      setScreen(SCREEN.OCR_DONE)
    } catch (err) {
      console.error('[QualityCheckPage] OCR error:', err)
      // Show error inline without losing the quality-passed state
      setOcrError(friendlyNetworkError(err))
      setScreen(SCREEN.QUALITY_PASSED)
    }
  }


  // ── Error message helper ───────────────────────────────────────────────────
  function friendlyNetworkError(err) {
    if (err?.code === 'ERR_NETWORK' || err?.response?.status === 503) {
      return 'Could not reach the server. Make sure the backend is running and try again.'
    }
    if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
      return 'The request timed out. Try a smaller image or check your connection.'
    }
    const serverMsg = err?.response?.data?.message
    return serverMsg || 'An unexpected error occurred. Please try again.'
  }

  // ── Build quality check rows from backend result ───────────────────────────
  function getCheckRows(data) {
    if (!data?.metrics) return []
    const m = data.metrics
    return [
      {
        id:          'clarity',
        label:       'Image Clarity',
        passed:      m.textClarity?.passed ?? false,
        detail:      m.textClarity?.laplacianScore != null
          ? `Sharpness score: ${m.textClarity.laplacianScore.toFixed(1)} (min: 100)`
          : 'Sharpness check',
        failMessage: m.textClarity?.message,
      },
      {
        id:          'lighting',
        label:       'Lighting & Contrast',
        passed:      m.lightingContrast?.passed ?? false,
        detail:      m.lightingContrast?.meanBrightness != null
          ? `Brightness: ${m.lightingContrast.meanBrightness} · Contrast: ${m.lightingContrast.stdDev}`
          : 'Brightness check',
        failMessage: m.lightingContrast?.message,
      },
      {
        id:          'framing',
        label:       'Image Size & Framing',
        passed:      m.labelFraming?.passed ?? false,
        detail:      m.labelFraming?.width != null
          ? `Image: ${m.labelFraming.width}×${m.labelFraming.height}px`
          : 'Dimension check',
        failMessage: m.labelFraming?.message,
      },
    ]
  }

  const checkRows  = getCheckRows(qualityData)
  const previewUrl = imagePreviewUrl

  // ── Status chip on image ───────────────────────────────────────────────────
  function ImageChip() {
    const chips = {
      [SCREEN.CHECKING_QUALITY]: { label: 'ANALYZING…',     color: 'bg-amber-700/90',  pulse: true  },
      [SCREEN.QUALITY_FAILED]:   { label: 'QUALITY ISSUES', color: 'bg-red-700/90',    pulse: false },
      [SCREEN.QUALITY_PASSED]:   { label: 'LABEL DETECTED', color: 'bg-brand-900/90',  pulse: true  },
      [SCREEN.RUNNING_OCR]:      { label: 'READING TEXT…',  color: 'bg-brand-700/90',  pulse: true  },
      [SCREEN.OCR_DONE]:         { label: 'TEXT EXTRACTED', color: 'bg-brand-900/90',  pulse: false },
      [SCREEN.ERROR]:            { label: 'ERROR',           color: 'bg-slate-700/90',  pulse: false },
    }
    const c = chips[screen] || chips[SCREEN.ERROR]
    return (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className={`${c.color} backdrop-blur-md px-4 py-1.5 rounded-full text-xs text-white font-bold shadow-lg flex items-center gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-white/80 ${c.pulse ? 'animate-pulse' : ''}`} />
          {c.label}
        </div>
      </div>
    )
  }

  // ── Page heading ───────────────────────────────────────────────────────────
  const headings = {
    [SCREEN.CHECKING_QUALITY]: { step: 'Step 2 of 3: Quality Check',    title: 'Checking Image Quality…' },
    [SCREEN.QUALITY_FAILED]:   { step: 'Step 2 of 3: Quality Check',    title: 'Image Quality Issues Found' },
    [SCREEN.QUALITY_PASSED]:   { step: 'Step 2 of 3: Quality Check',    title: 'Image Quality Passed' },
    [SCREEN.RUNNING_OCR]:      { step: 'Step 3 of 3: Text Extraction',  title: 'Extracting Label Text…' },
    [SCREEN.OCR_DONE]:         { step: 'Step 3 of 3: Text Extraction',  title: 'Text Extraction Complete' },
    [SCREEN.ERROR]:            { step: 'Error',                          title: 'Something Went Wrong' },
  }
  const heading = headings[screen] || headings[SCREEN.ERROR]

  return (
    <div className="min-h-screen flex flex-col page-glow">
      <Navbar />

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Back link */}
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-brand-800 transition-colors mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Upload
        </Link>

        {/* Page heading */}
        <div className="mb-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold tracking-wide uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            {heading.step}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {heading.title}
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">
            {screen === SCREEN.CHECKING_QUALITY && 'Evaluating sharpness, lighting, and label visibility…'}
            {screen === SCREEN.QUALITY_FAILED   && 'Your image has issues that may affect accuracy. See details below.'}
            {screen === SCREEN.QUALITY_PASSED   && 'All quality checks passed. Click "Extract Text" to run OCR.'}
            {screen === SCREEN.RUNNING_OCR      && 'Tesseract.js is reading the label text. Please wait…'}
            {screen === SCREEN.OCR_DONE         && (ocrData?.success ? 'Text extracted. Review it below, then proceed.' : 'OCR could not find readable text. Try a clearer image.')}
            {screen === SCREEN.ERROR            && 'A backend error occurred. Make sure the server is running.'}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── Left: Image Preview ── */}
          <div className="space-y-3 animate-slide-up">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 shadow-card border-2 border-white">
              {previewUrl ? (
                <img src={previewUrl} alt="Product label" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-50">
                  <div className="text-center"><div className="text-5xl mb-2">🧴</div><p className="text-xs text-brand-600 font-medium">Product Label</p></div>
                </div>
              )}
              <ReticleOverlay size="lg" />
              <ImageChip />
            </div>

            {/* File info */}
            {uploadedImage && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-medium text-slate-700 truncate">{uploadedImage.name}</span>
                <span className="ml-auto shrink-0 text-slate-400">{(uploadedImage.size / 1024).toFixed(0)} KB</span>
              </div>
            )}
          </div>

          {/* ── Right: Dynamic panel ── */}
          <div className="space-y-4 animate-slide-up">

            {/* ── CHECKING QUALITY ── */}
            {screen === SCREEN.CHECKING_QUALITY && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6">
                <LoadingSpinner
                  label="Running quality checks…"
                  sub="Sharpness · Lighting · Contrast · Framing"
                />
              </div>
            )}

            {/* ── ERROR ── */}
            {screen === SCREEN.ERROR && (
              <div className="bg-white rounded-3xl border border-red-100 shadow-card p-6 space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-red-100 text-red-600 mt-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-red-900">Service Unavailable</p>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">{errorMsg}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link to="/analyze" className="btn-secondary text-sm py-3 flex-1 text-center">← Change Image</Link>
                  <button onClick={doQualityCheck} className="btn-primary text-sm py-3 flex-1">Retry</button>
                </div>
              </div>
            )}

            {/* ── QUALITY FAILED ── */}
            {screen === SCREEN.QUALITY_FAILED && qualityData && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-5">
                {/* Overall badge */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-500 text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-red-900">Quality Score: {qualityData.qualityScore}% — Issues Detected</p>
                    <p className="text-xs text-red-700 mt-0.5">Retake the photo to improve accuracy.</p>
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quality Checklist</p>
                  {checkRows.map(r => <CheckRow key={r.id} {...r} />)}
                </div>

                <div className="flex gap-3 pt-1">
                  <Link to="/analyze" className="btn-primary text-sm py-3 flex-1 text-center">
                    ← Retake Photo
                  </Link>
                  <button onClick={doQualityCheck} className="btn-secondary text-sm py-3 flex-1">
                    Re-check This Image
                  </button>
                </div>
                <p className="disclaimer-banner">⚕️ PARAKH provides general product information only — not medical advice.</p>
              </div>
            )}

            {/* ── QUALITY PASSED ── */}
            {screen === SCREEN.QUALITY_PASSED && qualityData && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-5">
                {/* Overall badge */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-50 border border-brand-200">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-brand-500 text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-brand-900">Quality Score: {qualityData.qualityScore}% — Good to Go</p>
                    <p className="text-xs text-brand-700 mt-0.5">All checks passed. Ready for text extraction.</p>
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quality Checklist</p>
                  {checkRows.map(r => <CheckRow key={r.id} {...r} />)}
                </div>

                {/* OCR error (if previous attempt failed) */}
                {ocrError && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{ocrError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <Link to="/analyze" className="btn-secondary text-sm py-3 flex-1 text-center">← Change Image</Link>
                  <button onClick={doOcr} className="btn-primary text-sm py-3 flex-1">
                    Extract Text
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <p className="disclaimer-banner">⚕️ PARAKH provides general product information only — not medical advice.</p>
              </div>
            )}

            {/* ── RUNNING OCR ── */}
            {screen === SCREEN.RUNNING_OCR && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6">
                <LoadingSpinner
                  label="Extracting text with Tesseract.js…"
                  sub="First run may take 10–20 seconds"
                />
              </div>
            )}

            {/* ── OCR DONE & PHASE 4 EXTRACTION VIEW ── */}
            {screen === SCREEN.OCR_DONE && ocrData && (
              <div className="space-y-6">
                {extractionData ? (
                  <ExtractedInfoView
                    data={extractionData}
                    onProceed={() => navigate('/analyzing')}
                    onStartOver={() => navigate('/analyze')}
                  />
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-5">
                    {/* OCR result badge */}
                    {ocrData.success ? (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-50 border border-brand-200">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-brand-500 text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-brand-900">Text Extracted Successfully</p>
                          <p className="text-xs text-brand-700 mt-0.5">
                            {ocrData.wordCount} words · {ocrData.charCount} characters · Confidence: {ocrData.avgConfidence}%
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-amber-100 text-amber-700 mt-0.5">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-amber-900">No Readable Text Found</p>
                          <p className="text-xs text-amber-700 mt-0.5">
                            {ocrData.error || 'Try a clearer, higher-resolution photo of the label.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Extracted text preview */}
                    {ocrData.success && ocrData.rawText && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Raw OCR Text Preview</p>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-44 overflow-y-auto">
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap break-words font-mono">
                            {ocrData.rawText}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                      <Link to="/analyze" className="btn-secondary text-sm py-3 flex-1 text-center">← Start Over</Link>
                      {ocrData.success ? (
                        <button
                          onClick={() => navigate('/analyzing')}
                          className="btn-primary text-sm py-3 flex-1"
                        >
                          Proceed to Analysis
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      ) : (
                        <button onClick={doOcr} className="btn-ghost text-sm py-3 flex-1">
                          Try OCR Again
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}


          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default QualityCheckPage
