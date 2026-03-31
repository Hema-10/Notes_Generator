const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// GET all notes
app.get('/api/notes', (req, res) => {
  db.all('SELECT * FROM notes ORDER BY updated_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET single note
app.get('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM notes WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json(row);
  });
});

// CREATE note
app.post('/api/notes', (req, res) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  db.run(
    'INSERT INTO notes (title, content) VALUES (?, ?)',
    [title, content],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      db.get('SELECT * FROM notes WHERE id = last_insert_rowid()', [], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

// UPDATE note
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  db.run(
    'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, content, id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      db.get('SELECT * FROM notes WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// DELETE note
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM notes WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Note deleted successfully' });
  });
});

// Extract keywords and generate note from paragraph
app.post('/api/generate', (req, res) => {
  const { paragraph } = req.body;

  if (!paragraph || paragraph.trim().length === 0) {
    res.status(400).json({ error: 'Paragraph is required' });
    return;
  }

  try {
    const result = generateNoteFromParagraph(paragraph);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate note from paragraph
function generateNoteFromParagraph(text) {
  // Extract keywords
  const keywords = extractKeywords(text);

  // Generate title from keywords
  const title = generateTitle(keywords, text);

  // Generate summary
  const summary = generateSummary(text);

  return {
    title: title,
    content: summary,
    keywords: keywords
  };
}

// Extract important keywords from text
function extractKeywords(text) {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'should', 'may', 'might', 'must', 'can', 'that', 'this',
    'it', 'which', 'who', 'as', 'if', 'you', 'he', 'she', 'they', 'we',
    'our', 'your', 'his', 'her', 'its', 'their', 'am', 'me', 'him', 'us'
  ]);

  // Clean and split text
  const words = text
    .toLowerCase()
    .replace(/[.,!?;:"'-]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count word frequency
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Get top keywords
  const topKeywords = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  return topKeywords;
}

// Generate title from keywords and text
function generateTitle(keywords, text) {
  if (keywords.length === 0) {
    // Fallback to first few words
    return text.split(' ').slice(0, 5).join(' ') + '...';
  }

  // Create title from top keywords
  const title = keywords.slice(0, 3).join(', ');
  return title.charAt(0).toUpperCase() + title.slice(1);
}

// Generate summary from text
function generateSummary(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  if (sentences.length <= 3) {
    return text;
  }

  // Score sentences based on keyword frequency
  const words = text.toLowerCase().split(/\s+/);
  const scoreMap = {};

  words.forEach(word => {
    word = word.replace(/[.,!?;:"'-]/g, '');
    scoreMap[word] = (scoreMap[word] || 0) + 1;
  });

  let sentenceScores = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    const score = sentenceWords.reduce((sum, word) => {
      word = word.replace(/[.,!?;:"'-]/g, '');
      return sum + (scoreMap[word] || 0);
    }, 0);

    return { sentence: sentence.trim(), score, index };
  });

  // Select top sentences in original order
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.ceil(sentences.length / 2))
    .sort((a, b) => a.index - b.index)
    .map(item => item.sentence)
    .join(' ');

  return topSentences;
}

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
