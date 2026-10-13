import { Link } from 'react-router-dom'

/**
 * Footer — shared across all PARAKH pages.
 * Layout: Logo + copyright | Nav links | Evidence-Based badge
 * Non-medical disclaimer shown on all pages.
 */
function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Main Footer Row ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">

          {/* Left: Logo + copyright */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-900 flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight">PARAKH</span>
              <span className="ml-2 text-slate-400">© 2025 PARAKH. AI-Powered Product Intelligence.</span>
            </div>
          </div>

          {/* Center: Nav links */}
          <nav className="flex items-center gap-6 font-medium text-slate-600">
            <Link to="/" className="hover:text-brand-900 transition-colors">Home</Link>
            <Link to="/analyze" className="hover:text-brand-900 transition-colors">Analyze</Link>
            <Link to="/history" className="hover:text-brand-900 transition-colors">History</Link>
            <Link to="/personalize" className="hover:text-brand-900 transition-colors">Personalize</Link>
          </nav>

          {/* Right: Evidence-Based badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            Evidence-Based
          </div>
        </div>

        {/* ── Legal Disclaimer ── */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-[11px] text-slate-400 leading-relaxed">
          ⚕️ PARAKH provides general product information and educational insights only — not medical, dietary, or clinical advice.
          Always consult a qualified healthcare professional before making decisions based on product ingredient information.
        </div>
      </div>
    </footer>
  )
}

export default Footer
