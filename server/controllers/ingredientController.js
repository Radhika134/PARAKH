/**
 * ingredientController.js — Controller handlers for canonical ingredient APIs.
 */

const { getIngredientByCanonicalName, searchIngredients } = require('../services/ingredientDbService');

/**
 * GET /api/v1/ingredients/:name
 */
async function getIngredientByName(req, res) {
  try {
    const name = req.params.name;
    const ingredient = await getIngredientByCanonicalName(name);

    if (!ingredient) {
      return res.status(404).json({
        error: true,
        code: 'ERR_INGREDIENT_NOT_FOUND',
        message: `No canonical ingredient record found for: "${name}"`,
        suggestion: 'Check ingredient spelling or aliases.'
      });
    }

    return res.status(200).json({
      success: true,
      data: ingredient
    });
  } catch (err) {
    console.error('[ingredientController] Error fetching ingredient:', err.message);
    return res.status(500).json({
      error: true,
      code: 'ERR_INGREDIENT_FETCH_FAILED',
      message: 'Failed to retrieve ingredient record.'
    });
  }
}

/**
 * GET /api/v1/ingredients?q=query
 */
async function searchIngredientsHandler(req, res) {
  try {
    const query = req.query.q || '';
    const results = await searchIngredients(query);

    return res.status(200).json({
      success: true,
      query,
      count: results.length,
      data: results
    });
  } catch (err) {
    console.error('[ingredientController] Error searching ingredients:', err.message);
    return res.status(500).json({
      error: true,
      code: 'ERR_INGREDIENT_SEARCH_FAILED',
      message: 'Ingredient search encountered an error.'
    });
  }
}

module.exports = {
  getIngredientByName,
  searchIngredientsHandler
};
