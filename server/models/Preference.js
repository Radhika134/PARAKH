const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true, index: true },
  sensitivities: [{ type: String }],
  dietary_preferences: [{ type: String }],
  health_goals: [{ type: String }],
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Preference', preferenceSchema);
