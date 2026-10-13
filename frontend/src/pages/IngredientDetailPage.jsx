import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

/* ─── Mock ingredient data (keyed by URL slug) ─── */
const INGREDIENT_DB = {
  'niacinamide': {
    name:        'Niacinamide',
    aliases:     ['Nicotinamide', 'Vitamin B3', 'Pyridine-3-carboxamide'],
    function:    'Skin Conditioner',
    confidence:  97,
    description: `Niacinamide is a water-soluble form of Vitamin B3 that plays multiple beneficial roles in skin care. 
It is widely used in cosmetic formulations for its ability to improve skin texture, minimize pore appearance, 
regulate sebum production, and brighten uneven skin tone. Clinical studies have demonstrated its effectiveness 
in reducing hyperpigmentation and improving skin barrier function.`,
    regulatoryStatus: [
      {
        authority: 'FSSAI',
        status:    'Approved',
        detail:    'Permitted as a cosmetic ingredient under Schedule II of the Cosmetics Rules, 2020.',
        color:     'brand',
      },
      {
        authority: 'WHO',
        status:    'Safe',
        detail:    'Listed as an essential nutrient; topical application considered safe for general use.',
        color:     'brand',
      },
      {
        authority: 'FDA',
        status:    'GRAS',
        detail:    'Generally Recognized as Safe (GRAS) as a food additive; approved for topical use in OTC products.',
        color:     'brand',
      },
    ],
    evidence: [
      {
        source:  'PubMed',
        ref:     'PMID: 32448764',
        quote:   '"Topical 5% niacinamide application significantly reduced hyperpigmentation and improved overall skin tone after 8 weeks of use in a double-blind randomized controlled trial."',
      },
      {
        source:  'Journal of Clinical & Aesthetic Dermatology',
        ref:     '2014; 7(7):22–30',
        quote:   '"Niacinamide has been demonstrated to reduce sebum excretion rate and improve the appearance of enlarged pores with consistent topical use."',
      },
    ],
    related: ['Ascorbic Acid', 'Centella Asiatica', 'Hyaluronic Acid'],
  },
  'fragrance': {
    name:        'Fragrance',
    aliases:     ['Parfum', 'Aroma', 'Fragrance Mix'],
    function:    'Masking Agent / Sensitizer',
    confidence:  88,
    description: `The term "Fragrance" or "Parfum" on an ingredient list typically represents a blend of 
multiple aromatic chemicals whose exact composition is often proprietary. Fragrance is one of the most 
common causes of contact dermatitis and skin sensitivity reactions in cosmetic products. 
Regulatory bodies allow manufacturers to list all fragrance components under a single term, 
making it difficult for consumers with specific allergies to identify potential triggers.`,
    regulatoryStatus: [
      {
        authority: 'FSSAI',
        status:    'Permitted with limits',
        detail:    'Permitted in cosmetics but restricted allergens must be declared separately above 0.001% concentration.',
        color:     'amber',
      },
      {
        authority: 'WHO',
        status:    'Use caution',
        detail:    'Certain fragrance components (e.g. Linalool, Limonene) are documented contact allergens.',
        color:     'amber',
      },
      {
        authority: 'FDA',
        status:    'Permitted',
        detail:    'Allowed in cosmetics; FDA does not require disclosure of individual fragrance components.',
        color:     'amber',
      },
    ],
    evidence: [
      {
        source:  'PubMed',
        ref:     'PMID: 29194789',
        quote:   '"Fragrance remains the most common allergen in contact dermatitis patch test series, accounting for up to 35% of positive reactions in sensitized individuals."',
      },
    ],
    related: ['Essential Oils', 'Linalool', 'Limonene'],
  },
}

// Default to Niacinamide data if slug not found
function getIngredient(slug) {
  const key = slug?.toLowerCase().replace(/-/g, ' ').trim()
  return INGREDIENT_DB[slug] || INGREDIENT_DB['niacinamide']
}

const COLOR_MAP = {
  brand: { bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700', badge: 'bg-brand-100 text-brand-800' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  red:   { bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-700',   badge: 'bg-red-100 text-red-800'   },
}

/**
 * IngredientDetailPage — Screen S-6
 * Route: /ingredient/:name
 */
function IngredientDetailPage() {
  const { name: slug } = useParams()
  const ingredient = getIngredient(slug)

  return (
    <div className="min-h-screen flex flex-col page-glow">
      <Navbar />

      <main className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Back breadcrumb */}
        <Link to="/report/demo" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-brand-800 transition-colors mb-6">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Report
        </Link>

        {/* ── Ingredient Hero ── */}
        <div className="bg-white rounded-3xl border border-brand-900/8 shadow-card p-6 md:p-8 mb-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3">
              {/* Function badge */}
              <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-[11px] font-bold uppercase tracking-wider">
                {ingredient.function}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {ingredient.name}
              </h1>
              {/* Aliases */}
              <div className="flex flex-wrap gap-2">
                {ingredient.aliases.map(alias => (
                  <span key={alias} className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                    {alias}
                  </span>
                ))}
              </div>
            </div>

            {/* Confidence score */}
            <div className="shrink-0 text-center p-4 rounded-2xl bg-brand-50 border border-brand-200">
              <div className="text-3xl font-extrabold text-brand-900">{ingredient.confidence}%</div>
              <div className="text-xs text-brand-700 font-semibold mt-1">Match Confidence</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Evidence Verified</div>
            </div>
          </div>
        </div>

        {/* ── What Is It? ── */}
        <div className="bg-white rounded-3xl border border-brand-900/8 shadow-card p-6 md:p-8 mb-6">
          <h2 className="text-lg font-bold text-brand-900 mb-3 flex items-center gap-2">
            <span className="text-xl">🔬</span> What is it?
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {ingredient.description}
          </p>
        </div>

        {/* ── Regulatory Status Grid ── */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-brand-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span> Regulatory Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ingredient.regulatoryStatus.map(({ authority, status, detail, color }) => {
              const c = COLOR_MAP[color] || COLOR_MAP.brand
              return (
                <div key={authority} className={`rounded-2xl border p-5 shadow-subtle ${c.bg} ${c.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-extrabold text-slate-900">{authority}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${c.badge}`}>{status}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${c.text}`}>{detail}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Evidence Quotes ── */}
        <div className="bg-white rounded-3xl border border-brand-900/8 shadow-card p-6 md:p-8 mb-6">
          <h2 className="text-lg font-bold text-brand-900 mb-5 flex items-center gap-2">
            <span className="text-xl">📚</span> Scientific Evidence
          </h2>
          <div className="space-y-4">
            {ingredient.evidence.map(({ source, ref, quote }) => (
              <div key={ref} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="source-badge">{source}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{ref}</span>
                </div>
                <blockquote className="text-sm text-slate-700 leading-relaxed italic">
                  {quote}
                </blockquote>
              </div>
            ))}
          </div>
        </div>

        {/* ── Related Ingredients ── */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Related Ingredients</h3>
          <div className="flex flex-wrap gap-2">
            {ingredient.related.map(rel => (
              <Link
                key={rel}
                to={`/ingredient/${encodeURIComponent(rel.toLowerCase().replace(/\s+/g, '-'))}`}
                className="chip-inactive"
              >
                {rel} →
              </Link>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="disclaimer-banner">
          ⚕️ This information is for educational purposes only — not medical advice. Consult a healthcare professional.
        </p>
      </main>

      <Footer />
    </div>
  )
}

export default IngredientDetailPage
