/**
 * seedDatabase.js — Ingestion Script for Canonical Ingredients & Regulatory Knowledge Sources
 *
 * Populates MongoDB with:
 *   1. Canonical Multi-Domain Ingredients (Skincare INCI, Food FSSAI/INS additives, Supplements)
 *   2. Trusted Regulatory Knowledge Sources (FSSAI, WHO, FDA, PubMed) with document provenance & content chunks for RAG.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Ingredient = require('../models/Ingredient');
const KnowledgeSource = require('../models/KnowledgeSource');
const Product = require('../models/Product');

// Canonical Ingredients Seed Data
const SEED_INGREDIENTS = [
  {
    ingredient_id: 'ING-NIACINAMIDE',
    canonical_name: 'Niacinamide',
    domain_categories: ['Skincare', 'Dietary Supplements'],
    inci_name: 'NIACINAMIDE',
    aliases: ['Vitamin B3', 'Nicotinamide', '3-Pyridinecarboxamide'],
    primary_function: 'Skin conditioning, barrier repair, vitamin supplementation',
    default_safety_class: 'BENEFICIAL',
    regulatory_status: {
      fssai_status: 'Permitted dietary additive',
      who_status: 'Permitted active compound',
      fda_status: 'GRAS / Safe in cosmetics up to 5%'
    }
  },
  {
    ingredient_id: 'ING-GLYCERIN',
    canonical_name: 'Glycerin',
    domain_categories: ['Skincare', 'Food', 'Dietary Supplements'],
    inci_name: 'GLYCERIN',
    aliases: ['Glycerol', '1,2,3-Propanetriol'],
    primary_function: 'Humectant, skin protectant, food solvent',
    default_safety_class: 'BENEFICIAL',
    regulatory_status: {
      fssai_status: 'Permitted food additive (INS 422)',
      who_status: 'Safe humectant compound',
      fda_status: 'GRAS / Safe for cosmetics & food'
    }
  },
  {
    ingredient_id: 'ING-PHENOXYETHANOL',
    canonical_name: 'Phenoxyethanol',
    domain_categories: ['Skincare'],
    inci_name: 'PHENOXYETHANOL',
    aliases: ['2-Phenoxyethanol', 'Ethylene glycol monochlorophenyl ether'],
    primary_function: 'Broad-spectrum antimicrobial preservative',
    default_safety_class: 'CAUTION',
    regulatory_status: {
      fssai_status: 'Not permitted in direct food',
      who_status: 'Permitted cosmetic preservative up to 1.0%',
      fda_status: 'Permitted in cosmetics up to 1.0% concentration'
    }
  },
  {
    ingredient_id: 'ING-FRAGRANCE',
    canonical_name: 'Fragrance',
    domain_categories: ['Skincare'],
    inci_name: 'PARFUM',
    aliases: ['Parfum', 'Synthetic Fragrance', 'Aroma'],
    primary_function: 'Sensory masking, scent additive',
    default_safety_class: 'CAUTION',
    regulatory_status: {
      fssai_status: 'Flavouring agent per FSSAI regulations',
      who_status: 'Potential allergen for sensitive skin',
      fda_status: 'Requires allergen labeling compliance'
    }
  },
  {
    ingredient_id: 'ING-INS-503II',
    canonical_name: 'Ammonium Hydrogen Carbonate',
    domain_categories: ['Food'],
    inci_name: 'AMMONIUM BICARBONATE',
    aliases: ['INS 503(ii)', 'Ammonium Bicarbonate', 'E503(ii)'],
    primary_function: 'Leavening agent, acidity regulator',
    default_safety_class: 'NEUTRAL',
    regulatory_status: {
      fssai_status: 'Permitted raising agent under FSSAI 2022',
      who_status: 'Codex Alimentarius permitted additive',
      fda_status: 'GRAS food additive'
    }
  },
  {
    ingredient_id: 'ING-VITAMIN-D3',
    canonical_name: 'Cholecalciferol',
    domain_categories: ['Dietary Supplements', 'Food'],
    inci_name: 'CHOLECALCIFEROL',
    aliases: ['Vitamin D3', 'Cholecalciferol', 'Activated 7-Dehydrocholesterol'],
    primary_function: 'Bone health, calcium absorption, immune modulation',
    default_safety_class: 'BENEFICIAL',
    regulatory_status: {
      fssai_status: 'Permitted dietary supplement nutrient',
      who_status: 'Essential nutrient guideline',
      fda_status: 'Safe dietary supplement nutrient'
    }
  }
];

// Regulatory Knowledge Sources Seed Data with Document Provenance
const SEED_KNOWLEDGE_SOURCES = [
  {
    source_id: 'KS-FSSAI-2022-SEC4',
    authority_level: 'FSSAI',
    title: 'FSSAI Food Safety and Standards Regulations 2022',
    section: 'Section 4.1: Preservatives & Food Additive Limits',
    publication_year: 2022,
    url: 'https://www.fssai.gov.in/regulations/food_safety_standards_2022.pdf',
    content_chunks: [
      {
        chunk_id: 'chunk_fssai_2022_sec4_001',
        text: 'According to FSSAI Food Safety Regulations 2022, ammonium hydrogen carbonate (INS 503(ii)) is a permitted leavening agent in baked goods up to GMP levels.',
        ingredient_keyword: 'ammonium hydrogen carbonate',
        domain: 'Food / Additives'
      },
      {
        chunk_id: 'chunk_fssai_2022_sec4_002',
        text: 'FSSAI standards require all packaged food items to explicitly disclose added sugars, sodium, and potential food allergens including milk, soy, and wheat.',
        ingredient_keyword: 'allergens',
        domain: 'Food / Labeling'
      }
    ]
  },
  {
    source_id: 'KS-WHO-TECH-980',
    authority_level: 'WHO',
    title: 'WHO Technical Report Series #980: Evaluation of Certain Food & Cosmetic Ingredients',
    section: 'Section 3.2: Cosmetic Preservatives & Contact Allergens',
    publication_year: 2021,
    url: 'https://www.who.int/publications/technical_report_980.pdf',
    content_chunks: [
      {
        chunk_id: 'chunk_who_980_001',
        text: 'Phenoxyethanol is evaluated as safe for use in topical cosmetic products as a preservative at concentrations not exceeding 1.0%.',
        ingredient_keyword: 'phenoxyethanol',
        domain: 'Skincare / Preservatives'
      },
      {
        chunk_id: 'chunk_who_980_002',
        text: 'Synthetic fragrance formulations contain potential sensitizing chemical compounds that may trigger contact dermatitis in sensitive skin profiles.',
        ingredient_keyword: 'fragrance',
        domain: 'Skincare / Sensitivities'
      }
    ]
  },
  {
    source_id: 'KS-FDA-COSMETICS-2021',
    authority_level: 'FDA',
    title: 'US FDA Cosmetic Science Review & Safety Guidance',
    section: 'Section 5: Active Skin Barrier Ingredients',
    publication_year: 2021,
    url: 'https://www.fda.gov/cosmetics/cosmetic-ingredients/niacinamide-guidance',
    content_chunks: [
      {
        chunk_id: 'chunk_fda_2021_001',
        text: 'Niacinamide (Vitamin B3) is recognized by the FDA as safe for topical cosmetic applications up to 5% concentration, supporting stratum corneum barrier repair.',
        ingredient_keyword: 'niacinamide',
        domain: 'Skincare / Active Ingredients'
      },
      {
        chunk_id: 'chunk_fda_2021_002',
        text: 'Glycerin is recognized as Generally Recognized as Safe (GRAS) as both a food additive and a cosmetic humectant skin protectant.',
        ingredient_keyword: 'glycerin',
        domain: 'General / Humectants'
      }
    ]
  },
  {
    source_id: 'KS-PUBMED-VITD3-2023',
    authority_level: 'PubMed',
    title: 'NCBI PubMed Systematic Review: Vitamin D3 Supplementation and Calcium Homeostasis',
    section: 'Clinical Evaluation of Dietary Supplements',
    publication_year: 2023,
    url: 'https://pubmed.ncbi.nlm.nih.gov/37128910/',
    content_chunks: [
      {
        chunk_id: 'chunk_pubmed_2023_001',
        text: 'Cholecalciferol (Vitamin D3) oral supplementation effectively increases serum 25-hydroxyvitamin D concentrations and enhances intestinal calcium absorption.',
        ingredient_keyword: 'cholecalciferol',
        domain: 'Supplements / Nutrition'
      }
    ]
  }
];

async function seedDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/parakh_db';
  console.log(`[SeedScript] Connecting to MongoDB at ${mongoUri}...`);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[SeedScript] Connected to MongoDB.');

    // Seed Ingredients
    console.log('[SeedScript] Ingesting canonical ingredients...');
    for (const ing of SEED_INGREDIENTS) {
      await Ingredient.findOneAndUpdate(
        { canonical_name: ing.canonical_name },
        ing,
        { upsert: true, new: true }
      );
    }
    console.log(`[SeedScript] Successfully seeded ${SEED_INGREDIENTS.length} canonical ingredients.`);

    // Seed Knowledge Sources
    console.log('[SeedScript] Ingesting trusted regulatory knowledge sources...');
    for (const src of SEED_KNOWLEDGE_SOURCES) {
      await KnowledgeSource.findOneAndUpdate(
        { source_id: src.source_id },
        src,
        { upsert: true, new: true }
      );
    }
    console.log(`[SeedScript] Successfully seeded ${SEED_KNOWLEDGE_SOURCES.length} regulatory knowledge sources.`);

    console.log('[SeedScript] Database seed complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[SeedScript] Error seeding database:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { SEED_INGREDIENTS, SEED_KNOWLEDGE_SOURCES };
