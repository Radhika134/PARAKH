# PARAKH — Error Handling & Edge Case Matrix

## Executive Overview
This document defines failure recovery strategies and edge-case handling rules across every stage of the PARAKH pipeline. The platform is designed to fail gracefully, providing clear user feedback rather than crashing or rendering empty fallback states.

---

## 1. Master Error & Recovery Matrix

| Error Code | Stage | Trigger Condition | System Behavior | UI UX Recovery Action |
| :--- | :--- | :--- | :--- | :--- |
| `ERR_INVALID_FILE_FORMAT` | Gateway | Uploaded file is not `.jpg`, `.png`, or `.webp`. | Reject request with HTTP `400 Bad Request`. | Toast alert: *"Unsupported file format. Please upload JPG or PNG."* |
| `ERR_IMAGE_BLURRY` | Quality Check | Laplacian variance score `< 100.0`. | Halt analysis before calling OCR. | Render Screen S-3 with warning: *"Image text is too blurry. Hold camera steady and retake."* |
| `ERR_IMAGE_LIGHTING` | Quality Check | Brightness mean `< 40` (dark) or `> 220` (glare). | Halt analysis before calling OCR. | Render Screen S-3 with warning: *"Poor lighting detected. Avoid direct glare or shadow."* |
| `ERR_OCR_ZERO_TEXT` | OCR Engine | EasyOCR detects `< 5` characters total. | Return HTTP `422 Unprocessable Entity`. | Show retry prompt: *"No readable text found. Ensure ingredient label is centered."* |
| `ERR_NO_INGREDIENTS_PARSED` | Extraction | OCR succeeded, but category-aware parser failed to isolate ingredient list. | Return partial OCR text + manual edit mode trigger. | Open manual text box: *"We couldn't automatically isolate the ingredient list. Please select or paste text."* |
| `ERR_RAG_SPARSE_EVIDENCE` | RAG Engine | Vector DB returns no chunks above `0.65` similarity. | Proceed with general LLM categorization + declare uncertainty. | Report Screen S-5 displays badge: *"Sparse Evidence: Regulatory citations unavailable for this compound."* |
| `ERR_LLM_TIMEOUT` | AI Analysis | Google Gemini API fails to respond within `8.0` seconds. | Fall back to rule-based JSON report generated from DB rules. | Display banner: *"AI synthesis delayed. Showing rule-based analysis."* |
| `ERR_DB_CONNECTION_DOWN` | Persistence | MongoDB connection lost during report saving. | Serve report to client in-memory + queue background retry. | Display toast: *"Report generated. Save to history pending connection restoration."* |
| `ERR_NETWORK_DISCONNECT` | Frontend | Client loses internet connectivity during analysis. | Pause progress loader on Screen S-4. | Inline alert: *"Network connection lost. Reconnecting..."* with Retry CTA. |

---

## 2. Standard Error Response JSON Contract

```json
{
  "error": true,
  "code": "ERR_IMAGE_BLURRY",
  "message": "Image text clarity score (74.2) is below minimum acceptable threshold (100.0).",
  "suggestion": "Place product on a flat surface in good light and hold camera steady.",
  "details": {
    "laplacian_score": 74.2,
    "required_threshold": 100.0
  },
  "timestamp": "2026-09-16T18:10:51+05:30"
}
```
