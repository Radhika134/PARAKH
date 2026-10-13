/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive'],
      },
      colors: {
        brand: {
          50:  '#ecfdf5',   // Mint light surface
          100: '#d1fae5',   // Mint soft border
          200: '#a7f3d0',   // Mint accent border
          500: '#10b981',   // Emerald bright accent
          600: '#059669',   // Emerald medium
          700: '#047857',   // Emerald dark
          800: '#065f46',   // Emerald deep
          900: '#064e3b',   // PARAKH primary brand green
          950: '#022c22',   // Dark charcoal green
        },
        canvas: '#fbfbf9',  // Soft warm off-white page background
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        // Custom shadow tokens matching the Stitch reference design
        'subtle': '0 4px 20px -2px rgba(6, 78, 59, 0.05)',
        'card':   '0 10px 30px -4px rgba(6, 78, 59, 0.06)',
        'float':  '0 20px 40px -10px rgba(6, 78, 59, 0.10)',
        'green':  '0 8px 24px -4px rgba(6, 78, 59, 0.20)',
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line':  'scan-line 2.8s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'fade-in':    'fade-in 0.4s ease-out both',
        'slide-up':   'slide-up 0.5s ease-out both',
      },
      keyframes: {
        'pulse-ring': {
          '0%':   { transform: 'scale(0.95)', opacity: '0.8' },
          '50%':  { transform: 'scale(1.35)', opacity: '0.2' },
          '100%': { transform: 'scale(0.95)', opacity: '0.8' },
        },
        'scan-line': {
          '0%':   { top: '0%', opacity: '0' },
          '15%':  { opacity: '1' },
          '85%':  { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        'shimmer': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
