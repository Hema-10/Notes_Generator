/**
 * Database Module - SQLite3 Configuration
 * Initializes the SQLite database and creates required schema
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '../notes.db');

/**
 * Initialize SQLite database connection
 * Logs connection status and handles errors gracefully
 */
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1); // Exit on critical error
  } else {
    console.log('✅ Connected to SQLite database');
    console.log(`📁 Database location: ${dbPath}`);
  }
});

// Enable foreign keys (best practice for SQLite)
db.run('PRAGMA foreign_keys = ON', (err) => {
  if (err) {
    console.error('❌ Failed to enable foreign keys:', err.message);
  } else {
    console.log('✅ Foreign key constraints enabled');
  }
});

/**
 * Create notes table schema
 * Executed on first run or initialization
 * 
 * Table Structure:
 * - id: Unique identifier (auto-increment)
 * - title: Note title (required, max 200 chars)
 * - content: Note content (required, max 50000 chars)
 * - created_at: Creation timestamp (auto-set)
 * - updated_at: Last modification timestamp (auto-set)
 */
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT title_length CHECK(LENGTH(title) <= 200),
    CONSTRAINT content_length CHECK(LENGTH(content) <= 50000)
  )
`;

db.run(createTableQuery, (err) => {
  if (err) {
    console.error('❌ Failed to create notes table:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Notes table initialized');
  }
});

/**
 * Create index for better query performance
 * Indexes on created_at improve sorting efficiency
 */
const createIndexQuery = `
  CREATE INDEX IF NOT EXISTS idx_notes_created_at 
  ON notes(created_at DESC)
`;

db.run(createIndexQuery, (err) => {
  if (err) {
    console.error('⚠️  Failed to create index:', err.message);
  } else {
    console.log('✅ Database indexes created');
  }
});

/**
 * Error handling for database connection
 * Logs unexpected errors during operation
 */
db.on('error', (err) => {
  console.error('❌ Unexpected database error:', err.message);
});

module.exports = db;
