let pipeline;
let env;

// Try to dynamically load @xenova/transformers. If it fails, fallback to deterministic mock embedding for tests.
try {
  const transformers = require('@xenova/transformers');
  pipeline = transformers.pipeline;
  env = transformers.env;

  // Optimize for Node.js
  env.allowLocalModels = false; // Force download from HuggingFace Hub
  env.useBrowserCache = false;
} catch (error) {
  console.warn('⚠️ @xenova/transformers not found. Using fallback mock embeddings for testing.');
}

class EmbeddingService {
  constructor() {
    this.extractor = null;
    this.modelName = 'Xenova/all-MiniLM-L6-v2';
    this.dimensions = 384;
    this.isInitializing = false;
    this.initPromise = null;
  }

  async initialize() {
    if (this.extractor) return;
    if (this.isInitializing) return this.initPromise;

    if (!pipeline) {
      // Mock mode
      return;
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        console.log(`Loading embedding model: ${this.modelName}...`);
        this.extractor = await pipeline('feature-extraction', this.modelName);
        console.log('Embedding model loaded successfully.');
      } catch (error) {
        console.error('Failed to load embedding model:', error);
        throw error;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  /**
   * Generates a 384-dimensional vector embedding for the given text
   * @param {string} text - The input text to embed
   * @returns {Promise<number[]>} - 384-dimensional array
   */
  async generateEmbedding(text) {
    if (!text || text.trim() === '') {
      return new Array(this.dimensions).fill(0);
    }

    if (pipeline && !this.extractor) {
      await this.initialize();
    }

    if (this.extractor) {
      const output = await this.extractor(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } else {
      // Deterministic Mock fallback (Sum of char codes mod 1, scaled, normalized)
      return this._generateMockEmbedding(text);
    }
  }

  _generateMockEmbedding(text) {
    const vector = new Array(this.dimensions).fill(0);
    for (let i = 0; i < text.length; i++) {
      vector[i % this.dimensions] += text.charCodeAt(i);
    }
    
    // Normalize mock vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude === 0 ? vector : vector.map(val => val / magnitude);
  }
}

// Export a singleton instance
const embeddingService = new EmbeddingService();
module.exports = embeddingService;
