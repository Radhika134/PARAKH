# PARAKH — AI Analysis Contract & Prompt Specification

## Executive Overview
The AI Analysis Engine synthesizes **Extracted Product Information**, **Retrieved Evidence**, and **User Preferences** in a single AI reasoning step. It outputs a strictly validated JSON response matching the schema defined below.

---

## 1. AI Analysis Input Flow & Payload Contract

$$\text{Extracted Product Info} + \text{Retrieved Evidence} + \text{User Preferences} \longrightarrow \mathbf{\text{AI Analysis}} \longrightarrow \text{Transparency Report}$$

```json
{
  "product_information": {
    "product_name": "Verdant Botanicals Serum",
    "category": "Skincare",
    "extracted_ingredients": [
      "Water",
      "Niacinamide",
      "Glycerin",
      "Phenoxyethanol",
      "Fragrance"
    ]
  },
  "retrieved_evidence": [
    {
      "ingredient": "Niacinamide",
      "authority": "FDA",
      "source": "FDA Cosmetic Science Review (2021)",
      "quote": "Niacinamide is safe for topical applications up to 5% concentration."
    },
    {
      "ingredient": "Fragrance",
      "authority": "WHO",
      "source": "WHO Technical Report #980",
      "quote": "Synthetic fragrance formulations may trigger contact dermatitis in sensitive skin."
    }
  ],
  "user_preferences": {
    "sensitivities": ["fragrance", "parabens"],
    "dietary_preferences": ["vegan", "cruelty_free"],
    "health_goals": ["sensitive_skin"]
  }
}
```

---

## 2. LLM System Prompt Contract

```markdown
You are PARAKH AI, an expert Product Intelligence and Evidence-Backed Analysis Assistant.

YOUR GOAL:
Analyze the provided Product Information against the Retrieved Evidence (FSSAI, WHO, FDA, PubMed) AND active User Preferences. Synthesize a single transparent JSON report.

SAFETY & INTEGRATED PERSONALIZATION RULES:
1. NON-MEDICAL BOUNDARY: You are not a medical diagnosis or treatment tool. Never provide medical prescriptions or absolute safety guarantees ("100% safe").
2. EVIDENCE GROUNDING: Base all safety observations and ingredient breakdowns strictly on the retrieved evidence chunks.
3. INTEGRATED PERSONALIZATION: Evaluate user preferences (sensitivities, dietary rules, health goals) directly against the extracted ingredients. If a match is found (e.g. Fragrance matching sensitive skin goal), generate an alert in `personalized_insights`.
4. UNCERTAINTY DECLARATION: Explicitly state any missing regulatory evidence or label ambiguities in `uncertainty_declaration`.
5. OUTPUT FORMAT: Respond ONLY with valid, parsable JSON matching the exact schema below.
```

---

## 3. Strict JSON Output Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PARAKHTransparencyReport",
  "type": "object",
  "required": [
    "report_id",
    "product_summary",
    "confidence_score",
    "ingredient_breakdown",
    "personalized_insights",
    "evidence_citations",
    "uncertainty_declaration",
    "disclaimer"
  ],
  "properties": {
    "report_id": { "type": "string" },
    "product_summary": {
      "type": "object",
      "required": ["product_name", "category", "total_ingredients"],
      "properties": {
        "product_name": { "type": "string" },
        "category": { "type": "string" },
        "total_ingredients": { "type": "integer" },
        "verification_status": { "type": "string", "enum": ["LABEL_VERIFIED", "PARTIAL_MATCH", "UNVERIFIED"] }
      }
    },
    "confidence_score": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100
    },
    "ingredient_breakdown": {
      "type": "object",
      "required": ["beneficial", "sensitivities_allergens", "additives_preservatives"],
      "properties": {
        "beneficial": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "function", "evidence_tag"],
            "properties": {
              "name": { "type": "string" },
              "function": { "type": "string" },
              "evidence_tag": { "type": "string" }
            }
          }
        },
        "sensitivities_allergens": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "concern", "evidence_tag"],
            "properties": {
              "name": { "type": "string" },
              "concern": { "type": "string" },
              "evidence_tag": { "type": "string" }
            }
          }
        },
        "additives_preservatives": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "purpose", "regulatory_limit"],
            "properties": {
              "name": { "type": "string" },
              "purpose": { "type": "string" },
              "regulatory_limit": { "type": "string" }
            }
          }
        }
      }
    },
    "personalized_insights": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type", "matched_preference", "message"],
        "properties": {
          "type": { "type": "string", "enum": ["WARNING", "INFO", "SUCCESS"] },
          "matched_preference": { "type": "string" },
          "message": { "type": "string" }
        }
      }
    },
    "evidence_citations": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["authority", "source_name", "quote"],
        "properties": {
          "authority": { "type": "string", "enum": ["FSSAI", "WHO", "FDA", "PubMed"] },
          "source_name": { "type": "string" },
          "quote": { "type": "string" }
        }
      }
    },
    "uncertainty_declaration": {
      "type": "string"
    },
    "disclaimer": {
      "type": "string",
      "default": "PARAKH provides informational product intelligence based on available public guidelines. It is not a medical diagnosis or treatment system."
    }
  }
}
```
