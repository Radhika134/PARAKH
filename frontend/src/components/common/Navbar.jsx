import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

/**
 * Navbar — sticky header shared across all PARAKH pages.
 *
 * Desktop: Logo | Nav links (Home, Analyze, History, Personalize) | CTA button
 * Mobile:  Logo | Hamburger → slide-down drawer with all links
 */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  // NavLink active class helper — highlights the current route
  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'flex items-center gap-1.5 text-brand-900 font-semibold text-sm'
      : 'flex items-center gap-1.5 text-slate-600 hover:text-brand-900 font-medium text-sm transition-colors'

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-brand-900/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between py-4">

        {/* ── Brand Logo ── */}
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-brand-900 leading-none">PARAKH</span>
            <span className="text-[9px] font-bold tracking-widest text-brand-600 uppercase mt-0.5">Product Intelligence</span>
          </div>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass}>
            {({ isActive }) => (
              <>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                Home
              </>
            )}
          </NavLink>
          <NavLink to="/analyze" className={navLinkClass}>
            {({ isActive }) => (
              <>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                Analyze Product
              </>
            )}
          </NavLink>
          <NavLink to="/history" className={navLinkClass}>
            {({ isActive }) => (
              <>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                History
              </>
            )}
          </NavLink>
          <NavLink to="/personalize" className={navLinkClass}>
            {({ isActive }) => (
              <>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                Personalize
              </>
            )}
          </NavLink>
        </nav>

        {/* ── Desktop CTA + Mobile Hamburger ── */}
        <div className="flex items-center gap-3">
          {/* Desktop CTA */}
          <button
            onClick={() => navigate('/analyze')}
            className="hidden md:inline-flex items-center gap-2 bg-brand-900 hover:bg-brand-800 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-sm hover:shadow-green transition-all duration-200 active:scale-[0.98]"
          >
            Analyze Product
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-brand-50 text-slate-700 transition-colors"
            onClick={() => setMobileOpen(open => !open)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-100 bg-white px-4 py-4 space-y-1 animate-fade-in">
          {[
            { to: '/', label: 'Home', end: true },
            { to: '/analyze', label: 'Analyze Product' },
            { to: '/history', label: 'History' },
            { to: '/personalize', label: 'Personalize' },
          ].map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="pt-2">
            <button
              onClick={() => { navigate('/analyze'); setMobileOpen(false) }}
              className="w-full btn-primary"
            >
              Analyze Product →
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
