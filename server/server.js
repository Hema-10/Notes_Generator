/**
 * Notes Generator Server
 * AI-powered note generation with chat interface
 * REST API for note management and text analysis
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const { generateNoteFromText, validateInput } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Enable CORS for all routes
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// API ROUTES - NOTES
// ============================================================================

/**
 * GET /api/notes
 * Retrieve all notes sorted by latest update
 */
app.get('/api/notes', (req, res) => {
  db.all(
    'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY updated_at DESC',
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          error: 'Failed to fetch notes',
          message: NODE_ENV === 'development' ? err.message : undefined
        });
      }
      res.json(rows || []);
    }
  );
});

/**
 * GET /api/notes/:id
 * Retrieve a specific note by ID
 */
app.get('/api/notes/:id', (req, res) => {
  const { id } = req.params;

  // Validate ID is a number
  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'Invalid note ID' });
  }

  db.get(
    'SELECT * FROM notes WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch note' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Note not found' });
      }
      res.json(row);
    }
  );
});

/**
 * POST /api/notes
 * Create a new note
 * Body: { title: string, content: string }
 */
app.post('/api/notes', (req, res) => {
  const { title, content } = req.body;

  // Validate input
  const validation = validateInput({ title, content });
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  db.run(
    'INSERT INTO notes (title, content) VALUES (?, ?)',
    [title.trim(), content.trim()],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create note' });
      }

      // Fetch the newly created note
      db.get(
        'SELECT * FROM notes WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch created note' });
          }
          res.status(201).json(row);
        }
      );
    }
  );
});

/**
 * PUT /api/notes/:id
 * Update an existing note
 * Body: { title: string, content: string }
 */
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  // Validate ID
  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'Invalid note ID' });
  }

  // Validate input
  const validation = validateInput({ title, content });
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  db.run(
    'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title.trim(), content.trim(), id],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update note' });
      }

      // Fetch updated note
      db.get(
        'SELECT * FROM notes WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch updated note' });
          }
          if (!row) {
            return res.status(404).json({ error: 'Note not found' });
          }
          res.json(row);
        }
      );
    }
  );
});

/**
 * DELETE /api/notes/:id
 * Delete a note by ID
 */
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'Invalid note ID' });
  }

  db.run(
    'DELETE FROM notes WHERE id = ?',
    [id],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete note' });
      }
      res.json({ message: 'Note deleted successfully', id: parseInt(id) });
    }
  );
});

// ============================================================================
// API ROUTES - AI GENERATION
// ============================================================================

/**
 * POST /api/generate
 * Generate a note from a paragraph using AI analysis
 * Body: { paragraph: string }
 * Returns: { title: string, content: string, keywords: string[] }
 */
app.post('/api/generate', (req, res) => {
  const { paragraph } = req.body;

  // Validate input
  if (!paragraph || typeof paragraph !== 'string') {
    return res.status(400).json({ error: 'Paragraph text is required' });
  }

  const trimmedParagraph = paragraph.trim();
  if (trimmedParagraph.length === 0) {
    return res.status(400).json({ error: 'Paragraph cannot be empty' });
  }

  if (trimmedParagraph.length < 20) {
    return res.status(400).json({ error: 'Paragraph must be at least 20 characters' });
  }

  if (trimmedParagraph.length > 50000) {
    return res.status(400).json({ error: 'Paragraph exceeds maximum length of 50000 characters' });
  }

  try {
    const result = generateNoteFromText(trimmedParagraph);
    res.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate note',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// STATIC ROUTES
// ============================================================================

/**
 * GET /
 * Serve main application HTML
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * 404 Not Found handler
 */
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║        📝 Notes Generator Server v2.0.0                    ║
╠════════════════════════════════════════════════════════════╣
║  🚀 Server running on http://localhost:${PORT}              ║
║  📱 Open browser and navigate to http://localhost:${PORT}   ║
║  🔧 Environment: ${NODE_ENV.toUpperCase()}                              ║
║  💾 Database: SQLite (notes.db)                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    db.close(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
