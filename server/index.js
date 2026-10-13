require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// ── Middleware ──────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PARAKH API', version: '1.0.0' });
});

// Phase 3 & 4: OCR + Extraction routes
const analyzeRouter = require('./routes/analyze');
app.use('/api/v1/analyze', analyzeRouter);

// Phase 5: Database & Knowledge Base routes
const productRouter         = require('./routes/product');
const ingredientRouter      = require('./routes/ingredient');
const knowledgeSourceRouter = require('./routes/knowledgeSource');
const ragRoutes             = require('./routes/rag');

app.use('/api/v1/products',          productRouter);
app.use('/api/v1/ingredients',       ingredientRouter);
app.use('/api/v1/knowledge-sources', knowledgeSourceRouter);
app.use('/api/v1/rag',               ragRoutes);


// ── Global error handler ────────────────────────────────────────────────────────
// Catches any unhandled errors thrown from routes/middleware
app.use((err, req, res, next) => {
  console.error('[Express] Unhandled error:', err.message);
  res.status(500).json({
    error:   true,
    code:    'ERR_INTERNAL',
    message: 'An unexpected server error occurred.',
  });
});

// ── Start ───────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[PARAKH] Express server running on http://localhost:${PORT}`);
  console.log('[PARAKH] OCR: tesseract.js (Node.js) | Quality: sharp (Node.js)');
});
