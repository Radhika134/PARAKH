/**
 * upload.js — Multer middleware for image file uploads.
 *
 * Accepts: image/jpeg, image/png, image/webp
 * Max size: 15 MB
 * Storage: memory (buffer) — we forward bytes directly to the Python sidecar,
 *          no disk writes needed in Express.
 */

const multer = require('multer');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Please upload a JPG, PNG, or WebP image.`
      ),
      false
    );
  }
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
});

module.exports = upload;
