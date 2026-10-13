# PARAKH — System Architecture

## Executive Overview
The PARAKH architecture is designed as a **FastAPI Modular Monolithic Backend** paired with a React Single-Page Application (SPA). It cleanly isolates system responsibilities—Image Quality Verification, OCR/Vision, Category-Aware Product & Ingredient Extraction, Database Lookup, RAG Semantic Search, AI Analysis with Personalization, and History Persistence—into cohesive Python modules within a single runnable backend package.

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TB
    subgraph Client Tier [Frontend - React / Vite SPA]
        UI[UI Views: 8 Stitch Screens]
        State[Client State / React Context]
        APIClient[Axios REST API Client]
    end

    subgraph Backend Tier [FastAPI Modular Monolithic Backend]
        Gateway[FastAPI Router & Middleware]
        QualityModule[1. Image Quality Engine OpenCV]
        OCRModule[2. OCR Engine EasyOCR / Tesseract]
        ExtractionModule[3. Category-Aware Product & Ingredient Extractor]
        DBModule[4. Product DB & Knowledge Base Module]
        RAGModule[5. RAG Retrieval Engine ChromaDB]
        AIModule[6. AI Analysis Engine Gemini API + Preferences]
        HistoryModule[7. History & Persistence Service]
    end

    subgraph Data & AI Infrastructure
        VectorDB[(ChromaDB Vector Store)]
        MongoDB[(MongoDB Database)]
        ExternalLLM[Google Gemini 1.5 Flash API]
        KBStore[FSSAI / WHO / FDA / PubMed Documents]
    end

    %% Flow Connections
    UI <--> State
    State <--> APIClient
    APIClient <-->|REST / JSON| Gateway
    
    Gateway --> QualityModule
    QualityModule --> OCRModule
    OCRModule --> ExtractionModule
    ExtractionModule --> DBModule
    DBModule --> RAGModule
    RAGModule --> AIModule
    AIModule --> HistoryModule

    KBStore -->|Ingestion & Embeddings| VectorDB
    RAGModule <-->|Semantic Search| VectorDB
    AIModule <-->|Product Info + Evidence + Preferences| ExternalLLM
    DBModule <-->|Product & Canonical Ingredient DB| MongoDB
    HistoryModule <-->|Save Reports & User Preferences| MongoDB
```

---

## 2. Component Responsibility Matrix

| Layer / Module | Technology Choice | Core Responsibilities | Scope Status |
| :--- | :--- | :--- | :--- |
| **Frontend SPA** | React 18 + Vite + Tailwind CSS | Renders 8 Stitch UI screens; manages camera stream & file drag-and-drop; maintains client context. | Confirmed Scope |
| **API Gateway & Router** | FastAPI + Pydantic v2 | Modular API routing, request validation, error formatting, CORS middleware. | Confirmed Scope |
| **1. Image Quality Module** | OpenCV + NumPy | Evaluates Laplacian blur variance, brightness histograms, and label framing bounding boxes. | Confirmed Scope |
| **2. OCR Module** | EasyOCR / Tesseract OCR | Extracts raw character strings and bounding boxes from preprocessed label images. | Confirmed Scope |
| **3. Product & Ingredient Extractor** | Python `re` + RapidFuzz | Category-aware text parser (Skincare INCI, Food Additives/FSSAI, Supplements) and canonical dictionary matcher. | Confirmed Scope |
| **4. Product DB & KB Module** | Motor / PyMongo + MongoDB | Lookups for existing verified product records and canonical ingredient master definitions. | Confirmed Scope |
| **5. RAG Retrieval Module** | ChromaDB + SentenceTransformers | Performs vector similarity search over indexed FSSAI, WHO, FDA, and PubMed knowledge chunks. | Confirmed Scope |
| **6. AI Analysis Engine** | Google Gemini API | Synthesizes Extracted Product Info + RAG Evidence + User Preferences into structured JSON reports. | Confirmed Scope |
| **7. History & Persistence** | Motor / PyMongo | Saves user preference profiles, analysis reports, and search history index records. | Confirmed Scope |
| **[Optional] Barcode Lookup** | Open Food Facts / Barcode API | Fallback product search via UPC/EAN barcode. | Optional / Future-Ready |
| **[Optional] PDF Generator** | ReportLab | Exports transparency report to formatted PDF document. | Optional Enhancement |

---

## 3. End-to-End Analysis Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (React)
    participant API as Backend Router (FastAPI)
    participant Quality as Quality Module
    participant OCR as OCR Module
    participant Extractor as Extraction Module
    participant DB as Product DB & MongoDB
    participant RAG as RAG Module & ChromaDB
    participant AI as AI Analysis Engine (Gemini)

    User->>FE: 1. Uploads Label Image / Camera Frame
    FE->>API: 2. POST /api/v1/analyze/quality-check (Image File)
    API->>Quality: 3. Run OpenCV Blur, Lighting & Framing Audit
    Quality-->>API: 4. Audit Result { passed: true, score: 92% }
    API-->>FE: 5. Display Quality Verification (Passed 3/3)
    
    User->>FE: 6. Clicks "Proceed to AI Analysis"
    FE->>API: 7. POST /api/v1/analyze/run { image_id, user_preferences }
    
    API->>OCR: 8. Extract Raw Text from Image
    OCR-->>API: 9. Raw Character Stream
    
    API->>Extractor: 10. Execute Category-Aware Extraction (Skincare/Food/Supplement)
    Extractor-->>API: 11. Extracted Product Payload & Canonical Ingredients List
    
    API->>DB: 12. Lookup Product DB & Canonical Registries
    DB-->>API: 13. Enriched Product Metadata
    
    API->>RAG: 14. Query VectorDB for Ingredient Evidence (Top-k)
    RAG-->>API: 15. Retrieved Evidence Chunks [FSSAI, WHO, FDA, PubMed]
    
    API->>AI: 16. AI Analysis: Extracted Product Info + Evidence + User Preferences
    AI-->>API: 17. Validated Structured JSON Transparency Report
    
    API->>DB: 18. Save Report Document & Analysis History
    DB-->>API: 19. Persistence Confirmed { report_id: "REP-9921" }
    
    API-->>FE: 20. Return Transparency Report JSON
    FE->>User: 21. Render Product Transparency Report Screen
```

---

## 4. Key Architectural Guarantees

1. **Modular Monolith Design:** Clean module boundaries inside a single FastAPI application. OCR, RAG, Extraction, and AI modules are separated into distinct services with zero microservice deployment overhead.
2. **Corrected Pipeline Continuity:** OCR text passes strictly into Category-Aware Extraction, which enriches the payload through Product DB lookups before RAG retrieval is queried.
3. **Integrated Personalization:** User preference profiles are submitted directly into the AI Analysis prompt alongside product data and RAG evidence, ensuring personalization insights are synthesized holistically.
