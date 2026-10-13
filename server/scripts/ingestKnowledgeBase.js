const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');
const KnowledgeSource = require('../models/KnowledgeSource');
const { chunkDocument } = require('../services/rag/chunkingService');
const embeddingService = require('../services/rag/embeddingService');
const vectorStoreService = require('../services/rag/vectorStoreService');
const crypto = require('crypto');

async function ingestKnowledgeBase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Initializing Vector Store...');
    await vectorStoreService.initialize();
    
    // Optional: Clear existing vector store for a fresh ingestion
    // await vectorStoreService.clear();

    console.log('Fetching active Knowledge Sources...');
    const sources = await KnowledgeSource.find({ is_active: true });
    
    console.log(`Found ${sources.length} active sources. Beginning processing...`);
    
    let totalChunks = 0;
    
    // Process sequentially to not overload embedding service (especially if using Xenova/transformers)
    for (const source of sources) {
      console.log(`\nProcessing source: ${source.title} (${source.authority})`);
      
      // 1. Chunk document
      const chunks = chunkDocument(source, 512, 64);
      console.log(`  - Split into ${chunks.length} chunks`);
      
      for (const chunk of chunks) {
        // 2. Generate Embedding
        const embedding = await embeddingService.generateEmbedding(chunk.text);
        
        // 3. Create deterministic ID for the chunk
        const hash = crypto.createHash('md5').update(`${chunk.metadata.sourceId}-${chunk.metadata.chunkIndex}`).digest('hex');
        
        // 4. Add to Vector Store
        await vectorStoreService.addVector(hash, embedding, chunk.text, chunk.metadata);
      }
      
      totalChunks += chunks.length;
    }
    
    // 5. Save vector store to disk
    console.log('\nSaving vector store to disk...');
    await vectorStoreService.save();
    
    console.log(`\n✅ Ingestion complete! Successfully processed ${sources.length} documents into ${totalChunks} embedded chunks.`);
    
  } catch (error) {
    console.error('Ingestion failed:', error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

if (require.main === module) {
  ingestKnowledgeBase();
}

module.exports = ingestKnowledgeBase;
