import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { usePreferences } from '../context/PreferenceContext'

/* ── Available quick tags ── */
const ALL_TAGS = [
  'Fragrance-Free',
  'Sulfate-Free',
  'Essential Oils',
  'Artificial Dyes',
  'Gluten-Free',
  'Paraben-Free',
  'Alcohol-Free',
  'Vegan',
  'Cruelty-Free',
]

/* ── Preference category config ── */
const CATEGORIES = [
  {
    key:   'sensitivities',
    title: 'Ingredient sensitivities',
    desc:  'Highlight ingredients I may want to pay attention to.',
    note:  'e.g. fragrance, essential oils, parabens',
    icon:  (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key:   'dietary',
    title: 'Dietary preferences',
    desc:  'Help identify ingredients relevant to my dietary choices.',
    note:  'e.g. vegan, cruelty-free, alcohol-free',
    icon:  (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key:   'watchlist',
    title: 'Specific ingredients',
    desc:  'Highlight ingredients I want to keep an eye on.',
    note:  'custom watchlist using quick tags below',
    icon:  (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

/**
 * PersonalizationPage — Screen S-7
 * Route: /personalize
 */
function PersonalizationPage() {
  const navigate = useNavigate()
  const { preferences, toggleTag, toggleCategory, clearPreferences } = usePreferences()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const activeTagCount = preferences.activeTags.length
  const activeCategories = CATEGORIES.filter(c => preferences[c.key])

  return (
    <div className="min-h-screen flex flex-col page-glow">
      <Navbar />

      <main className="flex-grow py-10 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-slide-up">

          {/* Back link */}
          <Link to="/report/demo" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-brand-800 transition-colors mb-6">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Report
          </Link>

          {/* Page header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-800 text-xs font-semibold uppercase tracking-wide mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              Personalize PARAKH
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Make your insights more relevant
            </h1>
            <p className="mt-3 text-slate-600 text-base">
              Tell PARAKH what matters to you. These preferences are saved and applied to every scan.
            </p>
          </div>

          {/* Main preference card */}
          <div className="bg-white rounded-3xl border border-brand-900/8 shadow-card p-6 sm:p-10 space-y-10">

            {/* ── Section 1: Category Toggles ── */}
            <section className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">What should PARAKH highlight?</h2>
                <p className="text-sm text-slate-500 mt-0.5">Select the categories that help PARAKH flag what's relevant to you.</p>
              </div>

              <div className="space-y-3">
                {CATEGORIES.map(({ key, title, desc, note, icon }) => {
                  const isChecked = preferences[key]
                  return (
                    <label
                      key={key}
                      className={`group flex items-start justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-200 shadow-subtle ${
                        isChecked
                          ? 'border-brand-300 bg-brand-50/40 hover:bg-brand-50/60'
                          : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-brand-50/20'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                          isChecked
                            ? 'bg-brand-100 border-brand-200 text-brand-800'
                            : 'bg-brand-50 border-brand-100 text-brand-700 group-hover:bg-brand-100/70'
                        }`}>
                          {icon}
                        </div>
                        <div>
                          <h3 className={`font-bold text-base transition-colors ${isChecked ? 'text-brand-900' : 'text-slate-900'}`}>{title}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                              {note}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-1 pl-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(key)}
                          className="w-5 h-5 rounded border-slate-300 text-brand-900 focus:ring-brand-600/20 focus:ring-offset-0 cursor-pointer accent-brand-900"
                        />
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* ── Quick Tags ── */}
              <div className="pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">Quick Filter Tags</span>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map(tag => {
                    const isActive = preferences.activeTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`transition-all duration-200 ${isActive ? 'chip-active' : 'chip-inactive'}`}
                      >
                        {isActive && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {isActive ? tag : `+ ${tag}`}
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* ── Section 2: Active Summary ── */}
            <section className="border-t border-slate-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Your Active Preferences</h2>
                <span className="text-xs font-medium text-brand-800 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                  {activeTagCount} tag{activeTagCount !== 1 ? 's' : ''} active
                </span>
              </div>

              <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-5">
                {activeTagCount > 0 || activeCategories.length > 0 ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white border border-brand-200 flex items-center justify-center text-brand-700 shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          PARAKH will prioritize: {preferences.activeTags.join(', ') || 'Custom categories selected'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Matching ingredients will be prominently flagged in your next scan.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearPreferences}
                      type="button"
                      className="text-xs font-medium text-slate-500 hover:text-brand-900 underline transition-colors shrink-0"
                    >
                      Clear all
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-2">
                    No preferences selected yet — choose categories or tags above.
                  </p>
                )}
              </div>
            </section>

            {/* ── Actions ── */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link to="/report/demo" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                  Skip and continue to report →
                </Link>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full sm:w-auto btn-primary px-8 py-3.5 text-sm"
                  >
                    {saved ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Saved!
                      </>
                    ) : (
                      <>
                        Save Preferences
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Privacy note */}
              <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                <svg className="w-3.5 h-3.5 text-brand-700/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Preferences are stored locally on your device and never shared. You can update or clear them anytime.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PersonalizationPage
