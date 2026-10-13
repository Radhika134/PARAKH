/**
 * ingredientDbService.js — Canonical Ingredient Database Service
 *
 * Provides database queries for multi-domain canonical ingredient metadata.
 */

const Ingredient = require('../models/Ingredient');
const { isDbConnected } = require('../config/db');

// In-memory fallback dataset for development when MongoDB is offline
const inMemoryIngredients = new Map();

/**
 * getIngredientByCanonicalName
 * Finds canonical ingredient by name or alias.
 */
async function getIngredientByCanonicalName(name) {
  if (!name) return null;
  const cleanName = name.trim();

  if (isDbConnected()) {
    try {
      const doc = await Ingredient.findOne({
        $or: [
          { canonical_name: { $regex: `^${cleanName}$`, $options: 'i' } },
          { aliases: { $regex: `^${cleanName}$`, $options: 'i' } },
          { inci_name: { $regex: `^${cleanName}$`, $options: 'i' } }
        ]
      }).lean();

      if (doc) return doc;
    } catch (err) {
      console.error('[ingredientDbService] Query error:', err.message);
    }
  }

  // Fallback search in memory
  const lowerName = cleanName.toLowerCase();
  for (const ing of inMemoryIngredients.values()) {
    if (
      ing.canonical_name.toLowerCase() === lowerName ||
      (ing.inci_name && ing.inci_name.toLowerCase() === lowerName) ||
      (ing.aliases && ing.aliases.some(a => a.toLowerCase() === lowerName))
    ) {
      return ing;
    }
  }

  return null;
}

/**
 * searchIngredients
 */
async function searchIngredients(query) {
  if (!query) return [];

  if (isDbConnected()) {
    try {
      const docs = await Ingredient.find({
        $or: [
          { canonical_name: { $regex: query, $options: 'i' } },
          { aliases: { $regex: query, $options: 'i' } },
          { inci_name: { $regex: query, $options: 'i' } }
        ]
      }).limit(20).lean();
      return docs;
    } catch (err) {
      console.error('[ingredientDbService] Search error:', err.message);
    }
  }

  const lowerQuery = query.toLowerCase();
  const results = [];
  for (const ing of inMemoryIngredients.values()) {
    if (
      ing.canonical_name.toLowerCase().includes(lowerQuery) ||
      (ing.aliases && ing.aliases.some(a => a.toLowerCase().includes(lowerQuery)))
    ) {
      results.push(ing);
    }
  }
  return results;
}

/**
 * upsertIngredient
 */
async function upsertIngredient(data) {
  if (!data || !data.canonical_name) return null;

  const ingredientId = data.ingredient_id || `ING-${data.canonical_name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`;

  const doc = {
    ingredient_id: ingredientId,
    canonical_name: data.canonical_name,
    domain_categories: data.domain_categories || ['General'],
    inci_name: data.inci_name || data.canonical_name.toUpperCase(),
    aliases: data.aliases || [],
    primary_function: data.primary_function || '',
    default_safety_class: data.default_safety_class || 'UNCLASSIFIED',
    regulatory_status: data.regulatory_status || {
      fssai_status: 'Not specified',
      who_status: 'Not specified',
      fda_status: 'Not specified'
    },
    updated_at: new Date()
  };

  if (isDbConnected()) {
    try {
      const saved = await Ingredient.findOneAndUpdate(
        { canonical_name: data.canonical_name },
        doc,
        { upsert: true, new: true, runValidators: true }
      );
      return saved.toObject();
    } catch (err) {
      console.error('[ingredientDbService] Upsert error:', err.message);
    }
  }

  inMemoryIngredients.set(doc.canonical_name.toLowerCase(), doc);
  return doc;
}

module.exports = {
  getIngredientByCanonicalName,
  searchIngredients,
  upsertIngredient
};
