import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import ReticleOverlay from '../components/common/ReticleOverlay'

/* ─── Mock data for the live preview section ─── */
const PREVIEW_INGREDIENTS = [
  { name: 'Niacinamide',        role: 'Active ingredient',  status: 'safe',    note: 'Verified by WHO & PubMed' },
  { name: 'Fragrance',           role: 'Potential concern',  status: 'caution', note: 'May cause sensitivity' },
  { name: 'Centella Asiatica',   role: 'Botanical extract',  status: 'safe',    note: 'Traditionally soothing' },
  { name: 'Parabens',            role: 'Preservative',       status: 'avoid',   note: 'Check with physician' },
]

const STATUS_CONFIG = {
  safe:    { label: '✓ Verified',  classes: 'bg-brand-50 text-brand-700 border-brand-200/60',   dot: 'bg-brand-500'  },
  caution: { label: '⚠ Attention', classes: 'bg-amber-50 text-amber-700 border-amber-200/60',   dot: 'bg-amber-500'  },
  avoid:   { label: '✕ Avoid',     classes: 'bg-red-50   text-red-700   border-red-200/60',     dot: 'bg-red-500'    },
}

/* ─── Why PARAKH feature cards ─── */
const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Ingredient Intelligence',
    desc:  'Understand complex ingredients in simple, plain language — no chemistry degree needed.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Evidence-Backed',
    desc:  'Every insight is cross-verified against FSSAI, WHO, FDA, and PubMed databases.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Personalized',
    desc:  'Set your dietary rules and sensitivities — PARAKH highlights what matters to you.',
  },
]

/* ─── How It Works steps ─── */
const HOW_IT_WORKS = [
  { step: '01', title: 'Upload a Label', desc: 'Take a photo or upload an image of any product label — food, skincare, or supplement.' },
  { step: '02', title: 'Quality Check',  desc: 'PARAKH verifies image clarity, lighting, and label legibility before processing.' },
  { step: '03', title: 'AI Analysis',    desc: 'Gemini AI reads the label, identifies ingredients, and retrieves evidence from trusted databases.' },
  { step: '04', title: 'Get Your Report', desc: 'Receive a clear Transparency Report with ingredient insights, risk flags, and personalized alerts.' },
]

/**
 * LandingPage — Screen S-1
 * Route: /
 */
function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col page-glow">
      <Navbar />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-24 pt-6 pb-20">

        {/* ══════════════════════════════════════════
            SECTION 1 — HERO
        ════════════════════════════════════════════ */}
        <section id="home" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8 lg:pt-14">

          {/* Left: Copy + CTAs */}
          <div className="lg:col-span-6 space-y-8 animate-slide-up">

            {/* AI badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 border border-brand-200/60 text-xs font-semibold text-brand-900">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              AI-Powered Product Intelligence
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-[60px] font-extrabold tracking-tight text-slate-900 leading-[1.07]">
              Scan. Understand.<br />
              <span className="text-brand-900">Decide.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base lg:text-lg text-slate-600 leading-relaxed max-w-[480px]">
              Understand product labels, ingredients, and potential concerns with AI-powered,
              evidence-backed insights from FSSAI, WHO, and PubMed.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={() => navigate('/analyze')}
                className="btn-primary px-8 py-3.5 text-sm"
              >
                Analyze Product
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <a
                href="#how-it-works"
                className="btn-secondary px-8 py-3.5 text-sm"
              >
                How It Works
              </a>
            </div>

            {/* Trust signals */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-slate-200/60 max-w-[480px]">
              {[
                { icon: '⚡', label: 'Safer Choices', sub: 'Every day' },
                { icon: '🛡️', label: 'Trusted', sub: 'Information' },
                { icon: '🌱', label: 'Healthier', sub: 'You' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-sm shrink-0">
                    {icon}
                  </div>
                  <span className="text-xs font-medium text-slate-700 leading-tight">{label}<br />{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product scan card with reticle */}
          <div className="lg:col-span-6 relative flex justify-center items-center py-8">

            {/* Main image frame */}
            <div className="relative w-[340px] sm:w-[400px] aspect-[4/4.5] rounded-3xl overflow-hidden shadow-float border-4 border-white bg-stone-100">
              {/* Placeholder product image */}
              <div className="w-full h-full bg-gradient-to-br from-brand-50 via-brand-100/50 to-emerald-50 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white shadow-card flex items-center justify-center">
                    <svg className="w-10 h-10 text-brand-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-xs text-brand-600 font-medium">Product Label</p>
                </div>
              </div>

              {/* Reticle overlay */}
              <ReticleOverlay size="lg" />

              {/* Label detected chip */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-8">
                <div className="bg-brand-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] tracking-wide text-white font-semibold shadow-lg">
                  LABEL DETECTED
                </div>
              </div>
            </div>

            {/* Floating badge: Ingredients */}
            <div className="absolute -top-3 right-4 sm:right-8 bg-white/95 backdrop-blur-sm border border-brand-100 rounded-2xl p-3.5 shadow-float flex items-center gap-3.5 z-10 hover:-translate-y-1 transition-transform duration-200">
              <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-900">Ingredients Detected</p>
                <p className="text-[11px] text-slate-500 font-medium">15 ingredients</p>
              </div>
            </div>

            {/* Floating badge: Confidence */}
            <div className="absolute -bottom-4 left-4 sm:left-8 bg-white/95 backdrop-blur-sm border border-brand-100 rounded-2xl p-3.5 shadow-float flex items-center gap-3.5 z-10 hover:-translate-y-1 transition-transform duration-200">
              <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-900">94% Confidence</p>
                <p className="text-[11px] text-slate-500 font-medium">Evidence Verified</p>
              </div>
            </div>

            {/* Handwritten annotation (Caveat font) */}
            <div className="hidden lg:block absolute -right-14 top-16 pointer-events-none select-none">
              <div className="font-handwriting text-2xl -rotate-6 text-slate-400 leading-tight flex flex-col items-start">
                <span>Smarter</span>
                <span className="pl-2">Choices</span>
                <span className="pl-4">Brighter</span>
                <span className="pl-6">Tomorrows</span>
                <svg className="w-10 h-10 mt-1 ml-4 text-brand-400/70" fill="none" stroke="currentColor" viewBox="0 0 40 40">
                  <path d="M5,5 C12,18 20,22 30,24 M30,24 L22,23 M30,24 L26,17" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION 2 — WHY PARAKH
        ════════════════════════════════════════════ */}
        <section id="benefits">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Why PARAKH?</h2>
            <p className="text-slate-500 text-sm">Clarity and confidence in every consumer product decision.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white p-7 rounded-2xl border border-slate-100 shadow-subtle flex items-start gap-5 hover:shadow-card hover:border-brand-100 transition-all duration-200">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION 3 — HOW IT WORKS
        ════════════════════════════════════════════ */}
        <section id="how-it-works">
          <div className="text-center space-y-2 mb-10">
            <span className="inline-block uppercase tracking-wider text-[10px] font-bold px-3 py-1 bg-brand-100/70 text-brand-900 rounded-full">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How PARAKH Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div key={step} className="relative bg-white p-6 rounded-2xl border border-slate-100 shadow-subtle hover:shadow-card hover:border-brand-100 transition-all duration-200">
                {/* Connector line (between cards on desktop) */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 w-6 border-t-2 border-dashed border-brand-200 translate-x-full z-10" />
                )}
                <div className="text-3xl font-extrabold text-brand-100 mb-4 font-handwriting">{step}</div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA under how it works */}
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/analyze')}
              className="btn-primary px-10 py-4 text-sm"
            >
              Try PARAKH for Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION 4 — LIVE PREVIEW
        ════════════════════════════════════════════ */}
        <section id="preview">
          <div className="text-center space-y-2 mb-8">
            <span className="inline-block uppercase tracking-wider text-[10px] font-bold px-3 py-1 bg-brand-100/70 text-brand-900 rounded-full">
              Sample Report Preview
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">See PARAKH in Action</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">Here's what a real PARAKH Transparency Report looks like — with ingredient status, confidence scores, and evidence sources.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-card">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              {/* Product summary */}
              <div className="lg:col-span-4 flex items-center gap-5">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-brand-50 border border-brand-100 shrink-0 flex items-center justify-center">
                  <div className="text-brand-300 text-5xl">🧴</div>
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[11px] font-bold">
                    Dermatological Skincare
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">Verdant Botanicals Serum</h3>
                  <p className="text-xs text-slate-500">Batch #VB-882</p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    Confidence: 94%
                  </div>
                </div>
              </div>

              {/* Ingredient list */}
              <div className="lg:col-span-8 space-y-3">
                {PREVIEW_INGREDIENTS.map(({ name, role, status, note }) => {
                  const cfg = STATUS_CONFIG[status]
                  return (
                    <div
                      key={name}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors hover:shadow-subtle cursor-pointer ${
                        status === 'caution' ? 'border-amber-100 bg-amber-50/20 hover:border-amber-200' :
                        status === 'avoid'   ? 'border-red-100 bg-red-50/20 hover:border-red-200' :
                        'border-slate-100 bg-white hover:border-brand-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-bold ${cfg.classes}`}>
                          {cfg.label}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{name}</p>
                          <p className={`text-[11px] font-medium ${status === 'caution' ? 'text-amber-700' : status === 'avoid' ? 'text-red-600' : 'text-slate-500'}`}>{role}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 ${cfg.dot}`}>
                        {status === 'caution'
                          ? <span className="text-xs font-black">!</span>
                          : status === 'avoid'
                          ? <span className="text-xs font-black">✕</span>
                          : <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        }
                      </div>
                    </div>
                  )
                })}

                {/* View full report CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/report/demo')}
                    className="text-sm font-semibold text-brand-700 hover:text-brand-900 transition-colors inline-flex items-center gap-1"
                  >
                    View full sample report
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}

export default LandingPage
