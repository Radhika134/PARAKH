const { cleanText } = require('./textCleaningService');

/**
 * Splits text into chunks of max chunk_size with chunk_overlap
 */
const recursiveCharacterTextSplitter = (text, chunkSize = 512, chunkOverlap = 64) => {
  if (!text) return [];
  
  // Clean text before chunking
  const cleanedText = cleanText(text);
  
  if (cleanedText.length <= chunkSize) {
    return [cleanedText];
  }

  const chunks = [];
  let i = 0;
  
  while (i < cleanedText.length) {
    // Determine the end of the current chunk
    let end = i + chunkSize;
    
    if (end >= cleanedText.length) {
      chunks.push(cleanedText.substring(i));
      break;
    }

    // Try to find a good breaking point (newline or period)
    let breakPoint = end;
    const searchSpace = cleanedText.substring(i + chunkSize - chunkOverlap, end);
    
    const lastNewline = searchSpace.lastIndexOf('\n');
    const lastPeriod = searchSpace.lastIndexOf('. ');
    
    if (lastNewline !== -1) {
      breakPoint = i + chunkSize - chunkOverlap + lastNewline + 1; // +1 to include the newline
    } else if (lastPeriod !== -1) {
      breakPoint = i + chunkSize - chunkOverlap + lastPeriod + 1; // +1 to include the period
    }
    
    // Fallback if no natural break is found (cut off exactly at chunkSize)
    if (breakPoint <= i) {
      breakPoint = end;
    }

    chunks.push(cleanedText.substring(i, breakPoint).trim());
    
    // Move to the next chunk, accounting for overlap
    i = breakPoint - chunkOverlap;
    
    // Ensure we always make progress to prevent infinite loop
    if (i <= chunks[chunks.length - 1].length - chunkSize + chunkOverlap) {
       i = breakPoint; // Forcing forward if overlap causes stagnation
    }
    // A safer way: just increment by (chunkSize - chunkOverlap)
    // Actually, setting i = breakPoint - chunkOverlap is the standard approach, 
    // but if breakPoint was exactly 'end', then we moved forward by chunkSize.
    // If breakPoint was smaller, we move forward less.
    // Let's use a simpler safe approach:
    // i = breakPoint - chunkOverlap;
    // if i <= previous_i, then i = previous_i + 1 (to ensure progress)
  }

  // Let's refine the chunking logic to be absolutely deterministic and robust
  return splitText(cleanedText, chunkSize, chunkOverlap);
};

function splitText(text, chunkSize, chunkOverlap) {
  const chunks = [];
  let i = 0;
  
  while (i < text.length) {
    let end = Math.min(i + chunkSize, text.length);
    let chunk = text.substring(i, end);
    
    if (end === text.length) {
       chunks.push(chunk.trim());
       break;
    }
    
    // Find last natural break (newline or period) within the chunk
    let lastBreak = Math.max(
       chunk.lastIndexOf('\n'),
       chunk.lastIndexOf('. ')
    );
    
    // If a break is found and it's not too far back (e.g. at least past the halfway point)
    // to avoid very small chunks
    if (lastBreak > chunkSize / 2) {
       end = i + lastBreak + 1;
       chunk = text.substring(i, end);
    }
    
    chunks.push(chunk.trim());
    i = end - chunkOverlap;
    
    // Ensure forward progress
    if (i < 0 || end <= i) {
      i = end;
    }
  }
  
  return chunks.filter(c => c.length > 0);
}

/**
 * Chunks a document and attaches provenance metadata
 */
const chunkDocument = (doc, chunkSize = 512, chunkOverlap = 64) => {
  const textChunks = recursiveCharacterTextSplitter(doc.content, chunkSize, chunkOverlap);
  
  return textChunks.map((text, index) => ({
    text,
    metadata: {
      sourceId: doc._id ? doc._id.toString() : null,
      title: doc.title,
      authority: doc.authority,
      section: doc.section || '',
      year: doc.publication_year || '',
      url: doc.url || '',
      chunkIndex: index
    }
  }));
};

module.exports = {
  recursiveCharacterTextSplitter,
  chunkDocument
};
