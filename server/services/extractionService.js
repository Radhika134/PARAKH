/**
 * extractionService.js — Category-Aware Product & Ingredient Extraction for PARAKH
 *
 * Phase 4 Core Extraction Engine
 *
 * Objective:
 *   Convert raw OCR text stream (from Phase 3) into clean, structured product information.
 *   Non-judgmental: strictly identifies label content without safety/health assessments.
 *
 * Supported Domains:
 *   - Food (FSSAI/INS additives, nutrition, allergens, serving info)
 *   - Skincare (INCI ingredients, usage, claims, warnings)
 *   - Supplements (active & other ingredients, dosage, warnings)
 *   - Unknown (fallback when category cannot be reliably determined)
 */

// Keyword indicators for category detection
const CATEGORY_KEYWORDS = {
  food: [
    'nutrition facts', 'nutritional information', 'fssai', 'energy', 'protein',
    'carbohydrate', 'total fat', 'added sugar', 'dietary fiber', 'serving size',
    'per 100g', 'per 100ml', 'per 100 g', 'per 100 ml', 'contains added flavour',
    'allergens:', 'may contain traces of', 'lic. no.', 'net wt', 'net weight',
    'mfg date', 'exp date', 'best before', 'veg', 'non-veg'
  ],
  skincare: [
    'inci', 'aqua/water', 'water (aqua)', 'phenoxyethanol', 'glycerin',
    'niacinamide', 'hyaluronic acid', 'for external use only', 'apply to clean',
    'dermatologically tested', 'paraben free', 'sulfate free', 'serum', 'lotion',
    'cleanser', 'moisturizer', 'sunscreen', 'spf', 'facial', 'skincare',
    'manufactured by', 'cosmetic'
  ],
  supplements: [
    'supplement facts', 'dietary supplement', 'serving size:', 'servings per container',
    'active ingredients', 'other ingredients', 'daily value', '% daily value',
    'capsule', 'tablet', 'softgel', 'gummy', 'take 1 capsule', 'take 2 capsules',
    'do not exceed recommended dosage', 'nutraceutical', 'health supplement'
  ]
};

/**
 * detectCategory
 * Analyzes OCR text against domain keyword dictionaries.
 * Returns 'food' | 'skincare' | 'supplements' | 'unknown'.
 */
function detectCategory(text) {
  if (!text || typeof text !== 'string') return 'unknown';

  const lowerText = text.toLowerCase();
  const scores = { food: 0, skincare: 0, supplements: 0 };

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lowerText.includes(kw)) {
        // High-confidence exact headers get double weight
        if (['nutrition facts', 'nutritional information', 'supplement facts', 'inci'].includes(kw)) {
          scores[category] += 3;
        } else {
          scores[category] += 1;
        }
      }
    }
  }

  // Determine top category
  let maxScore = 0;
  let bestCategory = 'unknown';

  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = cat;
    }
  }

  // Minimum threshold of 2 keyword points required for reliable classification
  if (maxScore < 2) {
    return 'unknown';
  }

  return bestCategory;
}

/**
 * extractBrandAndName
 * Identifies likely product name and brand from top lines of OCR text before ingredients.
 */
function extractBrandAndName(text, category) {
  if (!text) return { name: null, brand: null };

  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  let brand = null;
  let name = null;

  // Search for explicit Brand: or Product: labels
  for (const line of lines) {
    const brandMatch = line.match(/^(?:brand|brand name|mfd by|by)\s*[:\-]\s*(.+)$/i);
    if (brandMatch && brandMatch[1]) {
      brand = brandMatch[1].trim();
    }

    const nameMatch = line.match(/^(?:product|product name|item)\s*[:\-]\s*(.+)$/i);
    if (nameMatch && nameMatch[1]) {
      name = nameMatch[1].trim();
    }
  }

  // If not explicitly labeled, check lines before the ingredient header
  if (!name || !brand) {
    const headerRegex = /(?:ingredients|active ingredients|supplement facts|nutrition facts|composition)\s*[:\-]?/i;
    let headerLineIndex = lines.findIndex(l => headerRegex.test(l));
    if (headerLineIndex === -1) headerLineIndex = Math.min(lines.length, 6);

    const topLines = lines.slice(0, headerLineIndex).filter(l => !/^(mfg|exp|batch|net wt|lic|fssai|bar code|~~)/i.test(l));

    if (topLines.length > 0) {
      // Look for line with registered/trademark symbols ® or ™ for brand
      for (const line of topLines) {
        if (!brand && /[®™]/.test(line)) {
          brand = line.replace(/[®™]/g, '').trim();
        }
      }

      // Filter non-brand candidate lines for product name
      const nonBrandLines = topLines.filter(l => {
        const cleanedLine = l.replace(/[®™]/g, '').trim();
        return !brand || cleanedLine !== brand;
      });

      if (!name && nonBrandLines.length > 0) {
        const candidate = nonBrandLines[0];
        if (candidate.length >= 3 && candidate.length <= 80 && !/ingredients/i.test(candidate)) {
          name = candidate;
        }
      }

      // Second line or top line as brand if brand still missing
      if (!brand && topLines.length > 0) {
        const candidateBrand = topLines[0];
        if (candidateBrand !== name && candidateBrand.length >= 2 && candidateBrand.length <= 40) {
          brand = candidateBrand;
        }
      }
    }
  }

  // Clean trailing punctuation or noise symbols
  if (name) name = name.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9.\- ]+$/g, '').trim() || null;
  if (brand) brand = brand.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9.\- ]+$/g, '').trim() || null;

  return { name, brand };
}

/**
 * splitIngredientsHonoringParentheses
 * Splits ingredient text by delimiters (commas, semicolons, bullets) while preserving nested parentheses.
 * e.g., "Water, Emulsifier (INS 471, INS 322), Niacinamide" -> 3 items.
 */
function splitIngredientsHonoringParentheses(text) {
  if (!text) return [];

  const items = [];
  let currentToken = '';
  let parenDepth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '(' || char === '[' || char === '{') {
      parenDepth++;
      currentToken += char;
    } else if (char === ')' || char === ']' || char === '}') {
      if (parenDepth > 0) parenDepth--;
      currentToken += char;
    } else if ((char === ',' || char === ';' || char === '•' || char === '·' || char === '|') && parenDepth === 0) {
      if (currentToken.trim().length > 0) {
        items.push(currentToken.trim());
      }
      currentToken = '';
    } else {
      currentToken += char;
    }
  }

  if (currentToken.trim().length > 0) {
    items.push(currentToken.trim());
  }

  return items;
}

/**
 * cleanIngredientString
 * Standardizes formatting without changing chemical / medical identity.
 */
function cleanIngredientString(raw) {
  if (!raw) return '';

  let cleaned = raw
    // Remove leading bullet points, numbers, dashes
    .replace(/^[\s•·\-*–—\d.+)]+/, '')
    // Replace multiple spaces/newlines with single space
    .replace(/\s+/g, ' ')
    // Remove trailing periods or lone symbols if not part of percentage/E-number
    .replace(/(?<!\d|\b[a-zA-Z])\.$/, '')
    .trim();

  // Capitalize first letter of words safely (Title Case for readable representation)
  if (cleaned.length > 0) {
    cleaned = cleaned
      .split(' ')
      .map((word, idx) => {
        const bareWord = word.replace(/^[([{]/, '').replace(/[ aspect)]*$/, '');
        // Don't modify E-numbers, INS codes, numbers, or short chemical symbols (e.g. INS 471, E102, pH, EDTA)
        if (/^(?:INS|E\d+|EDTA|PEG\d*|pH|\d+%|\d+\([a-z0-9]+\)?)$/i.test(bareWord)) {
          return word.replace(/\bINS\b/gi, 'INS').replace(/\bE(\d+)\b/gi, 'E$1');
        }
        if (word.length === 1 && idx > 0) return word.toLowerCase();
        
        // Preserve parenthetical case like INS 503(ii) or (ii)
        if (/\([a-z0-9]+\)/i.test(word)) {
          return word.replace(/\bINS\b/gi, 'INS');
        }

        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');

    // Post-fix: ensure INS and E-numbers are strictly uppercase
    cleaned = cleaned
      .replace(/\bins\b/gi, 'INS')
      .replace(/\be(\d+)\b/gi, 'E$1')
      .replace(/\((i+)\)/g, '($1)');
  }

  return cleaned;
}

/**
 * isolateIngredientSection
 * Extracts the raw ingredient list block from OCR text using header and footer boundaries.
 */
function isolateIngredientSection(text) {
  if (!text) return { block: '', isComplete: false, foundHeader: false };

  // Headers pattern
  const headerPattern = /(?:ingredients|active ingredients|other ingredients|contains|composition)\s*[:\-–—]?/i;
  const headerMatch = text.match(headerPattern);

  let block = '';
  let foundHeader = false;

  if (headerMatch) {
    foundHeader = true;
    const startIndex = headerMatch.index + headerMatch[0].length;
    block = text.slice(startIndex);
  } else {
    // Fallback: search for comma-heavy section if no header present
    block = text;
  }

  // Footer / truncation pattern (stop when hitting label metadata)
  const footerPattern = /(?:mfg by|marketed by|batch no|pkd|mfd|expiry|best before|net wt|net qty|directions|usage|storage|warning|caution|lic\. no|fssai lic|customer care|made in)/i;
  const footerMatch = block.match(footerPattern);

  let isComplete = true;

  if (footerMatch) {
    block = block.slice(0, footerMatch.index);
  } else {
    // If text ends abruptly without ending punctuation or metadata header, flag incomplete
    const trimmed = block.trim();
    if (trimmed.length > 0 && !/[.!\u2022]$/.test(trimmed)) {
      isComplete = false;
    }
  }

  return { block: block.trim(), isComplete, foundHeader };
}

/**
 * parseIngredients
 * Processes raw OCR text into structured ingredient entries with originalText and cleaned name.
 */
function parseIngredients(text, ocrConfidence) {
  const { block, isComplete, foundHeader } = isolateIngredientSection(text);

  if (!block) {
    return {
      list: [],
      isComplete: false,
      foundHeader: false,
      uncertainty: 'No ingredient section detected in OCR text.'
    };
  }

  // If no header was found, check if this text is actually storage/metadata text without ingredients
  if (!foundHeader) {
    const hasDelimiters = /[,;•·|]/.test(block);
    const looksLikeStorageText = /(?:store in|cool dry place|batch no|best before|net weight|lic\. no)/i.test(block);
    if (!hasDelimiters || looksLikeStorageText) {
      return {
        list: [],
        isComplete: false,
        foundHeader: false,
        uncertainty: 'No distinct ingredient list detected in OCR text.'
      };
    }
  }

  // Merge soft-hyphenated lines (e.g. "Phenoxy-\nethanol" -> "Phenoxyethanol")
  const normalizedBlock = block
    .replace(/(\w+)-\s*\r?\n\s*(\w+)/g, '$1$2')
    .replace(/\r?\n/g, ' ');

  const rawTokens = splitIngredientsHonoringParentheses(normalizedBlock);

  const ingredients = [];
  for (const rawToken of rawTokens) {
    const cleaned = cleanIngredientString(rawToken);

    // Skip empty or pure noise tokens (e.g., single characters like "a", ".", ")")
    if (cleaned.length < 2 || /^[^a-zA-Z0-9]+$/.test(cleaned)) {
      continue;
    }

    // Skip tokens that are clear label metadata artifacts
    if (/^(mfg|exp|batch|fssai|lic|net wt|price|rs\.|mrp|store in|best before)/i.test(cleaned)) {
      continue;
    }

    // Confidence per ingredient based on character validity and base OCR confidence
    let itemConfidence = ocrConfidence || 75;
    if (/[^a-zA-Z0-9 ()\-.,/]/g.test(rawToken)) {
      itemConfidence = Math.max(30, itemConfidence - 15); // penalize noise symbols
    }

    ingredients.push({
      name: cleaned,
      originalText: rawToken.trim(),
      extractionConfidence: Math.round(itemConfidence)
    });
  }

  return {
    list: ingredients,
    isComplete,
    foundHeader
  };
}

/**
 * parseAuxiliaryFields
 * Extracts warnings, claims, usage, nutrition, allergens, and dosage where present.
 */
function parseAuxiliaryFields(text, category) {
  const warnings = [];
  const claims = [];
  const usage = [];
  const nutrition = [];
  const allergens = [];

  if (!text) {
    return { warnings, claims, usage, nutrition, allergens };
  }

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  // Regex patterns
  const warningRegex = /(?:warning|caution|for external use|avoid contact with eyes|keep out of reach|consult (?:your )?doctor|discontinue use|not for medicinal use)/i;
  const claimRegex = /(?:paraben[- ]free|sulfate[- ]free|dermatologically tested|100% natural|organic|vegan|cruelty[- ]free|non-comedogenic|sugar free|no added sugar|gluten[- ]free|clinically proven|hypoallergenic)/i;
  const usageRegex = /(?:directions|how to use|usage|suggested use|dosage|take \d)/i;
  const allergenRegex = /(?:contains|allergens?|may contain traces of)\s*[:\-]?\s*(milk|soy|wheat|gluten|peanuts|tree nuts|eggs|fish|crustaceans|sesame)/i;

  let inUsageSection = false;

  for (const line of lines) {
    // Warnings
    if (warningRegex.test(line)) {
      warnings.push(line);
    }

    // Claims
    const claimMatches = line.match(new RegExp(claimRegex.source, 'gi'));
    if (claimMatches) {
      for (const match of claimMatches) {
        if (!claims.includes(match)) {
          claims.push(match.charAt(0).toUpperCase() + match.slice(1).toLowerCase());
        }
      }
    }

    // Usage & Dosage
    if (usageRegex.test(line)) {
      usage.push(line);
      inUsageSection = true;
    } else if (inUsageSection && line.length < 100 && !/ingredients|nutrition|warning/i.test(line)) {
      usage.push(line);
      if (usage.length >= 3) inUsageSection = false;
    }

    // Food specifics: Nutrition & Allergens
    if (category === 'food') {
      if (/(?:energy|protein|carbohydrate|total fat|sodium|added sugar|sugar|dietary fiber|kcal|g|mg)/i.test(line) && /\d/.test(line)) {
        if (!nutrition.includes(line)) nutrition.push(line);
      }
      if (allergenRegex.test(line)) {
        if (!allergens.includes(line)) allergens.push(line);
      }
    }
  }

  return { warnings, claims, usage, nutrition, allergens };
}

/**
 * calculateExtractionConfidence
 * Calculates an empirical score (0-100) and compiles extraction metadata.
 */
function calculateExtractionConfidence(ocrConfidence, productName, brand, category, ingredientsResult) {
  let score = typeof ocrConfidence === 'number' ? ocrConfidence : 70;

  const uncertainties = [];

  // Product Name (+15)
  if (productName) {
    score += 15;
  } else {
    uncertainties.push('Product name could not be identified with certainty from OCR text.');
  }

  // Brand (+10)
  if (brand) {
    score += 10;
  } else {
    uncertainties.push('Brand name was not explicitly identified.');
  }

  // Category (+15)
  if (category && category !== 'unknown') {
    score += 15;
  } else {
    uncertainties.push('Product category is unclassified / unknown.');
  }

  // Ingredients (+30)
  if (ingredientsResult.list.length > 0) {
    score += 30;
  } else {
    score -= 20;
    uncertainties.push('No distinct ingredients were detected in the OCR text.');
  }

  // Header detection (+10)
  if (ingredientsResult.foundHeader) {
    score += 10;
  } else if (ingredientsResult.list.length > 0) {
    uncertainties.push('Ingredient list was extracted without an explicit "Ingredients:" header label.');
  }

  // Completeness (+10)
  if (ingredientsResult.isComplete) {
    score += 10;
  } else if (ingredientsResult.list.length > 0) {
    uncertainties.push('Ingredient list appears truncated or incomplete at the end of the text.');
  }

  // Low OCR Confidence penalty
  if (ocrConfidence < 60) {
    score -= 25;
    uncertainties.push('OCR character confidence was low (< 60%). Extracted names may contain typos.');
    // Cap extraction score when OCR quality is inherently low
    score = Math.min(score, ocrConfidence + 20);
  }

  // Normalize final score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    confidenceScore: finalScore,
    uncertainties
  };
}

/**
 * extractProductAndIngredients
 * Main Phase 4 entry point.
 *
 * @param {Object} ocrInput — Object from Phase 3 OCR (or raw text string)
 * @returns {Object} Structured Product Payload
 */
function extractProductAndIngredients(ocrInput) {
  let rawText = '';
  let ocrConfidence = 75;
  let lowOcrConfidence = false;

  if (typeof ocrInput === 'string') {
    rawText = ocrInput;
  } else if (ocrInput && typeof ocrInput === 'object') {
    rawText = ocrInput.rawText || '';
    ocrConfidence = typeof ocrInput.avgConfidence === 'number' ? ocrInput.avgConfidence : 75;
    lowOcrConfidence = Boolean(ocrInput.lowConfidence);
  }

  // 1. Detect Domain Category
  const category = detectCategory(rawText);

  // 2. Extract Brand & Product Name
  const { name: productName, brand } = extractBrandAndName(rawText, category);

  // 3. Extract & Clean Ingredients
  const ingredientsResult = parseIngredients(rawText, ocrConfidence);

  // 4. Parse Category-Aware Auxiliary Fields
  const aux = parseAuxiliaryFields(rawText, category);

  // 5. Calculate Confidence & Metadata
  const { confidenceScore, uncertainties } = calculateExtractionConfidence(
    ocrConfidence,
    productName,
    brand,
    category,
    ingredientsResult
  );

  return {
    product: {
      name: productName,
      brand: brand,
      category: category // 'food' | 'skincare' | 'supplements' | 'unknown'
    },
    ingredients: ingredientsResult.list,
    warnings: aux.warnings,
    claims: aux.claims,
    usage: aux.usage,
    nutrition: aux.nutrition,
    allergens: aux.allergens,
    extractionMetadata: {
      source: 'ocr',
      ocrConfidence,
      extractionConfidenceScore: confidenceScore,
      productNameDetected: Boolean(productName),
      brandDetected: Boolean(brand),
      categoryDetected: category !== 'unknown',
      ingredientsDetected: ingredientsResult.list.length > 0,
      ingredientsCount: ingredientsResult.list.length,
      isComplete: ingredientsResult.isComplete,
      lowConfidence: lowOcrConfidence || confidenceScore < 60,
      uncertainties
    }
  };
}

module.exports = {
  extractProductAndIngredients,
  detectCategory,
  extractBrandAndName,
  parseIngredients,
  parseAuxiliaryFields,
  cleanIngredientString,
  splitIngredientsHonoringParentheses
};
