/**
 * ingredient.js — Express router for ingredient endpoints.
 *
 * Mounted at: /api/v1/ingredients
 */

const express = require('express');
const router = express.Router();
const { getIngredientByName, searchIngredientsHandler } = require('../controllers/ingredientController');

// GET /api/v1/ingredients — List/search ingredients
router.get('/', searchIngredientsHandler);

// GET /api/v1/ingredients/:name — Deep-dive ingredient explorer query
router.get('/:name', getIngredientByName);

module.exports = router;
