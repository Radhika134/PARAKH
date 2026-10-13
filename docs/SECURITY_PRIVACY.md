# PARAKH — Security & Privacy Specification

## Executive Overview
The PARAKH platform processes user-uploaded photos and health/dietary preference data. This document outlines security and privacy measures tailored to the FastAPI Modular Backend architecture.

---

## 1. Secrets & API Key Management

1. **Zero Client Secret Exposure:** API credentials for Google Gemini API and MongoDB connection strings must **never** be exposed in client code or committed to version control (`git`).
2. **Environment Variable Isolation:** Credentials are managed by `pydantic-settings` on the backend:

```ini
# Backend .env configuration
GEMINI_API_KEY=AIzaSyD...
MONGO_URI=mongodb+srv://parakh_admin:...@cluster.mongodb.net/parakh_db
CHROMA_PERSIST_DIR=./data/chroma_db
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
ENVIRONMENT=development
```

---

## 2. Image Data Privacy & Transient Cleanup Lifecycle

1. **EXIF Metadata Stripping:** OpenCV preprocessing permanently removes all EXIF metadata (GPS location, camera serial numbers) from uploaded images.
2. **Transient Storage Lifecycle:** Uploaded raw photos are stored in temporary scratch space (`/tmp/uploads/`).
3. **Auto-Purge Task:** A background task purges raw image files older than `60 minutes`.
4. **Permanent Assets:** Only cropped product label thumbnails (`< 200 KB`) are retained in permanent storage for history display.

---

## 3. User Privacy & Non-Medical Boundaries

1. **Anonymous Session Support:** Users do not need to provide personally identifiable information (PII) to analyze products or set preferences.
2. **Non-Medical Boundary:** The system system prompt explicitly forbids the AI from making medical diagnoses, prescriptions, or absolute safety claims.
3. **Mandatory Disclaimer:** Every report and ingredient view contains the disclaimer:
   > *"PARAKH provides informational product intelligence based on available public guidelines (FSSAI, WHO, FDA, PubMed). It is not a medical diagnosis or treatment system."*
