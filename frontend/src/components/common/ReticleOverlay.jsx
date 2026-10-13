/**
 * ReticleOverlay — animated corner brackets + scan-line beam.
 * Used on product image frames to show "scanning" visual effect.
 *
 * Props:
 *   showScanLine (bool) — whether to animate the scan beam (default: true)
 *   color (string)      — Tailwind border color class (default: 'border-brand-500')
 *   size (string)       — bracket size: 'sm' | 'md' | 'lg' (default: 'md')
 */
function ReticleOverlay({ showScanLine = true, color = 'border-brand-500', size = 'md' }) {
  // Bracket size map
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }
  const bracketSize = sizeMap[size] || sizeMap.md

  return (
    <div className="absolute inset-0 pointer-events-none">

      {/* ── Corner Brackets ── */}
      {/* Top-left */}
      <div className={`absolute top-3 left-3 ${bracketSize} border-t-2 border-l-2 ${color} rounded-tl-sm`} />
      {/* Top-right */}
      <div className={`absolute top-3 right-3 ${bracketSize} border-t-2 border-r-2 ${color} rounded-tr-sm`} />
      {/* Bottom-left */}
      <div className={`absolute bottom-3 left-3 ${bracketSize} border-b-2 border-l-2 ${color} rounded-bl-sm`} />
      {/* Bottom-right */}
      <div className={`absolute bottom-3 right-3 ${bracketSize} border-b-2 border-r-2 ${color} rounded-br-sm`} />

      {/* ── Animated Scan Line ── */}
      {showScanLine && (
        <div
          className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-scan-line"
          style={{ top: 0 }}
        />
      )}
    </div>
  )
}

export default ReticleOverlay
