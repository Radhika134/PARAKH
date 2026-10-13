# PARAKH — Implementation Plan (Phase 0 to Phase 10)

## Executive Overview
This document outlines the 11 sequential implementation phases (Phase 0 to Phase 10) for building PARAKH. Each phase defines objectives, features, file targets, dependencies on previous phases, testing checklists, and completion criteria, updated to match the corrected 9-step system pipeline and FastAPI Modular Backend architecture.

---

## Master Phase Roadmap

```mermaid
gantt
    title PARAKH Implementation Roadmap
    dateFormat  YYYY-MM-DD
    section Core Scaffold & Input
    Phase 0: Project Foundation            :p0, 2026-09-17, 2d
    Phase 1: Frontend UI (8 Screens)       :p1, after p0, 3d
    Phase 2: Product Input Module          :p2, after p1, 2d
    section Vision & Processing
    Phase 3: OCR & Computer Vision         :p3, after p2, 3d
    Phase 4: Category-Aware Extraction     :p4, after p3, 3d
    section Data & RAG
    Phase 5: Product DB & KB Ingestion     :p5, after p4, 3d
    Phase 6: Vector DB & RAG Pipeline      :p6, after p5, 3d
    section AI & Persistence
    Phase 7: AI Analysis & Personalization :p7, after p6, 3d
    Phase 8: Transparency Report & History :p8, after p7, 2d
    section Quality & Demo
    Phase 9: Error Handling & Fallbacks    :p9, after p8, 2d
    Phase 10: Integration, Testing & Demo  :p10, after p9, 2d
```

---

## Phase Specifications

### Phase 0 — Project Foundation
- **Objective:** Setup project environment, repository scaffold, React Vite frontend, and FastAPI Modular Backend.
- **Features / Modules:** Root directory structure, Python virtualenv, Vite React setup, Tailwind CSS theme tokens (`brand-900`, `hero-glow`), FastAPI router initialization.
- **Files Required:**
  - `package.json`, `vite.config.js`, `tailwind.config.js`
  - `backend/requirements.txt`, `backend/app/main.py`, `backend/app/config.py`, `backend/.env`
- **Dependencies:** None.
- **Testing Checklist:**
  - [ ] React Vite frontend builds cleanly (`npm run dev`).
  - [ ] FastAPI backend starts on port 8000 (`uvicorn app.main:app --reload`).
  - [ ] Tailwind custom colors and fonts (`Plus Jakarta Sans`) render correctly.
- **Completion Criteria:** Client and server running concurrently with CORS enabled.

---

### Phase 1 — Frontend UI + Navigation (The 8 Stitch Screens)
- **Objective:** Implement all 8 Stitch reference screens as interactive React components with client-side routing.
- **Features / Modules:** Header navbar, footer disclaimers, screen routes (`/`, `/analyze`, `/quality-check`, `/analyzing`, `/report/:id`, `/ingredient/:name`, `/personalize`, `/history`), responsive containers, background radial glows.
- **Files Required:**
  - `src/pages/` (`LandingPage.jsx`, `AnalyzePage.jsx`, `QualityCheckPage.jsx`, `AnalyzingPage.jsx`, `ReportPage.jsx`, `IngredientDetailPage.jsx`, `PersonalizationPage.jsx`, `HistoryPage.jsx`)
  - `src/components/common/` (`Navbar.jsx`, `Footer.jsx`, `ReticleOverlay.jsx`)
  - `src/App.jsx` (React Router config)
- **Dependencies:** Phase 0.
- **Testing Checklist:**
  - [ ] Navigation links route correctly between all 8 pages without page reload.
  - [ ] Visual design matches Stitch code (emerald palette, Jakarta Sans font, rounded card containers).
  - [ ] Mobile responsive layout verified across mobile and desktop viewports.
- **Completion Criteria:** All 8 screens navigable with static demo mock data.

---

### Phase 2 — Product Input Module
- **Objective:** Build image file dropzone, HTML5 webcam scanner stream, and optional barcode search tab.
- **Features / Modules:** Drag-and-drop file dropzone (`react-dropzone`), HTML5 video stream capture, optional barcode search tab *(optional future-ready feature)*.
- **Files Required:**
  - `src/components/analyze/Dropzone.jsx`
  - `src/components/analyze/CameraScanner.jsx`
  - `src/components/analyze/SearchFallback.jsx` *(Optional)*
- **Dependencies:** Phase 1.
- **Testing Checklist:**
  - [ ] File dropzone accepts `.jpg`, `.png`, `.webp` images and passes file into context.
  - [ ] Webcam scanner captures camera frame cleanly.
- **Completion Criteria:** User can select/capture a label image and pass image data into analysis state.

---

### Phase 3 — OCR + Computer Vision Pipeline
- **Objective:** Implement OpenCV image quality check and EasyOCR character extraction.
- **Features / Modules:** Laplacian blur test, contrast check, EasyOCR/Tesseract character extraction.
- **Files Required:**
  - `backend/app/services/quality_service.py`
  - `backend/app/services/ocr_service.py`
  - `backend/app/api/v1/endpoints/analyze.py`
- **Dependencies:** Phase 2.
- **Testing Checklist:**
  - [ ] OpenCV flags blurry image test case (`Laplacian < 100`).
  - [ ] EasyOCR extracts raw text stream from test image.
- **Completion Criteria:** `POST /api/v1/analyze/quality-check` returns quality audit JSON; OCR outputs raw character stream.

---

### Phase 4 — Category-Aware Product & Ingredient Extraction Layer
- **Objective:** Build category-aware parser to extract product metadata and ingredients across skincare, food, and supplement domains.
- **Features / Modules:** Domain detector, header/delimiter isolator, RapidFuzz fuzzy matching against multi-domain canonical dictionaries.
- **Files Required:**
  - `backend/app/services/extraction_service.py`
  - `backend/data/dictionaries/` (Skincare INCI, Food Additives, Supplements CSV/JSON)
- **Dependencies:** Phase 3.
- **Testing Checklist:**
  - [ ] Parses skincare label into INCI ingredient array.
  - [ ] Parses food label into FSSAI ingredient & additive array.
  - [ ] Fuzzy matching maps raw strings to canonical dictionary entries with score $\ge 80\%$.
- **Completion Criteria:** Returns structured `ExtractedProductPayload` from raw OCR text.

---

### Phase 5 — Product Database & Knowledge Base Ingestion
- **Objective:** Setup MongoDB collections and ingest regulatory documents (FSSAI, WHO, FDA, PubMed).
- **Features / Modules:** Motor async MongoDB connection pool, product records collection, document ingestion script.
- **Files Required:**
  - `backend/app/db/mongo.py`, `backend/app/db/models.py`
  - `backend/app/services/product_db_service.py`
  - `backend/scripts/ingest_knowledge_docs.py`
- **Dependencies:** Phase 4.
- **Testing Checklist:**
  - [ ] MongoDB connects successfully and initializes collections.
  - [ ] Ingestion script cleans and chunks regulatory PDFs/JSONs.
- **Completion Criteria:** Product DB lookup operational; regulatory documents prepared for vector indexing.

---

### Phase 6 — Vector Database & RAG Pipeline
- **Objective:** Setup local ChromaDB vector store, generate embeddings, and implement semantic retrieval.
- **Features / Modules:** ChromaDB initialization, SentenceTransformers embeddings (`all-MiniLM-L6-v2`), similarity search service.
- **Files Required:**
  - `backend/app/db/vector_store.py`
  - `backend/app/services/rag_service.py`
- **Dependencies:** Phase 5.
- **Testing Checklist:**
  - [ ] ChromaDB indexes knowledge chunks with metadata tags (`authority`, `source`).
  - [ ] Querying "Niacinamide" returns top-3 relevant regulatory passages with similarity $\ge 0.65$.
- **Completion Criteria:** RAG service retrieves evidence chunks with source attribution in `< 200ms`.

---

### Phase 7 — AI Analysis & Personalization Engine
- **Objective:** Integrate Google Gemini API, construct structured prompt, and evaluate personalization directly in AI analysis.
- **Features / Modules:** Gemini API JSON mode wrapper, prompt template builder (Product Info + RAG Evidence + User Preferences).
- **Files Required:**
  - `backend/app/services/ai_analysis_service.py`
  - `backend/app/schemas/report.py`
- **Dependencies:** Phase 4, Phase 6.
- **Testing Checklist:**
  - [ ] Gemini API returns valid JSON matching `AI_ANALYSIS_SPEC.md` schema.
  - [ ] User sensitivity preference (e.g., "fragrance") triggers highlighted warning in `personalized_insights`.
- **Completion Criteria:** Single-stage AI Analysis engine outputs validated transparency report JSON.

---

### Phase 8 — Transparency Report UI & History Persistence
- **Objective:** Wire transparency report screen (S-5) to backend API, render metric cards and evidence callouts, and save reports to MongoDB.
- **Features / Modules:** Metric grid, categorized ingredient breakdown, personalized risk banners, history list endpoint, search/filter toolbar. *[Optional PDF generator script]*
- **Files Required:**
  - `src/pages/ReportPage.jsx`, `HistoryPage.jsx`
  - `backend/app/api/v1/endpoints/history.py`
  - `backend/app/services/pdf_service.py` *(Optional Enhancement)*
- **Dependencies:** Phase 7.
- **Testing Checklist:**
  - [ ] Report screen renders live data from `POST /api/v1/analyze/run`.
  - [ ] Analyzed products auto-save to MongoDB `reports` and `analysis_history` collections.
  - [ ] History page filters items by category and search text.
- **Completion Criteria:** Transparency report renders cleanly and persists to history.

---

### Phase 9 — Error Handling & Edge Cases
- **Objective:** Implement client error boundaries, quality failure screens, and sparse evidence fallbacks.
- **Features / Modules:** FastAPI global exception middleware, React error boundaries, manual ingredient editor fallback.
- **Files Required:**
  - `backend/app/core/exceptions.py`
  - `src/components/common/ErrorBoundary.jsx`
- **Dependencies:** Phase 8.
- **Testing Checklist:**
  - [ ] Uploading blurry image displays Screen S-3 quality check failure with retake CTA.
  - [ ] LLM timeout triggers rule-based report fallback without crashing UI.
  - [ ] Sparse RAG evidence displays explicit uncertainty notice.
- **Completion Criteria:** System gracefully handles all edge cases in error matrix.

---

### Phase 10 — Full Integration, Testing & Presentation Polish
- **Objective:** Execute end-to-end integration tests, polish visual micro-animations, and prepare demo assets.
- **Features / Modules:** End-to-end test script execution, animation tuning, presentation screenshots.
- **Files Required:**
  - `tests/integration/test_full_flow.py`
- **Dependencies:** Phase 9.
- **Testing Checklist:**
  - [ ] Full E2E flow runs from Landing Page -> Upload -> Quality Check -> Progress -> Report -> History in `< 5.0 seconds`.
  - [ ] Non-medical legal disclaimers visible on all report views.
- **Completion Criteria:** Application is feature-complete, fully tested, and ready for project presentation.
