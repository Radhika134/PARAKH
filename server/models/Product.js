const mongoose = require('mongoose');

const extractedIngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalText: { type: String },
  extractionConfidence: { type: Number, default: 75 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  product_id: { type: String, required: true, unique: true, index: true },
  barcode: { type: String, sparse: true, index: true },
  brand_name: { type: String, default: null },
  product_name: { type: String, default: null, index: 'text' },
  domain_category: {
    type: String,
    enum: ['Food', 'Skincare', 'Dietary Supplements', 'Supplements', 'food', 'skincare', 'supplements', 'unknown'],
    default: 'unknown',
    index: true
  },
  batch_number: { type: String, default: null },
  raw_ocr_text: { type: String, default: '' },
  extracted_ingredients: [extractedIngredientSchema],
  warnings: [{ type: String }],
  claims: [{ type: String }],
  usage: [{ type: String }],
  nutrition: [{ type: String }],
  allergens: [{ type: String }],
  extraction_metadata: {
    source: { type: String, default: 'ocr' },
    ocrConfidence: { type: Number, default: 0 },
    extractionConfidenceScore: { type: Number, default: 0 },
    productNameDetected: { type: Boolean, default: false },
    brandDetected: { type: Boolean, default: false },
    categoryDetected: { type: Boolean, default: false },
    ingredientsDetected: { type: Boolean, default: false },
    ingredientsCount: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: true },
    lowConfidence: { type: Boolean, default: false },
    uncertainties: [{ type: String }]
  },
  image_url: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
