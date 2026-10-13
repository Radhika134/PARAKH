const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  ingredient_id: { type: String, required: true, unique: true, index: true },
  canonical_name: { type: String, required: true, unique: true, index: true },
  domain_categories: [{ type: String }],
  inci_name: { type: String, default: null },
  aliases: [{ type: String, index: true }],
  primary_function: { type: String, default: '' },
  default_safety_class: {
    type: String,
    enum: ['BENEFICIAL', 'NEUTRAL', 'CAUTION', 'RESTRICTED', 'UNCLASSIFIED'],
    default: 'UNCLASSIFIED'
  },
  regulatory_status: {
    fssai_status: { type: String, default: 'Not specified' },
    who_status: { type: String, default: 'Not specified' },
    fda_status: { type: String, default: 'Not specified' }
  },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ingredient', ingredientSchema);
