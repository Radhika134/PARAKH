# PARAKH — Frontend Architecture

## Executive Overview
The PARAKH frontend is built as a responsive Single-Page Application (SPA) using React 18, Vite, and Tailwind CSS. It implements the 8 visual reference screens exported from Stitch, adopting design tokens including ambient radial background glows, reticle overlays, pill badges, interactive metric cards, and progress loaders.

---

## 1. Screen & Route Specification (The 8 Stitch Reference Screens)

| Screen ID | Stitch Folder / Screen Name | Route Path | Core Purpose | Key Interactive Elements | Scope Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S-1** | `parakh_ai_powered_product_intelligence_desktop` | `/` | **Landing Page:** Hero introduction, trust signals, feature benefits, live scanning reticle preview. | "Analyze Product" CTA, "How It Works" scroll anchor, floating scanner reticle demo. | Confirmed Scope |
| **S-2** | `parakh_analyze_product` | `/analyze` | **Product Input:** Interface for uploading label photos, live camera scanning, or optional barcode search tab. | File dropzone (drag-and-drop), Webcam video feed trigger, Optional barcode search tab. | Confirmed Scope *(Barcode optional)* |
| **S-3** | `parakh_image_preview_quality_check` | `/quality-check` | **Image Quality Check:** Displays uploaded image with detected label bounding box and 3-point automated quality check. | Enlarge image preview modal, "Re-take Photo", "Crop / Adjust", "Proceed to AI Analysis" CTA. | Confirmed Scope |
| **S-4** | `parakh_ai_product_analysis` | `/analyzing` | **AI Analysis Progress:** Visual multi-stage loading pipeline with pulse rings and progress indicators. | Animated progress steps (Enhancement -> OCR -> Extraction -> RAG -> AI Analysis), elapsed time counter. | Confirmed Scope |
| **S-5** | `parakh_product_transparency_report` | `/report/:id` | **Product Transparency Report:** Complete intelligence dashboard showing overall metrics, ingredient categorization, personalized alerts, and evidence citations. | Metric cards, Filter tabs, Share link button, "Save to History", *[Optional] PDF Export button*. | Confirmed Scope *(PDF optional)* |
| **S-6** | `parakh_ingredient_detail` | `/ingredient/:name` | **Ingredient Detail:** Scientific deep-dive into an individual ingredient. | Chemical aliases pill badge, "What is it?", FSSAI/WHO/FDA regulatory status cards, PubMed evidence quotes. | Confirmed Scope |
| **S-7** | `parakh_personalize_your_insights` | `/personalize` | **Personalization Preferences:** Configuration panel to toggle user dietary rules, ingredient sensitivities, and health targets. | Checkbox cards for Sensitivities & Dietary choices, Save button. | Confirmed Scope |
| **S-8** | `parakh_analysis_history` | `/history` | **Analysis History:** Grid/list of previously analyzed products with category filtering, search bar, and date sorting. | Search input, Category filter pills (All, Skincare, Food, Supplements), Sort dropdown, Delete history item. | Confirmed Scope |

---

## 2. Frontend Component Hierarchy

```
src/
├── assets/                  # Brand SVG icons, background glow assets
├── components/
│   ├── common/
│   │   ├── Navbar.jsx       # Header logo, navigation links, primary CTA button
│   │   ├── Footer.jsx       # Branding, copyright, non-medical legal disclaimers
│   │   ├── ReticleOverlay.jsx # Animated scanning box & corner reticle brackets
│   │   ├── MetricCard.jsx   # Reusable stats badge (e.g., 94% Confidence)
│   │   ├── SourceBadge.jsx  # Citation tag for FSSAI / WHO / FDA / PubMed
│   │   ├── ShimmerLoader.jsx # Skeleton screen during data fetches
│   │   └── Modal.jsx        # Image enlarge / Crop dialogs
│   ├── analyze/
│   │   ├── Dropzone.jsx     # Drag-and-drop file upload component
│   │   ├── CameraScanner.jsx# HTML5 Webcam video capture frame
│   │   └── SearchFallback.jsx# [Optional] Barcode & product name text search input
│   ├── quality/
│   │   ├── QualityAuditList.jsx # 3-point checklist (Clarity, Lighting, Framing)
│   │   └── BoundingBoxView.jsx  # Interactive image cropper canvas overlay
│   ├── report/
│   │   ├── ReportHeader.jsx # Product thumbnail, name, category, batch #
│   │   ├── MetricGrid.jsx   # 4-card metric overview
│   │   ├── IngredientSection.jsx # Categorized accordion / tab list of ingredients
│   │   ├── PersonalizedAlerts.jsx # Highlighted user risk matches
│   │   ├── EvidenceSection.jsx  # Citations block with expandable reference quotes
│   │   └── DisclaimerBanner.jsx # Medical legal disclaimer block
│   └── history/
│       ├── HistoryToolbar.jsx # Search bar, filter pills, sort selector
│       └── HistoryCard.jsx    # Card item for past analyzed products
├── context/
│   ├── AnalysisContext.jsx  # Active upload image, quality status, current report data
│   └── PreferenceContext.jsx# Stored user profile preferences (Sensitivities, Dietary)
├── hooks/
│   ├── useImageQuality.js   # Client-side image pre-validation helper
│   ├── useCamera.js         # MediaDevices webcam stream lifecycle manager
│   └── useAnalysisApi.js    # Axios endpoints caller hook
├── pages/                   # 8 Page views mapping 1:1 to Stitch screens
│   ├── LandingPage.jsx
│   ├── AnalyzePage.jsx
│   ├── QualityCheckPage.jsx
│   ├── AnalyzingPage.jsx
│   ├── ReportPage.jsx
│   ├── IngredientDetailPage.jsx
│   ├── PersonalizationPage.jsx
│   └── HistoryPage.jsx
├── services/
│   └── api.js              # Axios REST client instance & endpoint methods
└── styles/
    └── index.css            # Tailwind directives, custom font imports, radial glows
```

---

## 3. UI Design System Tokens (From Stitch Code)

```javascript
// tailwind.config.js theme extension
colors: {
  brand: {
    50: '#ecfdf5',        // Mint Light Surface
    100: '#d1fae5',       // Mint Soft Border
    200: '#a7f3d0',       // Mint Accent Border
    500: '#10b981',       // Emerald Bright Accent
    600: '#059669',       // Emerald Medium
    700: '#047857',       // Emerald Dark
    800: '#065f46',       // Emerald Deep
    900: '#064e3b',       // PARAKH Primary Brand Green
    950: '#022c22',       // Dark Charcoal Green
  },
  canvas: '#fbfbf9',       // Soft Warm Off-White Page Background
  slate: {
    800: '#1e293b',       // Primary Text
    500: '#64748b',       // Muted Text
  }
}
```

---

## 4. Async Stage Flow During Analysis (`/analyzing`)

```javascript
const ANALYSIS_STAGES = [
  { id: 'quality', label: 'Image Quality Verification', duration: 400 },
  { id: 'ocr', label: 'OCR Text Extraction', duration: 1000 },
  { id: 'extraction', label: 'Category-Aware Product & Ingredient Extraction', duration: 800 },
  { id: 'rag', label: 'Retrieving Evidence (FSSAI/WHO/FDA/PubMed)', duration: 1200 },
  { id: 'ai_analysis', label: 'AI Analysis & Personalization', duration: 1400 },
];
```
