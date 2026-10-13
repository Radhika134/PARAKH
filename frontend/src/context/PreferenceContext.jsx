import { createContext, useContext, useState, useEffect } from 'react'

/**
 * PreferenceContext
 * Stores user personalization preferences (sensitivities, dietary, watchlist tags).
 * Persisted to localStorage so choices survive page refreshes.
 */

const PreferenceContext = createContext(null)

// Default preference state
const DEFAULT_PREFERENCES = {
  sensitivities: true,    // Ingredient sensitivity alerts enabled
  dietary: false,         // Dietary preference alerts enabled
  watchlist: true,        // Custom ingredient watchlist enabled
  activeTags: ['Fragrance-Free', 'Essential Oils'], // Selected quick tags
}

export function PreferenceProvider({ children }) {
  // Load saved preferences from localStorage, or use defaults
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('parakh_preferences')
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES
    } catch {
      return DEFAULT_PREFERENCES
    }
  })

  // Save to localStorage whenever preferences change
  useEffect(() => {
    localStorage.setItem('parakh_preferences', JSON.stringify(preferences))
  }, [preferences])

  // Toggle a quick tag on/off
  function toggleTag(tag) {
    setPreferences(prev => ({
      ...prev,
      activeTags: prev.activeTags.includes(tag)
        ? prev.activeTags.filter(t => t !== tag)
        : [...prev.activeTags, tag],
    }))
  }

  // Toggle a preference category on/off
  function toggleCategory(key) {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Clear all preferences back to defaults
  function clearPreferences() {
    setPreferences(DEFAULT_PREFERENCES)
  }

  const value = {
    preferences,
    setPreferences,
    toggleTag,
    toggleCategory,
    clearPreferences,
  }

  return (
    <PreferenceContext.Provider value={value}>
      {children}
    </PreferenceContext.Provider>
  )
}

export function usePreferences() {
  return useContext(PreferenceContext)
}
