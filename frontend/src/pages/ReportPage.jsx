import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

/* ─── Mock Report Data ─── */
const MOCK_REPORT = {
  product:    'Verdant Botanicals Radiance Serum',
  brand:      'Verdant Botanicals Ltd.',
  category:   'Dermatological Skincare',
  batch:      '#VB-882',
  size:       '30 ml Formulated Solution',
  confidence: 94,
  metrics: {
    ingredientsDetected: 12,
    evidenceSources:     '3 Databases',
    verificationStatus:  'Label Verified',
  },
  ingredients: [
    { name: 'Vitamin C (Ascorbic Acid)', type: 'Active Antioxidant', status: 'safe',    desc: 'Antioxidant known for brightening and supporting skin barrier tone.' },
    { name: 'Glycerin',                  type: 'Humectant',          status: 'safe',    desc: 'Helps retain moisture and prevents epidermal water loss.' },
    { name: 'Niacinamide',               type: 'Vitamin B3',         status: 'safe',    desc: 'Used for skin conditioning, texture smoothing, and sebum balance.' },
    { name: 'Centella Asiatica Extract', type: 'Botanical',          status: 'safe',    desc: 'Traditional soothing botanical extract with triterpenoid compounds.' },
    { name: 'Fragrance',                 type: 'Sensitizer',         status: 'caution', desc: 'Common skin sensitizer. May cause reactions in sensitive individuals.' },
    { name: 'Parabens (Methylparaben)',  type: 'Preservative',       status: 'avoid',   desc: 'Linked to endocrine disruption in high-dose studies. Avoid if sensitive.' },
  ],
  observations: [
    { icon: '✅', title: 'Ingredient information clearly listed',      desc: 'Full ingredient breakdown was legible without occlusion or severe curvature.',      type: 'safe'    },
    { icon: '⚠️', title: 'Individual sensitivity notice',              desc: 'Some active ingredients may require patch-testing depending on dermatological skin type.', type: 'caution' },
    { icon: '📋', title: 'Label data successfully extracted',          desc: 'All 12 primary chemical and botanical components were identified and verified.',     type: 'safe'    },
  ],
  sources: [
    { name: 'FSSAI',        desc: 'Food safety and regulatory standards benchmark for cosmetic & functional categorization.', tag: 'Official Regulatory Index' },
    { name: 'WHO',          desc: 'Global public health, additive guidance, and international safety monographs.',           tag: 'Global Health Guidance'    },
    { name: 'PubMed & NLM', desc: 'Peer-reviewed scientific literature and clinical pharmacology databases.',                tag: 'Peer-Reviewed Index'        },
  ],
}

/* ─── Status config for ingredient badges ─── */
const STATUS_CONFIG = {
  safe:    { label: '✓ Safe',      classes: 'bg-brand-50  text-brand-700  border-brand-200/60',  dot: 'bg-brand-500',  rowBg: 'bg-[#fafdfb] hover:bg-brand-50/50 border-slate-100 hover:border-brand-200' },
  caution: { label: '⚠ Attention', classes: 'bg-amber-50  text-amber-700  border-amber-200/60', dot: 'bg-amber-500',  rowBg: 'bg-amber-50/20 hover:bg-amber-50/40 border-amber-100 hover:border-amber-200' },
  avoid:   { label: '✕ Avoid',     classes: 'bg-red-50    text-red-700    border-red-200/60',   dot: 'bg-red-500',    rowBg: 'bg-red-50/20 hover:bg-red-50/40 border-red-100 hover:border-red-200'     },
}

/**
 * ReportPage — Screen S-5
 * Route: /report/:id
 */
function ReportPage() {
  const navigate = useNavigate()
  const report = MOCK_REPORT

  return (
    <div className="min-h-screen flex flex-col page-glow">
      <Navbar />

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">

        {/* ── Report Intro Banner ── */}
        <div className="text-center max-w-2xl mx-auto mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold tracking-wide uppercase mb-4 shadow-subtle">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Product Transparency Report
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-900 tracking-tight leading-tight">
            Here's what PARAKH found
          </h1>
          <p className="mt-3 text-slate-500 text-base">
            Clear insights from the product label, supported by trusted evidence.
          </p>
        </div>

        {/* ── Product Summary Card ── */}
        <div className="bg-white rounded-3xl border border-brand-900/8 shadow-card p-6 md:p-8 mb-8 animate-slide-up">

          {/* Product identity row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              {/* Thumbnail with reticle border */}
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-200 bg-brand-50 shrink-0 flex items-center justify-center text-3xl shadow-subtle">
                🧴
                <div className="absolute inset-0 border border-brand-500/20 rounded-2xl pointer-events-none" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">{report.category}</span>
                  <span className="text-xs text-slate-400">Batch {report.batch}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{report.product}</h2>
                <p className="text-xs text-slate-500">{report.brand} • {report.size}</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-semibold self-start sm:self-auto">
              <svg className="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Analysis Complete
            </div>
          </div>

          {/* Metric grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            {[
              { label: 'Ingredients Detected', value: report.metrics.ingredientsDetected, sub: '100% matched to registry', subColor: 'text-brand-600' },
              { label: 'Analysis Confidence',   value: `${report.confidence}%`,            sub: 'High OCR clarity & alignment', subColor: 'text-slate-500' },
              { label: 'Evidence Sources',       value: report.metrics.evidenceSources,     sub: 'Cross-verified checks',        subColor: 'text-slate-500' },
              { label: 'Verification Status',    value: report.metrics.verificationStatus,  sub: 'Legibility confirmed',          subColor: 'text-slate-500', isText: true },
            ].map(({ label, value, sub, subColor, isText }) => (
              <div key={label} className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4">
                <div className="text-xs font-medium text-slate-500">{label}</div>
                <div className={`font-extrabold text-brand-900 mt-1 tracking-tight ${isText ? 'text-lg md:text-xl flex items-center gap-1.5 text-brand-700' : 'text-2xl md:text-3xl'}`}>
                  {isText ? (
                    <>
                      <svg className="w-4 h-4 text-brand-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {value}
                    </>
                  ) : value}
                </div>
                <div className={`text-[11px] font-medium mt-1 ${subColor}`}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ingredient Intelligence Section ── */}
        <section className="bg-white rounded-3xl border border-brand-900/8 shadow-card p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-5 border-b border-slate-100 mb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg md:text-xl font-bold text-brand-900">Ingredient Intelligence</h3>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full border border-brand-200">
                  Detected & Parsed
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Insights generated from peer-reviewed databases and ingredient registries.
              </p>
            </div>
            <span className="text-xs font-semibold text-brand-700 self-start md:self-auto">
              Showing {report.ingredients.length} of {report.metrics.ingredientsDetected} core items
            </span>
          </div>

          <div className="space-y-3">
            {report.ingredients.map(({ name, type, status, desc }) => {
              const cfg = STATUS_CONFIG[status]
              return (
                <div
                  key={name}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-colors cursor-pointer ${cfg.rowBg}`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${status === 'safe' ? 'bg-brand-100' : status === 'caution' ? 'bg-amber-100' : 'bg-red-100'}`}>
                      {status === 'safe'
                        ? <svg className="w-4 h-4 text-brand-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        : status === 'caution'
                        ? <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{name}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.classes}`}>
                          {type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{desc}</p>
                    </div>
                  </div>
                  <Link
                    to={`/ingredient/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="inline-flex items-center text-xs font-semibold text-brand-700 hover:text-brand-900 transition-colors whitespace-nowrap self-end sm:self-center"
                    onClick={e => e.stopPropagation()}
                  >
                    View details →
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Key Observations ── */}
        <section className="mb-8">
          <div className="mb-5">
            <h3 className="text-lg md:text-xl font-bold text-brand-900">Key Observations</h3>
            <p className="text-xs md:text-sm text-slate-500">Essential contextual notes from the verified label text.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.observations.map(({ icon, title, desc, type }) => (
              <div
                key={title}
                className={`bg-white rounded-2xl border p-5 shadow-subtle ${type === 'caution' ? 'border-amber-200/60' : 'border-brand-900/8'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-xl ${type === 'caution' ? 'bg-amber-50' : 'bg-brand-50'}`}>
                  {icon}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">{title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Evidence & Sources ── */}
        <section className="bg-white rounded-3xl border border-brand-900/8 shadow-card p-6 md:p-8 mb-8">
          <div className="mb-5">
            <h3 className="text-lg md:text-xl font-bold text-brand-900">Evidence & Sources</h3>
            <p className="text-xs md:text-sm text-slate-500">Every insight is benchmarked against recognized regulatory standards.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.sources.map(({ name, desc, tag }) => (
              <div key={name} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="text-sm font-extrabold text-brand-900 mb-1">{name}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                </div>
                <div className="text-[10px] font-semibold text-brand-700 mt-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  {tag}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Personalized Insights Banner ── */}
        <section className="mb-10">
          <div className="rounded-2xl bg-gradient-to-r from-brand-50/90 to-brand-50/40 border border-brand-200/80 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white text-brand-800 shadow-subtle flex items-center justify-center shrink-0">
                ⚙️
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-900">Your Preferences</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Set dietary, allergen, or skin-type preferences to get personalized flags on every scan.
                </p>
              </div>
            </div>
            <Link
              to="/personalize"
              className="whitespace-nowrap px-4 py-2 rounded-xl bg-white hover:bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold transition shadow-subtle inline-flex items-center gap-1.5 self-end sm:self-auto"
            >
              Set Preferences ⚙️
            </Link>
          </div>
        </section>

        {/* ── Bottom Actions ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 pb-6">
          <Link
            to="/history"
            className="w-full sm:w-auto btn-primary px-8 py-3.5"
          >
            Save to History
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            to="/analyze"
            className="w-full sm:w-auto btn-secondary px-8 py-3.5"
          >
            Analyze Another Product
          </Link>
        </div>

        {/* Medical disclaimer */}
        <p className="disclaimer-banner mt-4">
          ⚕️ PARAKH provides general product information only — not medical, dietary, or clinical advice.
          Consult a qualified healthcare professional before making decisions based on this report.
        </p>
      </main>

      <Footer />
    </div>
  )
}

export default ReportPage
