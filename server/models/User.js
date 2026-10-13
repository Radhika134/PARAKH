const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true, index: true },
  created_at: { type: Date, default: Date.now },
  last_active: { type: Date, default: Date.now },
  is_anonymous: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', userSchema);
