import { BrowserRouter, Routes, Route } from 'react-router-dom'

import LandingPage          from './pages/LandingPage'
import AnalyzePage          from './pages/AnalyzePage'
import QualityCheckPage     from './pages/QualityCheckPage'
import AnalyzingPage        from './pages/AnalyzingPage'
import ReportPage           from './pages/ReportPage'
import IngredientDetailPage from './pages/IngredientDetailPage'
import PersonalizationPage  from './pages/PersonalizationPage'
import HistoryPage          from './pages/HistoryPage'

/**
 * App — root router config for PARAKH.
 * All 8 screens are registered here. Each screen has its own page component.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<LandingPage />} />
        <Route path="/analyze"           element={<AnalyzePage />} />
        <Route path="/quality-check"     element={<QualityCheckPage />} />
        <Route path="/analyzing"         element={<AnalyzingPage />} />
        <Route path="/report/:id"        element={<ReportPage />} />
        <Route path="/ingredient/:name"  element={<IngredientDetailPage />} />
        <Route path="/personalize"       element={<PersonalizationPage />} />
        <Route path="/history"           element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
