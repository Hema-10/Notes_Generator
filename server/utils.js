/**
 * Utility Functions for Notes Generator
 * Handles text analysis, keyword extraction, and summarization
 */

/**
 * Extract important keywords from text
 * Uses frequency analysis and filters common stop words
 * @param {string} text - The text to analyze
 * @returns {string[]} Array of top keywords
 */
function extractKeywords(text) {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'that', 'this', 'it', 'which',
    'who', 'as', 'if', 'you', 'he', 'she', 'they', 'we', 'our', 'your',
    'his', 'her', 'its', 'their', 'am', 'me', 'him', 'us', 'these', 'those',
    'i', 'so', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'some', 'such', 'no', 'not', 'only', 'same', 'than',
    'too', 'very', 'just', 'my', 'their', 'them', 'then', 'there'
  ]);

  try {
    // Clean and tokenize text
    const words = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word) && !/^\d+$/.test(word));

    // Calculate word frequency
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Get top keywords
    const topKeywords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return topKeywords.length > 0 ? topKeywords : ['information', 'content', 'topic'];
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return ['content'];
  }
}

/**
 * Generate title from keywords
 * Creates a concise, readable title from the most important keywords
 * @param {string[]} keywords - Array of keyword strings
 * @returns {string} Generated title
 */
function generateTitle(keywords) {
  if (!keywords || keywords.length === 0) {
    return 'Untitled Note';
  }

  // Use top 2-3 keywords to create title
  const titleKeywords = keywords.slice(0, 3);
  let title = titleKeywords.join(' • ');

  // Capitalize properly
  title = title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return title.substring(0, 100); // Limit to 100 chars
}

/**
 * Generate summary from text
 * Uses frequency-based sentence scoring to select important sentences
 * @param {string} text - The text to summarize
 * @returns {string} Summarized text
 */
function generateSummary(text) {
  try {
    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    if (sentences.length <= 3) {
      return text;
    }

    // Build word frequency map
    const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Score sentences
    const scoredSentences = sentences.map((sentence, index) => {
      const sentenceWords = sentence.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
      const score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
      return {
        sentence: sentence.trim(),
        score,
        index
      };
    });

    // Select top sentences
    const summaryCount = Math.ceil(sentences.length / 2);
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, summaryCount)
      .sort((a, b) => a.index - b.index)
      .map(item => item.sentence)
      .join(' ');

    return summaryCount > 0 ? topSentences : text;
  } catch (error) {
    console.error('Error generating summary:', error);
    return text;
  }
}

/**
 * Validate user input
 * Checks that required fields are present and meet minimum requirements
 * @param {object} input - Object containing title and content
 * @returns {object} Validation result { valid: boolean, error?: string }
 */
function validateInput({ title, content }) {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Title is required and must be a string' };
  }

  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Content is required and must be a string' };
  }

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();

  if (trimmedTitle.length === 0) {
    return { valid: false, error: 'Title cannot be empty' };
  }

  if (trimmedContent.length === 0) {
    return { valid: false, error: 'Content cannot be empty' };
  }

  if (trimmedTitle.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }

  if (trimmedContent.length > 50000) {
    return { valid: false, error: 'Content must be less than 50000 characters' };
  }

  return { valid: true };
}

/**
 * Generate a complete note from a paragraph
 * Extracts keywords, generates title, and creates summary
 * @param {string} paragraph - The input paragraph text
 * @returns {object} Generated note { title, content, keywords }
 */
function generateNoteFromText(paragraph) {
  try {
    const keywords = extractKeywords(paragraph);
    const title = generateTitle(keywords);
    const content = generateSummary(paragraph);

    return {
      title,
      content,
      keywords
    };
  } catch (error) {
    console.error('Error generating note:', error);
    throw new Error('Failed to generate note from text');
  }
}

module.exports = {
  extractKeywords,
  generateTitle,
  generateSummary,
  validateInput,
  generateNoteFromText
};
