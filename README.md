# 📝 Notes Generator - AI-Powered Note Taking Application

> A full-stack, intelligent notes application that automatically generates well-structured notes from paragraphs using AI-powered keyword extraction and summarization.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v16.0+-green)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18+-blue)](https://expressjs.com/)

---

## 🎯 Features

### Core Functionality
- ✨ **AI-Powered Note Generation** - Automatically extract keywords and generate summaries from any text
- 💬 **Chat-Based Interface** - Intuitive conversation-style note creation
- 🔄 **Iterative Refinement** - Refine and improve generated notes on demand
- 📝 **Full CRUD Operations** - Create, read, update, and delete notes seamlessly
- 💾 **Persistent Storage** - SQLite database ensures all notes are safely stored
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations

### Technical Features
- 🚀 **RESTful API** - Clean, well-documented endpoints
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Real-time Updates** - Instant note generation and sidebar updates
- 🔐 **Input Sanitization** - XSS protection and secure data handling
- 📊 **Keyword Extraction** - Advanced NLP for identifying key concepts
- 🏷️ **Smart Summarization** - Intelligent sentence selection based on importance

---

## 📦 Project Structure

```
notes/
├── server/
│   ├── server.js           # Express server with API routes & note generation
│   └── database.js         # SQLite database initialization & setup
├── public/
│   ├── index.html          # Main HTML structure & modal templates
│   ├── index.js            # Frontend logic, event handlers & API calls
│   └── style.css           # Modern CSS with gradient themes & animations
├── package.json            # Project dependencies & scripts
├── README.md              # Project documentation
└── notes.db               # SQLite database (auto-created on first run)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16.0 or higher
- npm v7.0 or higher

### Installation

1. **Clone and navigate to the project:**
```bash
cd c:\Users\[YourUsername]\OneDrive\Desktop\notes
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

4. **Open in your browser:**
```
http://localhost:3000
```

---

## 💡 Usage Guide

### Generating Notes from Text

1. **Enter Prompt** - Paste a paragraph or describe what you want in the chat input
2. **Review Generated Note** - System automatically generates:
   - 📌 Intelligent title from key concepts
   - 📄 Concise summary of main points
   - 🏷️ Extracted keywords/tags
3. **Save or Refine** - Save the note or click "Refine" to iterate
4. **View Saved Notes** - Access all notes from the left sidebar

### Keyboard Shortcuts
- `Enter` - Send prompt and generate note
- `Shift+Enter` - New line in input field
- Click note in sidebar - View full note details

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Get All Notes
```bash
GET /api/notes
```
**Response:**
```json
[
  {
    "id": 1,
    "title": "Important Concepts",
    "content": "Main points about the topic...",
    "created_at": "2026-03-31T10:00:00",
    "updated_at": "2026-03-31T10:00:00"
  }
]
```

#### Get Single Note
```bash
GET /api/notes/:id
```
**Response:** Single note object

#### Create Note
```bash
POST /api/notes
Content-Type: application/json

{
  "title": "Note Title",
  "content": "Note content here..."
}
```
**Response:** Created note object with ID

#### Update Note
```bash
PUT /api/notes/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```
**Response:** Updated note object

#### Delete Note
```bash
DELETE /api/notes/:id
```
**Response:** `{ "message": "Note deleted successfully" }`

#### Generate Note from Paragraph
```bash
POST /api/generate
Content-Type: application/json

{
  "paragraph": "Long text paragraph to analyze..."
}
```
**Response:**
```json
{
  "title": "Generated Title",
  "content": "Summarized content...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
```

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 16.0+ | JavaScript runtime |
| Express.js | 4.18+ | Web framework |
| SQLite3 | 5.1+ | Database |
| Body-Parser | 1.20+ | JSON parser |
| CORS | 2.8+ | Cross-origin requests |

### Frontend
| Technology | Purpose |
|-----------|---------|
| HTML5 | Semantic markup |
| CSS3 | Styling & animations |
| Vanilla JavaScript | DOM manipulation & API calls |
| No frameworks | Lightweight & fast |

### Database
| Component | Details |
|-----------|---------|
| Type | SQLite (file-based) |
| Location | `/notes.db` |
| Tables | notes (id, title, content, created_at, updated_at) |

---

## 🧠 AI Features Explained

### Keyword Extraction Algorithm
1. Removes common stop words (the, a, and, etc.)
2. Filters words with 3+ characters
3. Calculates word frequency in the text
4. Returns top 8 most relevant keywords

### Summary Generation
1. Splits text into sentences
2. Scores sentences based on keyword density
3. Selects approximately 50% of top-scoring sentences
4. Maintains original sentence order for coherence

---

## 📁 Database Schema

### Notes Table
```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## 🎨 UI/UX Features

### Color Scheme
- **Primary**: Purple gradient (#667eea to #764ba2)
- **Secondary**: Light gray (#f0f2f5)
- **Accent**: White with subtle shadows

### Responsive Design
- Desktop: Multi-column sidebar + main chat area
- Tablet: Collapsible layout with full functionality
- Mobile: Stacked layout optimized for touch

### Animations
- Smooth fade-in for messages
- Slide-in effect for keywords
- Hover effects on interactive elements
- Gradient transitions on buttons

---

## 📝 Example Workflow

```
User: "Artificial intelligence is transforming industries..."
  ↓
System: Extracts keywords → [intelligence, transforming, industries...]
  ↓
System: Generates summary of key points
  ↓
User sees preview with title, keywords, content
  ↓
User clicks "Save Note" → Stored in database
  ↓
Note appears in sidebar for future reference
```

---

## 🔄 Development Workflow

### File Changes for Improvements
- **Backend**: Edit `server/server.js` for API changes
- **Frontend**: Edit `public/index.js` for UI logic
- **Styling**: Edit `public/style.css` for design
- **Database**: Edit `server/database.js` for schema changes

### Testing API Endpoints
Use tools like Postman or curl:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"paragraph":"Your text here..."}'
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Change PORT in `server.js` or kill process on port 3000 |
| Database locked error | Close other instances; SQLite uses file locking |
| CORS errors | Ensure server is running; check cors middleware |
| Notes not appearing | Refresh browser; check browser console for errors |

---

## 📜 Error Handling

The application includes comprehensive error handling:
- Invalid input validation on all endpoints
- Graceful error messages in UI
- Database error recovery
- Network error management
- XSS protection through HTML escaping

---

## 🚀 Performance Optimization

- **Database**: Indexed primary keys for fast lookups
- **Frontend**: No external library dependencies keeps bundle small
- **API**: Direct responses without unnecessary data transformation
- **CSS**: Use of CSS gradients instead of images
- **Caching**: Browser caches static assets

---

## 🔐 Security Features

- ✅ Input sanitization (HTML escaping)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS enabled for controlled cross-origin requests
- ✅ No sensitive data in local storage
- ✅ Error messages don't expose system details

---

## 📱 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Latest stable version |
| Firefox | ✅ Full | Latest stable version |
| Safari | ✅ Full | v12+ recommended |
| Edge | ✅ Full | Latest stable version |
| IE | ❌ No | Not supported |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request with clear description

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or suggestions:
- Check existing GitHub issues
- Review API documentation above
- Review browser console for error details
- Verify all dependencies are installed correctly

---

## 🔗 Quick Links

- 📚 [Node.js Documentation](https://nodejs.org/docs/)
- 🚀 [Express.js Guide](https://expressjs.com/)
- 🗄️ [SQLite Documentation](https://www.sqlite.org/docs.html)

---

**Last Updated:** March 31, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
