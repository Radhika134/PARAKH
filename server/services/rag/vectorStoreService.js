const fs = require('fs');
const path = require('path');

class VectorStoreService {
  constructor() {
    this.storePath = path.join(__dirname, '../../../data/vector_store.json');
    this.vectors = [];
    this.isLoaded = false;
  }

  /**
   * Initializes the vector store by loading it from disk
   */
  async initialize() {
    if (this.isLoaded) return;
    
    // Ensure directory exists
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.storePath)) {
      try {
        const data = fs.readFileSync(this.storePath, 'utf8');
        this.vectors = JSON.parse(data);
      } catch (error) {
        console.error('Failed to load vector store:', error);
        this.vectors = [];
      }
    } else {
      this.vectors = [];
    }
    this.isLoaded = true;
  }

  /**
   * Calculates exact Cosine Similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Adds a new vector to the store
   * @param {string} id - Unique identifier
   * @param {number[]} embedding - 384-dimensional vector
   * @param {string} text - Chunk text
   * @param {Object} metadata - Provenance metadata
   */
  async addVector(id, embedding, text, metadata) {
    if (!this.isLoaded) await this.initialize();
    
    // Check if ID already exists, update if so
    const existingIndex = this.vectors.findIndex(v => v.id === id);
    const newEntry = { id, embedding, text, metadata };
    
    if (existingIndex >= 0) {
      this.vectors[existingIndex] = newEntry;
    } else {
      this.vectors.push(newEntry);
    }
  }

  /**
   * Persists the current vectors to disk
   */
  async save() {
    if (!this.isLoaded) return;
    fs.writeFileSync(this.storePath, JSON.stringify(this.vectors, null, 2), 'utf8');
  }

  /**
   * Performs semantic similarity search
   * @param {number[]} queryEmbedding - Vector to search for
   * @param {number} topK - Number of results to return
   * @param {number} threshold - Minimum similarity score (default 0.60)
   * @returns {Array} - Top matching chunks with metadata
   */
  async search(queryEmbedding, topK = 5, threshold = 0.60) {
    if (!this.isLoaded) await this.initialize();
    
    if (this.vectors.length === 0) return [];

    // Calculate similarity for all vectors
    const results = this.vectors.map(item => {
      const score = this.cosineSimilarity(queryEmbedding, item.embedding);
      return {
        id: item.id,
        text: item.text,
        metadata: item.metadata,
        score
      };
    });

    // Filter by threshold, sort by score descending, and take topK
    return results
      .filter(item => item.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
  
  /**
   * Clears the vector store
   */
  async clear() {
    this.vectors = [];
    await this.save();
  }
}

// Export singleton instance
const vectorStoreService = new VectorStoreService();
module.exports = vectorStoreService;
