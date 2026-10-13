const mongoose = require('mongoose');

const contentChunkSchema = new mongoose.Schema({
  chunk_id: { type: String, required: true },
  text: { type: String, required: true },
  ingredient_keyword: { type: String, default: null, index: true },
  domain: { type: String, default: 'General' }
}, { _id: false });

const knowledgeSourceSchema = new mongoose.Schema({
  source_id: { type: String, required: true, unique: true, index: true },
  authority_level: {
    type: String,
    enum: ['FSSAI', 'WHO', 'FDA', 'PubMed', 'NIH ODS', 'CosIng', 'REGULATORY_STANDARD'],
    required: true,
    index: true
  },
  title: { type: String, required: true },
  section: { type: String, default: 'General Guidelines' },
  publication_year: { type: Number, default: 2022 },
  url: { type: String, default: '' },
  content_chunks: [contentChunkSchema],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('KnowledgeSource', knowledgeSourceSchema);
