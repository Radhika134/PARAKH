# PARAKH — Requirements Specification

## 1. Functional Requirements (FR)

### FR-1: Product Input Handling
- **FR-1.1:** The system shall allow users to upload product label photos via drag-and-drop or file selector (`.jpg`, `.png`, `.webp`).
- **FR-1.2:** The system shall support live camera stream capture for mobile and desktop webcams.
- **FR-1.3 [Optional Enhancement]:** The system may provide an optional search fallback by barcode (UPC/EAN) or product name if barcode database integration is explicitly enabled. *(Noted as an open ambiguity between Report and PPT).*

### FR-2: Automated Image Quality Validation
- **FR-2.1:** Before running OCR, the system shall evaluate image sharpness using Laplacian Variance math.
- **FR-2.2:** The system shall inspect image brightness and contrast levels to prevent OCR failure on overexposed/underexposed images.
- **FR-2.3:** The system shall verify whether a valid ingredient bounding box/framing is present.
- **FR-2.4:** If quality criteria are not met, the system shall provide actionable feedback (e.g., "Image is blurry", "Low contrast") and allow the user to retake or crop the image.

### FR-3: OCR & Computer Vision Text Processing
- **FR-3.1:** The system shall crop and preprocess image Region of Interest (ROI) using grayscale conversion, adaptive thresholding, and noise reduction.
- **FR-3.2:** The system shall extract raw text using an OCR engine (EasyOCR / Tesseract OCR).

### FR-4: Category-Aware Product & Ingredient Extraction
- **FR-4.1:** The system shall parse extracted raw text into structured product metadata (product name, brand, product category) and ingredient lists.
- **FR-4.2:** The extraction layer shall be category-aware across multiple domains:
  - **Skincare / Cosmetics:** INCI ingredient names, functional agents, active compounds.
  - **Processed Foods:** FSSAI ingredient listings, INS/E-number additives, allergens, nutritional notes.
  - **Dietary Supplements:** Active botanical extracts, vitamins, minerals, excipients.
- **FR-4.3:** The system shall match extracted raw ingredient strings against a canonical multi-category ingredient dictionary using fuzzy string matching (RapidFuzz / Levenshtein distance).

### FR-5: Product Database & Knowledge Base Integration
- **FR-5.1:** The system shall check MongoDB for existing verified product records matching the extracted product name or ingredient signature.
- **FR-5.2:** If matched, existing database attributes shall enrich the extracted product payload.

### FR-6: RAG-Driven Evidence Retrieval
- **FR-6.1:** The system shall query a local vector store (ChromaDB / FAISS) using the normalized ingredient payload.
- **FR-6.2:** The vector store shall contain indexed chunks from verified regulatory and scientific sources:
  - FSSAI Food Safety Standards & Regulations
  - WHO Guidelines on Food Additives & Cosmetics
  - US FDA Cosmetic & Ingredient Regulations
  - PubMed peer-reviewed research papers
- **FR-6.3:** Each retrieved chunk must retain metadata including `source_name`, `authority_level`, `section_reference`, and `publication_year`.

### FR-7: AI Analysis & Personalization Engine
- **FR-7.1:** The system shall pass Extracted Product Info + Retrieved Evidence + Active User Preferences into an LLM (Google Gemini API).
- **FR-7.2:** Personalization evaluation (checking ingredients against user sensitivities, dietary choices, and health goals) shall occur directly inside the AI analysis prompt pipeline.
- **FR-7.3:** The LLM shall produce a structured JSON output adhering strictly to `AI_ANALYSIS_SPEC.md`.
- **FR-7.4:** The output shall include:
  - Product Summary & Identity
  - Overall Confidence Score (%)
  - Ingredient Classification Breakdown (Beneficial, Sensitive/Allergens, Additives)
  - Evidence-backed Health Observations
  - Personalized Profile Alerts
  - Exact Source Citations
  - Uncertainty Declarations & Suggested Next Steps

### FR-8: Deep-Dive Ingredient Explorer
- **FR-8.1:** Users shall be able to click on any ingredient in a report to view detailed ingredient insights.
- **FR-8.2:** The view shall display ingredient chemical/common aliases, primary function, regulatory status across FSSAI/WHO/FDA, and scientific evidence quotes.

### FR-9: Persistence & Analysis History
- **FR-9.1:** The system shall store generated transparency reports and user preference profiles in MongoDB.
- **FR-9.2:** Users shall be able to search, filter (by category: Skincare, Food, Supplements), sort (by date), re-open past reports, and delete history items.

### FR-10 [Optional Enhancement]: Export & Sharing
- **FR-10.1 [Optional Enhancement]:** Users may export transparency reports to formatted PDF documents. *(Optional future-ready feature).*
- **FR-10.2:** Users shall be able to share or copy a report summary link.

---

## 2. Non-Functional Requirements (NFR)

### NFR-1: Performance & Latency
- **NFR-1.1:** Image Quality Validation shall respond in `< 800ms`.
- **NFR-1.2:** Complete End-to-End Analysis (OCR + Extraction + RAG + LLM) shall complete in `< 5.0 seconds`.
- **NFR-1.3:** RAG Vector Search retrieval latency shall be `< 200ms`.

### NFR-2: Explainability & Source Attribution
- **NFR-2.1:** Every safety observation or ingredient concern **must** be linked to at least one explicitly cited document from the trusted knowledge base.
- **NFR-2.2:** The system shall never generate unreferenced "black-box" safety claims.

### NFR-3: Reliability & Fallback Gracefulness
- **NFR-3.1:** If OCR confidence is low (<60%), the system shall request manual user text verification instead of processing corrupted text.
- **NFR-3.2:** If RAG evidence is sparse or unavailable for a compound, the system shall declare explicit uncertainty ("Sparse evidence available in current registry").

### NFR-4: Usability & Mobile Responsiveness
- **NFR-4.1:** The UI shall be fully responsive across viewport widths from `360px` (mobile) to `1920px` (4K desktop).
- **NFR-4.2:** The design language shall adhere strictly to the visual identity defined in the 8 Stitch reference screens.

### NFR-5: Security & Privacy
- **NFR-5.1:** Raw uploaded images shall be stored transiently and cleaned up automatically after processing.
- **NFR-5.2:** All API communication between frontend and backend shall occur over HTTPS/TLS.
- **NFR-5.3:** Backend API keys (Gemini API, database credentials) shall reside strictly in environment variables (`.env`).

### NFR-6: Medical Safety Boundaries
- **NFR-6.1:** Every report and ingredient view shall feature an explicit disclaimer: *"PARAKH provides informational product intelligence based on available public guidelines. It is not a medical diagnosis or treatment system."*
