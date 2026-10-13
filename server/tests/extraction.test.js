/**
 * extraction.test.js — Validation Test Suite for Phase 4 Extraction Service
 *
 * Runs 7 mandatory validation scenarios:
 *   1. Food product OCR
 *   2. Skincare product OCR
 *   3. Supplement product OCR
 *   4. OCR text with formatting noise
 *   5. Product with incomplete ingredient information
 *   6. OCR result with no identifiable ingredients
 *   7. Ambiguous / low-confidence OCR result
 */

const assert = require('assert');
const { extractProductAndIngredients } = require('../services/extractionService');

console.log('====================================================');
console.log('   RUNNING PHASE 4 EXTRACTION SERVICE TEST SUITE    ');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] Scenario ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] Scenario ${totalTests}: ${name}`);
    console.error(`   Error: ${err.message}\n`);
  }
}

// -----------------------------------------------------------------
// Scenario 1: Food product
// -----------------------------------------------------------------
runTest('Food Product Extraction', () => {
  const ocrInput = {
    rawText: `
      Brand: NutriCrunch®
      Product: Whole Wheat Digestive Biscuit
      Lic. No. 10015022003344
      Ingredients: Whole Wheat Flour (55%), Palm Oil, Sugar, Invert Sugar Syrup, Raising Agents (INS 503(ii), INS 500(ii)), Salt, Milk Solids, Emulsifiers (INS 322).
      Nutrition Facts: Energy 460 kcal, Protein 7.2g, Carbohydrate 68g, Added Sugar 14g, Sodium 420mg per 100g.
      Contains: Milk, Wheat, Soy.
    `,
    avgConfidence: 92,
    lowConfidence: false
  };

  const result = extractProductAndIngredients(ocrInput);

  assert.strictEqual(result.product.category, 'food');
  assert.strictEqual(result.product.brand, 'NutriCrunch');
  assert.strictEqual(result.product.name, 'Whole Wheat Digestive Biscuit');
  assert.ok(result.ingredients.length >= 6, `Expected >= 6 ingredients, got ${result.ingredients.length}`);

  // Check parenthetical preservation
  const wheatFlour = result.ingredients.find(i => i.name.includes('Wheat Flour'));
  assert.ok(wheatFlour, 'Wheat flour missing');
  assert.ok(wheatFlour.originalText.includes('(55%)'), 'Percentage in originalText preserved');

  const raisingAgents = result.ingredients.find(i => i.name.includes('Raising Agents'));
  assert.ok(raisingAgents, 'Raising agents missing');
  assert.ok(raisingAgents.name.includes('INS 503(ii)'), 'Parenthetical INS code preserved');

  assert.ok(result.allergens.length > 0, 'Allergens should be extracted');
  assert.ok(result.nutrition.length > 0, 'Nutrition should be extracted');
  assert.strictEqual(result.extractionMetadata.productNameDetected, true);
  assert.strictEqual(result.extractionMetadata.ingredientsDetected, true);
  assert.ok(result.extractionMetadata.extractionConfidenceScore >= 80);
});

// -----------------------------------------------------------------
// Scenario 2: Skincare product
// -----------------------------------------------------------------
runTest('Skincare Product Extraction', () => {
  const ocrInput = {
    rawText: `
      Verdant Botanicals®
      Hydrating Glow Face Serum
      INCI Ingredients: Aqua/Water, Niacinamide, Glycerin, Propanediol, Sodium Hyaluronate, Phenoxyethanol, Ethylhexylglycerin.
      Directions: Apply 3-4 drops to clean face and neck every morning.
      Caution: For external use only. Avoid contact with eyes. Discontinue use if irritation occurs.
      Claims: Paraben-Free, Sulfate-Free, Dermatologically Tested.
    `,
    avgConfidence: 88,
    lowConfidence: false
  };

  const result = extractProductAndIngredients(ocrInput);

  assert.strictEqual(result.product.category, 'skincare');
  assert.strictEqual(result.product.brand, 'Verdant Botanicals');
  assert.strictEqual(result.product.name, 'Hydrating Glow Face Serum');
  assert.ok(result.ingredients.length >= 6, `Expected >= 6 INCI ingredients, got ${result.ingredients.length}`);

  const niacinamide = result.ingredients.find(i => i.name.toLowerCase() === 'niacinamide');
  assert.ok(niacinamide, 'Niacinamide should be extracted');
  assert.strictEqual(niacinamide.originalText, 'Niacinamide');

  assert.ok(result.warnings.length >= 1, 'Warnings should be extracted');
  assert.ok(result.claims.includes('Paraben-free'), 'Paraben-free claim should be extracted');
  assert.ok(result.usage.length >= 1, 'Directions should be extracted');
});

// -----------------------------------------------------------------
// Scenario 3: Supplement product
// -----------------------------------------------------------------
runTest('Supplement Product Extraction', () => {
  const ocrInput = {
    rawText: `
      VitalLife®
      Daily Vitamin D3 + K2 Complex
      Supplement Facts
      Serving Size: 1 Softgel
      Servings Per Container: 60
      Active Ingredients: Vitamin D3 (as Cholecalciferol) 2000 IU, Vitamin K2 (as MK-7) 100 mcg.
      Other Ingredients: Organic Olive Oil, Bovine Gelatin, Glycerin, Purified Water.
      Suggested Use: Take 1 softgel daily with a fat-containing meal.
      Warning: Consult your doctor before use if pregnant or taking blood thinners.
    `,
    avgConfidence: 90,
    lowConfidence: false
  };

  const result = extractProductAndIngredients(ocrInput);

  assert.strictEqual(result.product.category, 'supplements');
  assert.strictEqual(result.product.brand, 'VitalLife');
  assert.strictEqual(result.product.name, 'Daily Vitamin D3 + K2 Complex');
  assert.ok(result.ingredients.length >= 3, 'Ingredients parsed');
  assert.ok(result.warnings.length >= 1, 'Warnings extracted');
  assert.ok(result.usage.length >= 1, 'Suggested use extracted');
});

// -----------------------------------------------------------------
// Scenario 4: OCR text with formatting noise
// -----------------------------------------------------------------
runTest('OCR Text with Formatting Noise', () => {
  const ocrInput = {
    rawText: `
      ~~ BRAND: PureBotanic ~~
      Product: Gentle Cleansing Gel
      Ingredients:
      • Water (Aqua) ,
      • Phenoxy-
      ethanol ,
      -- Glycerin -- ,
      • Citric Acid .
      Mfg by: PureLabs Ltd
    `,
    avgConfidence: 72,
    lowConfidence: false
  };

  const result = extractProductAndIngredients(ocrInput);

  assert.strictEqual(result.product.category, 'skincare');
  assert.ok(result.ingredients.length >= 3, 'Noise-cleaned ingredients parsed');

  // Verify line wrap merge: Phenoxy-\nethanol -> Phenoxyethanol
  const phenoxy = result.ingredients.find(i => i.name.replace(/\s+/g, '').toLowerCase().includes('phenoxyethanol'));
  assert.ok(phenoxy, 'Soft hyphen line wrap merged cleanly');
});

// -----------------------------------------------------------------
// Scenario 5: Product with incomplete ingredient information
// -----------------------------------------------------------------
runTest('Incomplete Ingredient Information', () => {
  const ocrInput = {
    rawText: `
      AromaFresh Lavender Lotion
      Ingredients: Water, Mineral Oil, Stearic Acid, Cetyl Alcohol, Fragrance, Methylpar
    `,
    avgConfidence: 65,
    lowConfidence: false
  };

  const result = extractProductAndIngredients(ocrInput);

  assert.strictEqual(result.extractionMetadata.isComplete, false, 'Should be flagged as incomplete');
  assert.ok(result.extractionMetadata.uncertainties.some(u => u.includes('truncated or incomplete')));
});

// -----------------------------------------------------------------
// Scenario 6: OCR result with no identifiable ingredients
// -----------------------------------------------------------------
runTest('OCR Result with No Identifiable Ingredients', () => {
  const ocrInput = {
    rawText: `
      Store in a cool dry place away from direct sunlight.
      Batch No: B-881290
      Best Before 12 Months from Packaging.
      Net Weight: 200g
    `,
    avgConfidence: 85,
    lowConfidence: false
  };

  const result = extractProductAndIngredients(ocrInput);

  assert.strictEqual(result.ingredients.length, 0, 'Should be 0 ingredients');
  assert.strictEqual(result.extractionMetadata.ingredientsDetected, false);
  assert.ok(result.extractionMetadata.uncertainties.some(u => u.includes('No distinct ingredients')));
});

// -----------------------------------------------------------------
// Scenario 7: Ambiguous / low-confidence OCR result
// -----------------------------------------------------------------
runTest('Ambiguous / Low-Confidence OCR Result', () => {
  const ocrInput = {
    rawText: `
      g1ow s3rum 1ngred1ents: w4ter, g1yc3r1n, n1ac1nam1de, fr4gr4nce
    `,
    avgConfidence: 45,
    lowConfidence: true
  };

  const result = extractProductAndIngredients(ocrInput);

  assert.strictEqual(result.extractionMetadata.lowConfidence, true, 'Low confidence flag true');
  assert.ok(result.extractionMetadata.uncertainties.some(u => u.includes('low (< 60%)')));
  assert.ok(result.extractionMetadata.extractionConfidenceScore < 70);
});

console.log(`\n====================================================`);
console.log(`   TEST RESULTS: ${passedTests} / ${totalTests} SCENARIOS PASSED`);
console.log(`====================================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
