import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AnalysisProvider } from './context/AnalysisContext'
import { PreferenceProvider } from './context/PreferenceContext'

/**
 * Entry point — wraps the whole app with both context providers.
 * AnalysisProvider: manages the active upload/report state
 * PreferenceProvider: manages user personalization settings (saved to localStorage)
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreferenceProvider>
      <AnalysisProvider>
        <App />
      </AnalysisProvider>
    </PreferenceProvider>
  </StrictMode>,
)
