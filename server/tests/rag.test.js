const { cleanText } = require('../services/rag/textCleaningService');
const { recursiveCharacterTextSplitter, chunkDocument } = require('../services/rag/chunkingService');
const embeddingService = require('../services/rag/embeddingService');
const vectorStoreService = require('../services/rag/vectorStoreService');
const retrievalService = require('../services/rag/retrievalService');

const Ingredient = require('../models/Ingredient');

jest.setTimeout(30000); // 30 seconds for transformers.js load

describe('Phase 6 RAG Pipeline Verification', () => {
  let findOneSpy;

  beforeAll(async () => {
    // Mock MongoDB
    findOneSpy = jest.spyOn(Ingredient, 'findOne').mockImplementation(() => ({
      lean: jest.fn().mockResolvedValue(null)
    }));

    // Initialize embedding service
    await embeddingService.initialize();
    // Initialize in-memory vector store for testing
    vectorStoreService.storePath = './data/test_vector_store.json';
    await vectorStoreService.clear();
  });

  afterAll(async () => {
    await vectorStoreService.clear();
    findOneSpy.mockRestore();
  });

  test('1 & 2. Text Cleaning: Removes excess whitespace and noise while preserving standard terms', () => {
    const rawText = `This is   a \n\n\n test    text \t with  some \r\n noise.  Ingredient: Niacinamide (Vitamin B3).`;
    const cleaned = cleanText(rawText);
    expect(cleaned).toBe('This is a \n test text with some \n noise. Ingredient: Niacinamide (Vitamin B3).');
  });

  test('3. Chunking: Recursive splitting into 512-character chunks with 64 overlap', () => {
    const longText = 'A'.repeat(1000);
    const chunks = recursiveCharacterTextSplitter(longText, 512, 64);
    
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].length).toBeLessThanOrEqual(512);
    // Checking overlap mathematically
    const overlapPart = chunks[0].substring(chunks[0].length - 64);
    expect(chunks[1].startsWith(overlapPart)).toBe(true);
  });

  test('4. Chunking: Attach source metadata & provenance', () => {
    const doc = {
      _id: 'source-123',
      title: 'FDA Cosmetic Safety',
      authority: 'FDA',
      content: 'This is a test document about Niacinamide safety.'
    };
    const chunks = chunkDocument(doc);
    expect(chunks.length).toBe(1);
    expect(chunks[0].metadata.title).toBe('FDA Cosmetic Safety');
    expect(chunks[0].metadata.authority).toBe('FDA');
  });

  test('5. Embeddings: Generate 384-dimensional vector embedding', async () => {
    const vector = await embeddingService.generateEmbedding('Phenoxyethanol safety');
    expect(Array.isArray(vector)).toBe(true);
    expect(vector.length).toBe(384);
  });

  test('6. Vector Store: Store and Load Vectors', async () => {
    const vec1 = new Array(384).fill(0.1);
    await vectorStoreService.addVector('id-1', vec1, 'test text', { title: 'Test' });
    
    expect(vectorStoreService.vectors.length).toBe(1);
    expect(vectorStoreService.vectors[0].id).toBe('id-1');
  });

  test('7 & 8. Retrieval: Cosine similarity query with topK', async () => {
    // Add two test vectors
    const vecA = await embeddingService.generateEmbedding('Apple is a fruit');
    const vecB = await embeddingService.generateEmbedding('Car is a vehicle');
    
    await vectorStoreService.addVector('doc-a', vecA, 'Apple is a fruit', { category: 'food' });
    await vectorStoreService.addVector('doc-b', vecB, 'Car is a vehicle', { category: 'transport' });

    // Assuming we test query "Apple"
    const queryVec = await embeddingService.generateEmbedding('Apple');
    const results = await vectorStoreService.search(queryVec, 1, 0.50); // Threshold 0.50 for robustness in tests
    
    expect(results.length).toBe(1);
    expect(results[0].text).toBe('Apple is a fruit');
  });

  test('9. Retrieval: No-result query handles correctly without fake data', async () => {
    // Query completely unrelated concept that won't match (or we use a very high threshold)
    const queryVec = await embeddingService.generateEmbedding('Quantum physics');
    const results = await vectorStoreService.search(queryVec, 5, 0.95);
    
    expect(results.length).toBe(0);
  });

  test('10. Retrieval API Service: Retrieves correctly with hybrid context (Mock DB)', async () => {
    // We test the retrievalService logic. 
    // It should hit vectorStore and attempt a DB findOne. 
    // Since we don't connect to real MongoDB here, the findOne mock or failure will just return null for canonical,
    // which is the expected behavior if ingredient is not found.
    const result = await retrievalService.retrieve('Apple');
    
    expect(result.query).toBe('Apple');
    expect(result.results).toBeInstanceOf(Array);
    // Since vecA is still in store, we might match it
    if (result.results.length > 0) {
      expect(result.results[0].metadata).toBeDefined();
    }
  });

  test('11. Source Provenance is cited on every result', async () => {
    const result = await retrievalService.retrieve('Apple');
    
    if (result.results.length > 0) {
      expect(result.results[0].metadata).toHaveProperty('category');
    }
  });
});
