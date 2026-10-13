# PARAKH — API Specification

## Executive Overview
This document defines the RESTful API endpoints for the PARAKH FastAPI Modular Backend.

- **Base URL:** `/api/v1`
- **Content-Type:** `application/json` (unless `multipart/form-data`)

---

## Endpoint Summary Table

| Method | Endpoint Path | Purpose | Request Type | Response Type | Scope Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/analyze/quality-check` | Image quality validation (blur, lighting, framing) | `multipart/form-data` | `QualityAuditResponse` | Confirmed Scope |
| `POST` | `/analyze/run` | Execute complete analysis pipeline (OCR -> Extraction -> RAG -> AI) | `multipart/form-data` | `TransparencyReport` | Confirmed Scope |
| `GET` | `/reports/{report_id}` | Fetch existing transparency report by ID | None | `TransparencyReport` | Confirmed Scope |
| `GET` | `/reports/{report_id}/pdf` | Export transparency report as PDF | None | `application/pdf` | Optional Enhancement |
| `GET` | `/ingredients/{ingredient_name}` | Deep-dive ingredient explorer query | Query Params | `IngredientDetailResponse` | Confirmed Scope |
| `GET` | `/preferences` | Retrieve active user preference profile | None | `PreferenceProfile` | Confirmed Scope |
| `PUT` | `/preferences` | Update user dietary & sensitivity preferences | `PreferenceProfile` | `PreferenceProfile` | Confirmed Scope |
| `GET` | `/history` | Fetch user's analysis history list | Query Params | `HistoryListResponse` | Confirmed Scope |
| `DELETE`| `/history/{history_id}` | Remove item from analysis history | None | `{ success: true }` | Confirmed Scope |
| `GET` | `/products/search` | Search product database by name or optional barcode | Query Params | `ProductSearchResult` | Optional / Future-Ready |

---

## Key Endpoint Schemas

### 1. `POST /analyze/quality-check`
Runs OpenCV image quality verification before full backend processing.

#### Response (`200 OK`)
```json
{
  "passed": true,
  "quality_score": 92,
  "metrics": {
    "text_clarity": { "status": "PASSED", "laplacian_score": 184.2 },
    "lighting_contrast": { "status": "PASSED", "mean_brightness": 128.5 },
    "label_framing": { "status": "PASSED", "bounding_box_detected": true }
  },
  "temp_image_id": "TMP-IMG-882910"
}
```

---

### 2. `POST /analyze/run`
Executes complete product analysis pipeline:
1. OCR Text Extraction
2. Category-Aware Product & Ingredient Extraction
3. Product DB & Canonical Lookup
4. RAG Evidence Retrieval
5. AI Analysis (Product Info + Evidence + User Preferences)
6. Report & History Persistence

#### Response (`200 OK`)
Returns complete JSON Transparency Report matching `AI_ANALYSIS_SPEC.md`.

---

### 3. Error Response Schema

```json
{
  "error": true,
  "code": "ERR_IMAGE_BLURRY",
  "message": "Image failed quality check because text clarity score is below acceptable threshold.",
  "suggestion": "Hold camera steady and ensure adequate lighting before retaking photo.",
  "timestamp": "2026-09-16T18:10:51+05:30"
}
```
