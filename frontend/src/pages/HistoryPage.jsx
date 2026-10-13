import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

/* ─── Mock history data ─── */
const MOCK_HISTORY = [
  {
    id:         '1',
    product:    'Verdant Botanicals Radiance Serum',
    brand:      'Verdant Botanicals Ltd.',
    category:   'Skincare',
    date:       '2025-09-17',
    confidence: 94,
    emoji:      '🧴',
    concerns:   1,
  },
  {
    id:         '2',
    product:    'Maggi Masala Noodles',
    brand:      'Nestlé India Ltd.',
    category:   'Food',
    date:       '2025-09-16',
    confidence: 88,
    emoji:      '🍜',
    concerns:   2,
  },
  {
    id:         '3',
    product:    'Himalaya Neem Face Wash',
    brand:      'Himalaya Drug Co.',
    category:   'Skincare',
    date:       '2025-09-15',
    confidence: 91,
    emoji:      '🌿',
    concerns:   0,
  },
  {
    id:         '4',
    product:    'Centrum Multivitamin',
    brand:      'Pfizer Consumer Healthcare',
    category:   'Supplements',
    date:       '2025-09-14',
    confidence: 96,
    emoji:      '💊',
    concerns:   0,
  },
  {
    id:         '5',
    product:    'Sunscreen SPF 50 PA+++',
    brand:      'Neutrogena India',
    category:   'Skincare',
    date:       '2025-09-13',
    confidence: 87,
    emoji:      '☀️',
    concerns:   1,
  },
  {
    id:         '6',
    product:    'Amul Taaza Pasteurized Milk',
    brand:      'Amul (GCMMF)',
    category:   'Food',
    date:       '2025-09-12',
    confidence: 99,
    emoji:      '🥛',
    concerns:   0,
  },
]

const CATEGORY_FILTERS = ['All', 'Skincare', 'Food', 'Supplements']

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'az',     label: 'A → Z' },
  { value: 'conf',   label: 'Highest Confidence' },
]

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * HistoryPage — Screen S-8
 * Route: /history
 */
function HistoryPage() {
  const [search,       setSearch]       = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy,       setSortBy]       = useState('newest')
  const [items,        setItems]        = useState(MOCK_HISTORY)

  /* ── Delete a history item ── */
  function handleDelete(id) {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  /* ── Filter + Search + Sort ── */
  const filtered = items
    .filter(item =>
      (activeFilter === 'All' || item.category === activeFilter) &&
      (item.product.toLowerCase().includes(search.toLowerCase()) ||
       item.brand.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date)
      if (sortBy === 'az')     return a.product.localeCompare(b.product)
      if (sortBy === 'conf')   return b.confidence - a.confidence
      return 0
    })

  return (
    <div className="min-h-screen flex flex-col page-glow">
      <Navbar />

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Page heading */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Analysis History</h1>
          <p className="text-slate-500 text-sm mt-1">All products you've scanned with PARAKH — search, filter, and revisit any report.</p>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up">

          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search product or brand..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all bg-white"
            />
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* ── Category filter pills ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeFilter === cat
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-900'
              }`}
            >
              {cat}
              {cat !== 'All' && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeFilter === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {items.filter(i => i.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── History Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-subtle hover:shadow-card hover:border-brand-100 transition-all duration-200 p-5 group"
              >
                <div className="flex items-start gap-4">

                  {/* Emoji thumbnail */}
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-3xl shrink-0">
                    {item.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Category badge + date */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold border border-brand-100">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">{formatDate(item.date)}</span>
                    </div>

                    {/* Product name */}
                    <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{item.product}</h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.brand}</p>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between mt-3 gap-2">
                      <div className="flex items-center gap-3">
                        {/* Confidence */}
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                          {item.confidence}% confidence
                        </div>
                        {/* Concerns count */}
                        {item.concerns > 0 && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                            ⚠ {item.concerns} concern{item.concerns > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/report/${item.id}`}
                          className="text-xs font-semibold text-brand-700 hover:text-brand-900 transition-colors"
                        >
                          View Report →
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Remove from history"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {search || activeFilter !== 'All' ? 'No matching results' : 'No history yet'}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mb-6">
              {search || activeFilter !== 'All'
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'Scan your first product with PARAKH to see your analysis history here.'}
            </p>
            {search || activeFilter !== 'All' ? (
              <button
                onClick={() => { setSearch(''); setActiveFilter('All') }}
                className="btn-ghost text-sm"
              >
                Clear filters
              </button>
            ) : (
              <Link to="/analyze" className="btn-primary text-sm">
                Analyze Your First Product →
              </Link>
            )}
          </div>
        )}

        {/* Total count */}
        {filtered.length > 0 && (
          <p className="text-center text-xs text-slate-400 mt-8">
            Showing {filtered.length} of {items.length} scanned products
          </p>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default HistoryPage
