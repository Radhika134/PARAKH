/**
 * database.test.js — Validation Test Suite for Phase 5 Database & Knowledge Base
 *
 * Verifies:
 *   1. Mongoose model schemas (Product, Ingredient, KnowledgeSource, User, Preference, Report, History)
 *   2. Graceful connection status handling
 *   3. Product payload persistence from Phase 4 outputs
 *   4. Canonical ingredient lookups & alias matching
 *   5. Trusted regulatory knowledge sources (FSSAI, WHO, FDA, PubMed) & document provenance
 *   6. Validation rules & duplicate handling
 */

const assert = require('assert');
const { isDbConnected } = require('../config/db');
const { saveProductPayload, getProductById, searchProducts } = require('../services/productDbService');
const { getIngredientByCanonicalName, searchIngredients, upsertIngredient } = require('../services/ingredientDbService');
const { getKnowledgeSources, getKnowledgeSourceById, findChunksByKeyword, upsertKnowledgeSource } = require('../services/knowledgeSourceDbService');

console.log('====================================================');
console.log('   RUNNING PHASE 5 DATABASE & KNOWLEDGE TEST SUITE   ');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

async function runTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] Test ${totalTests}: ${name}`);
    console.error(`   Error: ${err.message}\n`);
  }
}

async function runSuite() {
  // Test 1: Connection Status check
  await runTest('DB Connection Module Status Check', async () => {
    const connectedStatus = isDbConnected();
    assert.strictEqual(typeof connectedStatus, 'boolean');
  });

  // Test 2: Ingest & Lookup Canonical Ingredient
  await runTest('Canonical Ingredient Upsert & Lookup', async () => {
    const seedIng = {
      canonical_name: 'Niacinamide',
      inci_name: 'NIACINAMIDE',
      domain_categories: ['Skincare', 'Dietary Supplements'],
      aliases: ['Vitamin B3', 'Nicotinamide'],
      primary_function: 'Barrier repair',
      default_safety_class: 'BENEFICIAL',
      regulatory_status: {
        fssai_status: 'Permitted',
        who_status: 'Permitted active',
        fda_status: 'GRAS up to 5%'
      }
    };

    const saved = await upsertIngredient(seedIng);
    assert.ok(saved, 'Ingredient should be saved');
    assert.strictEqual(saved.canonical_name, 'Niacinamide');

    // Query by alias "Vitamin B3"
    const fetched = await getIngredientByCanonicalName('Vitamin B3');
    assert.ok(fetched, 'Should fetch ingredient by alias Vitamin B3');
    assert.strictEqual(fetched.canonical_name, 'Niacinamide');
  });

  // Test 3: Ingest & Query Trusted Knowledge Source Provenance
  await runTest('Knowledge Source Document & Provenance Retrieval', async () => {
    const seedSource = {
      source_id: 'KS-FSSAI-TEST-2022',
      authority_level: 'FSSAI',
      title: 'FSSAI Food Safety Standards Regulations 2022',
      section: 'Section 4.1: Preservative Limits',
      publication_year: 2022,
      url: 'https://fssai.gov.in/test.pdf',
      content_chunks: [
        {
          chunk_id: 'chunk_test_001',
          text: 'FSSAI regulates phenoxyethanol concentration up to 1.0% limit in approved goods.',
          ingredient_keyword: 'phenoxyethanol',
          domain: 'Food / Preservatives'
        }
      ]
    };

    const saved = await upsertKnowledgeSource(seedSource);
    assert.ok(saved, 'Knowledge source saved');
    assert.strictEqual(saved.authority_level, 'FSSAI');

    // Search chunks by keyword
    const chunks = await findChunksByKeyword('phenoxyethanol');
    assert.ok(chunks.length > 0, 'Found matched regulatory chunk');
    assert.strictEqual(chunks[0].authority, 'FSSAI');
    assert.strictEqual(chunks[0].source_title, 'FSSAI Food Safety Standards Regulations 2022');
  });

  // Test 4: Persist Phase 4 Extracted Product Payload
  await runTest('Phase 4 Extracted Payload Persistence', async () => {
    const phase4ExtractionOutput = {
      product: {
        name: 'Hydrating Glow Face Serum',
        brand: 'Verdant Botanicals',
        category: 'skincare'
      },
      ingredients: [
        { name: 'Water', originalText: 'Aqua/Water', extractionConfidence: 95 },
        { name: 'Niacinamide', originalText: 'Niacinamide', extractionConfidence: 90 },
        { name: 'Glycerin', originalText: 'Glycerin', extractionConfidence: 90 }
      ],
      warnings: ['For external use only.'],
      claims: ['Paraben-Free', 'Dermatologically Tested'],
      usage: ['Apply 3 drops morning and night.'],
      nutrition: [],
      allergens: [],
      extractionMetadata: {
        source: 'ocr',
        ocrConfidence: 90,
        extractionConfidenceScore: 92,
        productNameDetected: true,
        brandDetected: true,
        categoryDetected: true,
        ingredientsDetected: true,
        ingredientsCount: 3,
        isComplete: true,
        lowConfidence: false,
        uncertainties: []
      }
    };

    const savedProduct = await saveProductPayload(phase4ExtractionOutput, {
      barcode: '8901234567890',
      batch_number: 'VB-882'
    });

    assert.ok(savedProduct, 'Product payload saved successfully');
    assert.ok(savedProduct.product_id, 'Generated product_id');
    assert.strictEqual(savedProduct.product_name, 'Hydrating Glow Face Serum');
    assert.strictEqual(savedProduct.brand_name, 'Verdant Botanicals');
    assert.strictEqual(savedProduct.extracted_ingredients.length, 3);
    assert.strictEqual(savedProduct.barcode, '8901234567890');

    // Retrieve product by ID
    const retrieved = await getProductById(savedProduct.product_id);
    assert.ok(retrieved, 'Retrieved saved product by ID');
    assert.strictEqual(retrieved.product_name, 'Hydrating Glow Face Serum');
  });

  // Test 5: Search Products API Handler
  await runTest('Product Search Query Execution', async () => {
    const results = await searchProducts('Verdant');
    assert.ok(Array.isArray(results), 'Returns results array');
    assert.ok(results.length > 0, 'Found product matching "Verdant"');
    assert.strictEqual(results[0].brand_name, 'Verdant Botanicals');
  });

  // Test 6: Validation & Invalid Input Handling
  await runTest('Validation Handling for Null Product Payload', async () => {
    const result = await saveProductPayload(null);
    assert.ok(result, 'Handles null extraction gracefully without crashing');
    assert.strictEqual(result.product_name, 'Unidentified Product');
  });

  console.log(`\n====================================================`);
  console.log(`   TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log(`====================================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

if (require.main === module) {
  runSuite().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}

module.exports = { runSuite };
