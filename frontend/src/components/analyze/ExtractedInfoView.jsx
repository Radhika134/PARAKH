import { useState } from 'react'

/**
 * ExtractedInfoView — Phase 4 Extracted Product & Ingredient View Component
 *
 * Renders structured product information parsed from Phase 3 OCR output:
 *   - Category badge (Food, Skincare, Supplements, Unknown)
 *   - Product Name & Brand (with explicit "Not detected" state if null)
 *   - Cleaned Ingredient List with original label text traceability
 *   - Label Information: Warnings, Claims, Usage, Nutrition, Allergens
 *   - Extraction Audit Metadata (Confidence score, completeness, explicit uncertainties)
 */

export default function ExtractedInfoView({ data, onProceed, onStartOver }) {
  const [ingredientFilter, setIngredientFilter] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'ingredients' | 'label' | 'metadata'

  if (!data) return null

  const {
    product = {},
    ingredients = [],
    warnings = [],
    claims = [],
    usage = [],
    nutrition = [],
    allergens = [],
    extractionMetadata = {}
  } = data

  const category = product.category || 'unknown'
  const confidenceScore = extractionMetadata.extractionConfidenceScore ?? 75

  // Category Color Map
  const categoryStyles = {
    food: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: '🥗', label: 'Food Product' },
    skincare: { bg: 'bg-teal-50 text-teal-800 border-teal-200', icon: '🧴', label: 'Skincare Product' },
    supplements: { bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: '💊', label: 'Dietary Supplement' },
    unknown: { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: '❓', label: 'Unclassified Category' }
  }

  const currentCatStyle = categoryStyles[category] || categoryStyles.unknown

  // Confidence Badge Color
  const getConfidenceBadge = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'High Confidence' }
    if (score >= 60) return { bg: 'bg-amber-100 text-amber-800 border-amber-300', text: 'Moderate Confidence' }
    return { bg: 'bg-red-100 text-red-800 border-red-300', text: 'Low Confidence / Review Needed' }
  }

  const confidenceBadge = getConfidenceBadge(confidenceScore)

  // Filtered ingredients
  const filteredIngredients = ingredients.filter(item =>
    item.name.toLowerCase().includes(ingredientFilter.toLowerCase()) ||
    (item.originalText && item.originalText.toLowerCase().includes(ingredientFilter.toLowerCase()))
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── Main Extraction Card Header ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-950 p-6 text-white relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${currentCatStyle.bg}`}>
                  {currentCatStyle.icon} {currentCatStyle.label}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${confidenceBadge.bg}`}>
                  {confidenceBadge.text} ({confidenceScore}%)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {product.name || <span className="italic text-emerald-200/70 font-normal">Product Name Not Detected</span>}
              </h2>
              {product.brand && (
                <p className="text-sm text-emerald-200 mt-1 font-medium">
                  Brand: <span className="text-white font-semibold">{product.brand}</span>
                </p>
              )}
            </div>

            {/* Metric pill */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0 min-w-[120px]">
              <p className="text-2xl font-bold text-emerald-300">{ingredients.length}</p>
              <p className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider mt-0.5">Ingredients</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/50 text-sm font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3.5 px-4 border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-brand-600 text-brand-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`py-3.5 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'ingredients'
                ? 'border-brand-600 text-brand-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Ingredients
            <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {ingredients.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('label')}
            className={`py-3.5 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'label'
                ? 'border-brand-600 text-brand-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Label Information
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`py-3.5 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'metadata'
                ? 'border-brand-600 text-brand-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Extraction Audit
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* ── OVERVIEW TAB / ALL ── */}
          {(activeTab === 'all' || activeTab === 'ingredients') && (
            <div className="space-y-6">
              {/* Product Info Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Product Name</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {product.name || <span className="text-slate-400 italic">Not Detected</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Brand Name</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {product.brand || <span className="text-slate-400 italic">Not Detected</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category Classification</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1 capitalize">
                    {category}
                  </p>
                </div>
              </div>

              {/* Ingredients Search & List */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Extracted Ingredients List</h3>
                    <p className="text-xs text-slate-500">Showing cleaned name and original label wording</p>
                  </div>

                  {ingredients.length > 0 && (
                    <input
                      type="text"
                      placeholder="Filter ingredients..."
                      value={ingredientFilter}
                      onChange={(e) => setIngredientFilter(e.target.value)}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full sm:w-64"
                    />
                  )}
                </div>

                {ingredients.length === 0 ? (
                  <div className="p-6 text-center bg-amber-50/50 border border-amber-100 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 font-bold text-lg">
                      !
                    </div>
                    <p className="text-sm font-semibold text-amber-900">No Ingredients Detected</p>
                    <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
                      No distinct ingredient panel was found in the label text. You can proceed with general label analysis or try retaking a photo centered on the ingredient list.
                    </p>
                  </div>
                ) : filteredIngredients.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No ingredients match your filter "{ingredientFilter}"</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredIngredients.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 transition-all shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-slate-800 leading-snug">{item.name}</p>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                              {item.extractionConfidence}% conf
                            </span>
                          </div>
                          {item.originalText && item.originalText.toLowerCase() !== item.name.toLowerCase() && (
                            <p className="text-[11px] text-slate-400 mt-1 font-mono break-all">
                              Raw: "{item.originalText}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── LABEL INFORMATION TAB ── */}
          {(activeTab === 'all' || activeTab === 'label') && (
            <div className="space-y-6 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Additional Label Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Warnings */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-600 font-bold">⚠️</span>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Warnings & Precautions</h4>
                  </div>
                  {warnings.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-amber-900/90 list-disc list-inside">
                      {warnings.map((w, i) => (
                        <li key={i} className="leading-relaxed">{w}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No warnings detected on label</p>
                  )}
                </div>

                {/* Claims */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Packaging Claims</h4>
                  </div>
                  {claims.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {claims.map((c, i) => (
                        <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No explicit marketing claims detected</p>
                  )}
                </div>

                {/* Usage */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-brand-600 font-bold">📝</span>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Usage & Directions</h4>
                  </div>
                  {usage.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                      {usage.map((u, i) => (
                        <li key={i} className="leading-relaxed">{u}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No usage instructions detected</p>
                  )}
                </div>

                {/* Category specific (Nutrition or Allergens) */}
                {category === 'food' && (
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600 font-bold">📊</span>
                      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Nutritional Information & Allergens</h4>
                    </div>
                    {allergens.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[11px] font-bold text-red-700">Allergen Notice:</p>
                        <p className="text-xs text-red-800 font-medium">{allergens.join(', ')}</p>
                      </div>
                    )}
                    {nutrition.length > 0 ? (
                      <ul className="space-y-1 text-xs text-blue-900 font-mono">
                        {nutrition.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No nutritional table detected</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── EXTRACTION AUDIT TAB ── */}
          {(activeTab === 'all' || activeTab === 'metadata') && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Extraction Audit & Confidence Metadata</h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">OCR Quality</p>
                    <p className="text-sm font-bold text-slate-800">{extractionMetadata.ocrConfidence}%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Extraction Quality</p>
                    <p className="text-sm font-bold text-brand-700">{extractionMetadata.extractionConfidenceScore}%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Product Name</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      {extractionMetadata.productNameDetected ? '✓ Detected' : '✗ Missing'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">List Complete</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      {extractionMetadata.isComplete ? '✓ Complete' : '⚠ Truncated'}
                    </p>
                  </div>
                </div>

                {extractionMetadata.uncertainties && extractionMetadata.uncertainties.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs font-bold text-amber-800 mb-1">Extraction Ambiguities & Audit Notes:</p>
                    <ul className="space-y-1 text-xs text-amber-700 list-disc list-inside">
                      {extractionMetadata.uncertainties.map((u, i) => (
                        <li key={i}>{u}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3">
          {onStartOver && (
            <button onClick={onStartOver} className="btn-secondary text-sm py-3 px-6">
              ← Scan Another Product
            </button>
          )}

          {onProceed && (
            <button onClick={onProceed} className="btn-primary text-sm py-3 px-6 flex-1 text-center justify-center">
              Proceed to Full AI Analysis
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Non-Medical Disclaimer Banner */}
      <p className="disclaimer-banner text-center text-xs text-slate-400">
        ⚕️ PARAKH provides objective product & ingredient extraction from product labels — not medical or health safety advice.
      </p>
    </div>
  )
}
