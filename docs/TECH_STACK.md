# PARAKH — Technology Stack & Evaluation

## Executive Overview
This document outlines the selected technology stack for PARAKH, evaluating each component against college project requirements: developer velocity, zero/low deployment cost, modularity, and high technical performance.

---

## Technology Selection Matrix

| Sub-System | Primary Choice | Evaluated Alternatives | Rationale for Recommendation | Scope Status |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React 18 + Vite** | Next.js, Vue 3 | Fast HMR, rich ecosystem, client-side SPA architecture, seamless integration with Tailwind CSS. | Confirmed Scope |
| **Styling & CSS** | **Tailwind CSS v3** | Vanilla CSS, Bootstrap | Utility-first styling matching Stitch reference code tokens (`brand-900`, `hero-glow`, rounded card containers). | Confirmed Scope |
| **Backend Architecture** | **Python 3.11 + FastAPI (Modular Monolith)** | Microservices, Express, Flask | Single runnable backend package with modular Python services; native integration with OpenCV, EasyOCR, SentenceTransformers, Gemini API. | Confirmed Scope |
| **Vision & Image Quality** | **OpenCV (`cv2`)** | PIL, Scikit-Image | Fast C++ backend wrappers for Laplacian blur variance calculation and contrast thresholding (< 50ms execution). | Confirmed Scope |
| **OCR Engine** | **EasyOCR / Tesseract OCR** | Cloud Vision API | Free, open-source, local execution with zero API cost per scan. | Confirmed Scope |
| **Extraction Layer** | **Category-Aware Extractor (Python `re` + RapidFuzz)** | Static INCI parser | Multi-domain text parsing across Skincare (INCI), Food (FSSAI/Additives), and Dietary Supplements. | Confirmed Scope |
| **Vector Database** | **ChromaDB (Local Persistent)** | Pinecone, Qdrant Cloud | In-memory / local disk persistence (`./data/chroma_db`); zero cloud account configuration needed. | Confirmed Scope |
| **Embedding Model** | **`all-MiniLM-L6-v2`** | OpenAI Embeddings | Local execution via SentenceTransformers; fast 384-dimensional embeddings; zero API token cost. | Confirmed Scope |
| **Primary Database** | **MongoDB (Motor Async)** | PostgreSQL, SQLite | Schema flexibility for nested ingredient trees, multi-domain product records, and JSON transparency reports. | Confirmed Scope |
| **LLM Reasoning Engine**| **Google Gemini 1.5 Flash API** | GPT-4o, Local Ollama | Fast execution speed (< 1.5s latency), generous free tier rate limits, native JSON output mode (`response_mime_type="application/json"`). | Confirmed Scope |
| **[Optional] Barcode Search**| **Open Food Facts API** | Custom Barcode DB | Fallback barcode scanner/lookup tab. | Optional / Future-Ready |
| **[Optional] PDF Exporter** | **ReportLab (Python)** | Puppeteer, HTML2PDF | Exports transparency report to formatted PDF document. | Optional Enhancement |
