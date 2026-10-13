const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  report_id: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, required: true, index: true },
  product_id: { type: String, default: null },
  analysis_timestamp: { type: Date, default: Date.now, index: true },
  metrics: {
    ingredients_detected_count: { type: Number, default: 0 },
    confidence_score: { type: Number, default: 0 },
    evidence_sources_count: { type: Number, default: 0 },
    verification_status: { type: String, default: 'LABEL_VERIFIED' }
  },
  ingredient_breakdown: {
    beneficial: [{ name: String, function: String, evidence_tag: String }],
    sensitivities_allergens: [{ name: String, concern: String, evidence_tag: String }],
    additives_preservatives: [{ name: String, purpose: String, regulatory_limit: String }]
  },
  personalized_insights: [{
    type: { type: String },
    matched_preference: { type: String },
    message: { type: String }
  }],
  evidence_citations: [{
    authority: { type: String },
    source_name: { type: String },
    quote: { type: String }
  }],
  uncertainty_declaration: { type: String, default: '' },
  disclaimer: {
    type: String,
    default: 'PARAKH provides informational product intelligence based on available public guidelines. It is not a medical diagnosis or treatment system.'
  }
});

// Compound Index: user_id + analysis_timestamp
reportSchema.index({ user_id: 1, analysis_timestamp: -1 });

module.exports = mongoose.model('Report', reportSchema);
