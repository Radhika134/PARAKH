# PARAKH — Architectural Decision Records (ADR)

## ADR-001: Separation of Image Quality Verification from Full Analysis Pipeline
- **Status:** APPROVED
- **Context:** Running OCR, RAG vector searches, and LLM API calls on blurry or unreadable label photos wastes compute resources, API token quota, and user time.
- **Decision:** Introduce a lightweight, dedicated OpenCV pre-check endpoint (`POST /api/v1/analyze/quality-check`) that evaluates blur (Laplacian variance) and lighting before full analysis is triggered.
- **Consequences:** Saves API costs, improves user feedback speed (< 800ms for pre-check), and prevents garbage data from reaching downstream AI layers.

---

## ADR-002: Local ChromaDB Vector Store over Cloud Vector Databases
- **Status:** APPROVED
- **Context:** Cloud vector DBs (e.g., Pinecone) introduce deployment friction, require API keys, and depend on internet connectivity during local evaluation.
- **Decision:** Use **ChromaDB** in persistent local disk mode (`./data/chroma_db`) paired with the local embedding model `all-MiniLM-L6-v2`.
- **Consequences:** Zero external API cost for embeddings/vector search, 100% offline testability, fast local retrieval (< 200ms).

---

## ADR-003: FastAPI Modular Monolithic Backend over Distributed Microservices
- **Status:** APPROVED
- **Context:** The project requires web REST endpoints, image processing (OpenCV), NLP text parsing, vector search, and LLM orchestration.
- **Decision:** Build a single, **FastAPI Modular Monolithic Backend** in Python 3.11 rather than microservices or split Node.js/Python servers.
- **Consequences:** Eliminates networking & IPC overhead between microservices, simplifies environment setup for a college project, and provides interactive OpenAPI documentation (`/docs`).

---

## ADR-004: Strict JSON Contract Mode for LLM Transparency Output
- **Status:** APPROVED
- **Context:** LLMs naturally generate unstructured conversational markdown text, which causes fragile frontend parsing and layout breakages.
- **Decision:** Enforce Google Gemini API `response_mime_type="application/json"` using a strict Pydantic JSON schema (`AI_ANALYSIS_SPEC.md`).
- **Consequences:** Guarantees deterministic response structures, enabling React UI components (metric cards, evidence blocks, risk banners) to render safely.

---

## ADR-005: Category-Aware Extraction Layer over Universal INCI Parsing
- **Status:** APPROVED
- **Context:** INCI (International Nomenclature Cosmetic Ingredient) standards apply only to skincare/cosmetics. PARAKH also analyzes processed foods (FSSAI/INS additives) and dietary supplements.
- **Decision:** Build a category-aware product and ingredient extraction layer handling multi-domain label structures.
- **Consequences:** Expands product category support beyond skincare without misclassifying food additives or dietary supplements as cosmetic chemicals.

---

## ADR-006: Barcode Search Functionality as Optional / Future-Ready Feature
- **Status:** APPROVED (Open Decision Recorded)
- **Context:** A discrepancy exists between the PARAKH Project Report (focusing on label photo input) and PPT (mentioning barcode search).
- **Decision:** Record barcode search as an **Optional / Future-Ready Feature**. Core development prioritizes photo/camera label analysis.
- **Consequences:** Resolves scope contradiction without silently inventing mandatory requirements.

---

## ADR-007: Classification of PDF Export as an Optional Enhancement
- **Status:** APPROVED
- **Context:** PDF export is not defined as a mandatory core deliverable in primary project materials.
- **Decision:** Classify PDF export as an **Optional Enhancement** rather than a required Phase 7 output.
- **Consequences:** Focuses core development effort on the interactive web transparency report.

---

## ADR-008: Single-Stage Integrated Personalization in AI Analysis
- **Status:** APPROVED
- **Context:** Personalization (matching ingredients against user sensitivities, dietary rules, and health targets) is an integral part of AI analysis rather than an isolated post-report stage.
- **Decision:** Pass user preference profiles directly into the AI Analysis prompt alongside product info and RAG evidence:
  $$\text{Product Info} + \text{Evidence} + \text{User Preferences} \longrightarrow \text{AI Analysis} \longrightarrow \text{Report}$$
- **Consequences:** Eliminates redundant API calls and produces unified, contextually aware personalized transparency reports.

---

## ADR-009: Non-Medical Information Intelligence Boundary Enforcement
- **Status:** APPROVED
- **Context:** Product intelligence applications risk user misinterpretation if health observations sound like diagnostic claims or safety guarantees.
- **Decision:** Programmatically enforce non-medical guardrails in both LLM system prompts and UI disclaimers.
- **Consequences:** Mitigates legal liability, maintains scientific integrity, and sets clear user expectations.
