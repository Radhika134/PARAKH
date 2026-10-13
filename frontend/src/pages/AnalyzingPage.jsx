import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { useAnalysis } from '../context/AnalysisContext'

/**
 * The 5 analysis stages with their simulated durations.
 * In Phase 7+ these will map to real backend API stages.
 */
const STAGES = [
  { id: 'quality',    label: 'Image Quality Verification',               duration: 800  },
  { id: 'ocr',        label: 'OCR Text Extraction',                       duration: 1200 },
  { id: 'extraction', label: 'Ingredient Extraction',                     duration: 1000 },
  { id: 'rag',        label: 'Retrieving Evidence (FSSAI / WHO / FDA)',   duration: 1400 },
  { id: 'ai',         label: 'AI Analysis & Personalization',             duration: 1600 },
]

// Status types for each stage
const STATUS = { PENDING: 'pending', ACTIVE: 'active', DONE: 'done' }

/**
 * AnalyzingPage — Screen S-4
 * Route: /analyzing
 *
 * Simulates the 5-stage analysis pipeline with animations.
 * Auto-navigates to /report/demo when all stages complete.
 */
function AnalyzingPage() {
  const navigate = useNavigate()
  const { uploadedImage, imagePreviewUrl } = useAnalysis()

  // Track which stage index is currently active
  const [currentStage, setCurrentStage] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  // Get status for each stage based on currentStage index
  function getStatus(index) {
    if (index < currentStage) return STATUS.DONE
    if (index === currentStage) return STATUS.ACTIVE
    return STATUS.PENDING
  }

  // Progress bar: percentage based on completed stages
  const progressPercent = Math.min(Math.round((currentStage / STAGES.length) * 100), 100)

  /* ── Elapsed timer ── */
  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  /* ── Stage progression ── */
  useEffect(() => {
    if (currentStage >= STAGES.length) {
      // All done — navigate to the report
      const timeout = setTimeout(() => navigate('/report/demo'), 600)
      return () => clearTimeout(timeout)
    }

    const stage = STAGES[currentStage]
    const timeout = setTimeout(() => {
      setCurrentStage(s => s + 1)
    }, stage.duration)

    return () => clearTimeout(timeout)
  }, [currentStage, navigate])

  // Preview URL from uploaded image (or null if accessed directly)
  // Use the preview URL already stored in context (avoids duplicate blob URLs)
  const previewUrl = imagePreviewUrl

  return (
    <div className="min-h-screen flex flex-col page-glow">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl flex flex-col items-center animate-slide-up">

          {/* Step badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold tracking-wide mb-5 shadow-subtle">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600" />
            </span>
            <span className="uppercase tracking-wider">Step 3 of 3: AI Processing</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-900 tracking-tight text-center leading-tight mb-3">
            Analyzing Your Product
          </h1>
          <p className="text-slate-500 text-base text-center max-w-md mb-10 leading-relaxed">
            PARAKH is reading the label and checking trusted evidence to build your report.
          </p>

          {/* ── Main Processing Card ── */}
          <div className="w-full bg-white rounded-3xl border border-brand-900/5 shadow-card p-8 md:p-10 relative overflow-hidden">

            {/* Top shimmer progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-50 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-400 via-brand-600 to-brand-500 rounded-r-full shimmer-bar transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex flex-col items-center">

              {/* Product thumbnail with scan animation */}
              <div className="relative mb-8">
                {/* Ambient glow */}
                <div className="absolute -inset-3 bg-gradient-to-tr from-brand-100/50 to-brand-200/30 rounded-2xl blur-md -z-10" />

                <div className="w-24 h-24 rounded-2xl bg-brand-50/70 border-2 border-brand-200/80 shadow-subtle relative overflow-hidden flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Product label" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-4xl">🧴</div>
                  )}
                  {/* Scan beam */}
                  <div
                    className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-scan-line pointer-events-none"
                    style={{ top: 0 }}
                  />
                  {/* Corner marks */}
                  {[
                    'top-2 left-2 border-t-2 border-l-2',
                    'top-2 right-2 border-t-2 border-r-2',
                    'bottom-2 left-2 border-b-2 border-l-2',
                    'bottom-2 right-2 border-b-2 border-r-2',
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-2.5 h-2.5 border-brand-400 pointer-events-none ${cls}`} />
                  ))}
                </div>

                {/* Product name pill */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border border-brand-200 shadow-subtle flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  <span className="text-[11px] font-semibold text-brand-900">
                    {uploadedImage?.name?.split('.')[0] || 'Product Label'}
                  </span>
                </div>
              </div>

              {/* Progress label */}
              <div className="w-full max-w-sm mb-6 mt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2 px-1">
                  <span className="text-brand-800 font-bold">Analysis Pipeline</span>
                  <span className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100 font-bold">
                    Step {Math.min(currentStage + 1, STAGES.length)} of {STAGES.length}
                  </span>
                </div>
                {/* Track bar */}
                <div className="w-full h-2 rounded-full bg-brand-50 border border-brand-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-brand-500 rounded-full shimmer-bar transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* ── Stage Steps List ── */}
              <div className="w-full max-w-sm space-y-2.5 mb-7">
                {STAGES.map((stage, index) => {
                  const status = getStatus(index)
                  return (
                    <div
                      key={stage.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 ${
                        status === STATUS.DONE    ? 'bg-brand-50/40 border border-brand-100/70' :
                        status === STATUS.ACTIVE  ? 'bg-brand-50/90 border border-brand-300 shadow-subtle ring-2 ring-brand-500/15' :
                        'bg-slate-50/50 border border-slate-200/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Status icon */}
                        {status === STATUS.DONE ? (
                          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        ) : status === STATUS.ACTIVE ? (
                          <div className="relative flex items-center justify-center w-7 h-7">
                            <span className="absolute inset-0 rounded-full bg-brand-400 opacity-60 animate-pulse-ring" />
                            <span className="w-3.5 h-3.5 rounded-full bg-brand-900 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            </span>
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full border-2 border-slate-300 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                          </div>
                        )}
                        <span className={`text-sm font-${status === STATUS.ACTIVE ? 'bold text-brand-900' : status === STATUS.DONE ? 'semibold text-slate-700' : 'medium text-slate-500'}`}>
                          {stage.label}
                        </span>
                      </div>

                      {/* Right status pill */}
                      {status === STATUS.DONE && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-100/80 px-2.5 py-1 rounded-full">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Done
                        </span>
                      )}
                      {status === STATUS.ACTIVE && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 bg-white border border-brand-200 px-3 py-1 rounded-full shadow-subtle">
                          <svg className="w-3.5 h-3.5 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </div>
                      )}
                      {status === STATUS.PENDING && (
                        <span className="text-xs font-medium text-slate-400 px-2 py-0.5">Queued</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Elapsed time notice */}
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/70 px-4 py-2 rounded-full mb-4">
                <svg className="w-4 h-4 text-brand-600 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Elapsed: {elapsed}s — This usually takes under 10 seconds.</span>
              </div>

              {/* Divider */}
              <div className="w-full border-t border-brand-900/5 my-2" />

              {/* Bottom assurance note */}
              <div className="pt-4 flex items-center gap-2.5 text-center text-xs text-slate-500 max-w-sm">
                <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="leading-relaxed">
                  Your results will include ingredient insights, evidence sources, and a confidence score.
                </span>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            {[
              { icon: '🔬', label: 'PubMed & Peer-Reviewed Sources' },
              { icon: '🔒', label: 'Encrypted & Private Processing' },
              { icon: '⚡', label: 'Curved Surface Dewarping' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AnalyzingPage
