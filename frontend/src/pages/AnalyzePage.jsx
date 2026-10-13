import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Dropzone from '../components/analyze/Dropzone'
import CameraScanner from '../components/analyze/CameraScanner'
import { useAnalysis } from '../context/AnalysisContext'

/**
 * AnalyzePage — Screen S-2
 * Route: /analyze
 *
 * The main product input page. Lets the user choose between three input methods:
 *   1. Upload — drag-and-drop or click-to-browse (Dropzone component)
 *   2. Camera — live webcam capture (CameraScanner component)
 *   3. Paste  — manual ingredient text entry
 *
 * When the user is ready, we save the image/text to AnalysisContext and
 * navigate to /quality-check.
 */
function AnalyzePage() {
  const navigate = useNavigate()
  const { setImageInput, uploadedImage, imagePreviewUrl, clearImageInput } = useAnalysis()

  // Which tab the user is on
  const [activeTab, setActiveTab] = useState('upload')  // 'upload' | 'camera' | 'paste'

  // Paste tab state (local, not in context because it's text only)
  const [pasteText, setPasteText] = useState('')

  // General error shown at the bottom of the card (e.g. "please select an image first")
  const [ctaError, setCtaError] = useState('')

  /* ── Called by Dropzone when a valid file is selected ── */
  function handleFileSelected(file, previewUrl) {
    setCtaError('')
    setImageInput(file, previewUrl)
  }

  /* ── Called by Dropzone "Remove" button ── */
  function handleFileRemove() {
    clearImageInput()
  }

  /* ── Called by CameraScanner when user confirms a captured photo ── */
  function handleCameraCapture(file, previewUrl) {
    setCtaError('')
    setImageInput(file, previewUrl)
    // Switch to upload tab to show the captured image preview in Dropzone style
    setActiveTab('upload')
  }

  /* ── Called by CameraScanner "Cancel" button ── */
  function handleCameraCancel() {
    // Just stay on the camera tab — user can switch manually
  }

  /* ── Switch tab — also clear any CTA errors ── */
  function handleTabChange(tabId) {
    setActiveTab(tabId)
    setCtaError('')
  }

  /* ── "Analyze Product" CTA — validate and navigate ── */
  function handleAnalyze() {
    setCtaError('')

    if (activeTab === 'upload' || activeTab === 'camera') {
      if (!uploadedImage) {
        setCtaError('Please select or capture a product label image first.')
        return
      }
    }

    if (activeTab === 'paste') {
      if (!pasteText.trim()) {
        setCtaError('Please paste the ingredient list before continuing.')
        return
      }
    }

    // Navigate to Quality Check — the selected image/text is already in context
    navigate('/quality-check')
  }

  /* ── Tab definitions ── */
  const TABS = [
    {
      id:    'upload',
      label: 'Upload Photo',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id:    'camera',
      label: 'Live Camera',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id:    'paste',
      label: 'Paste Text',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  // Is the CTA button disabled?
  const isCtaDisabled =
    (activeTab === 'upload' && !uploadedImage) ||
    (activeTab === 'camera' && !uploadedImage) ||
    (activeTab === 'paste'  && !pasteText.trim())

  return (
    <div className="min-h-screen flex flex-col page-glow">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-2xl animate-slide-up">

          {/* ── Page Header ── */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold uppercase tracking-wide mb-1">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              Step 1 of 3: Choose your product
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analyze a Product</h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Upload a label photo, use your camera, or paste the ingredient list — then let PARAKH do the rest.
            </p>
          </div>

          {/* ── Main Card ── */}
          <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-6 sm:p-8">

            {/* ── Tab Switcher ── */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-slate-100/80 p-1.5 rounded-full border border-slate-200/50 gap-1">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-brand-100 text-brand-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Upload Tab — real Dropzone ── */}
            {activeTab === 'upload' && (
              <Dropzone
                selectedFile={uploadedImage}
                previewUrl={imagePreviewUrl}
                onFileSelected={handleFileSelected}
                onRemove={handleFileRemove}
              />
            )}

            {/* ── Camera Tab — real CameraScanner ── */}
            {activeTab === 'camera' && (
              <CameraScanner
                onCapture={handleCameraCapture}
                onCancel={handleCameraCancel}
              />
            )}

            {/* ── Paste Tab — text area ── */}
            {activeTab === 'paste' && (
              <div className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Paste Ingredient List
                  </span>
                  <p className="text-xs text-slate-400 mb-2.5">
                    Copy the ingredient text from the product packaging or label.
                  </p>
                  <textarea
                    value={pasteText}
                    onChange={e => { setPasteText(e.target.value); setCtaError('') }}
                    placeholder="e.g. Aqua, Niacinamide, Glycerin, Centella Asiatica Extract, Fragrance, Methylparaben..."
                    rows={7}
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                  />
                </label>

                {/* Character count */}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    Tip: Paste the complete ingredient list including all preservatives and additives.
                  </p>
                  <span className={`text-[11px] font-medium ${pasteText.length > 50 ? 'text-brand-600' : 'text-slate-400'}`}>
                    {pasteText.length} chars
                  </span>
                </div>
              </div>
            )}

            {/* ── CTA error (shown above Analyze button) ── */}
            {ctaError && (
              <div className="mt-5 flex items-start gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {ctaError}
              </div>
            )}

            {/* ── Analyze CTA — shown for upload and paste, not during camera scanning ── */}
            {activeTab !== 'camera' && (
              <button
                onClick={handleAnalyze}
                disabled={isCtaDisabled}
                className="mt-6 w-full btn-primary py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                Analyze Product
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {/* Camera tab: show Analyze CTA only when an image was captured */}
            {activeTab === 'camera' && uploadedImage && (
              <button
                onClick={handleAnalyze}
                className="mt-6 w-full btn-primary py-3.5 text-sm"
              >
                Analyze Captured Photo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          {/* ── Reassurance microcopy below the card ── */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span>🔒</span> Your image is processed privately
            </span>
            <span className="flex items-center gap-1.5">
              <span>⚡</span> Results in under 10 seconds
            </span>
            <span className="flex items-center gap-1.5">
              <span>🛡️</span> Evidence-backed insights
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AnalyzePage
