const mongoose = require('mongoose');

const analysisHistorySchema = new mongoose.Schema({
  history_id: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, required: true, index: true },
  report_id: { type: String, required: true },
  product_name: { type: String, required: true },
  category: { type: String, default: 'unknown' },
  confidence_score: { type: Number, default: 0 },
  flagged_ingredients_count: { type: Number, default: 0 },
  thumbnail_url: { type: String, default: null },
  analyzed_at: { type: Date, default: Date.now, index: true }
});

// Compound Index: user_id + analyzed_at
analysisHistorySchema.index({ user_id: 1, analyzed_at: -1 });

module.exports = mongoose.model('AnalysisHistory', analysisHistorySchema);
