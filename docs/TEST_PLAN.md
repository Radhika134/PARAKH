# PARAKH — Testing Strategy & Quality Assurance Plan

## Executive Overview
This document outlines the testing strategy for PARAKH, covering unit tests, integration tests, RAG retrieval evaluation, AI output validation, and end-to-end user flow verification.

---

## 1. Test Suite Architecture

```
tests/
├── unit/
│   ├── test_quality_check.py     # OpenCV blur & lighting calculation math
│   ├── test_ocr_parser.py        # EasyOCR text extraction
│   ├── test_extraction.py       # Category-aware parsing (Skincare, Food, Supplements)
│   ├── test_fuzzy_matching.py    # RapidFuzz canonical name mapping
│   ├── test_rag_retrieval.py     # ChromaDB vector search & similarity thresholding
│   └── test_json_validation.py   # Pydantic schema validation for LLM responses
├── integration/
│   ├── test_api_endpoints.py     # FastAPI test client endpoint integration
│   ├── test_mongo_persistence.py # Motor database read/write queries
│   └── test_pdf_export.py        # [Optional] PDF generator test
├── ai_eval/
│   ├── test_medical_disclaimer.py# Asserts no medical claims present in generated reports
│   └── test_rag_grounding.py     # Asserts all observations match retrieved citations
└── test_dataset/
    ├── sharp_skincare_01.jpg     # Skincare test image
    ├── food_label_02.jpg         # Food & additives test image
    ├── blurry_label_03.jpg       # Quality check failure test case
    └── dark_label_04.jpg         # Underexposed lighting test case
```

---

## 2. Test Execution Plan by Layer

### Layer 1: Computer Vision & OCR Testing
- **Goal:** Verify image quality scoring catches blurry images and OCR extracts raw character streams.
- **Pass Criteria:** Sharp images score `Quality >= 70%`; blurry images trigger `ERR_IMAGE_BLURRY`.

### Layer 2: Category-Aware Extraction Testing
- **Goal:** Verify text extraction across Skincare (INCI), Food (FSSAI/INS additives), and Dietary Supplements.
- **Pass Criteria:** Correctly maps raw strings to canonical dictionary entries with RapidFuzz similarity $\ge 80\%$.

### Layer 3: RAG Retrieval Evaluation
- **Goal:** Ensure vector search returns relevant regulatory citations.
- **Test Metric:** Top-3 Retrieval Recall@3 $\ge 0.85$.

### Layer 4: AI Output & Medical Safety Audit
- **Goal:** Assert LLM outputs strictly follow JSON schema and contain no prohibited medical claims (`cure`, `prescribe`, `diagnose`, `100% safe`).

### Layer 5: End-to-End User Flow Integration
- **Steps Verified:** Upload -> Quality Check -> OCR -> Extraction -> Product DB -> RAG -> AI Analysis -> Transparency Report -> History Persistence.
