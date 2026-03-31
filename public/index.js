/**
 * Notes Generator - Frontend Application
 * Handles chat interface, note generation, and CRUD operations
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const API_URL = 'http://localhost:3000/api';
const EMPTY_STATE_MESSAGE = 'No saved notes yet';

// ============================================================================
// DOM ELEMENTS
// ============================================================================

// Input/Output elements
const promptInput = document.getElementById('promptInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const notesList = document.getElementById('notesList');
const newChatBtn = document.getElementById('newChatBtn');

// Modal elements
const noteModal = document.getElementById('noteModal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const modalKeywords = document.getElementById('modalKeywords');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

// State
let currentGeneratedNote = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize app on DOM ready
 * Loads notes and sets up event listeners
 */
document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  setupEventListeners();
});

/**
 * Setup all event listeners for the application
 */
function setupEventListeners() {
  // Chat input
  sendBtn.addEventListener('click', sendPrompt);
  promptInput.addEventListener('keydown', handleInputKeydown);

  // Sidebar
  newChatBtn.addEventListener('click', clearChat);

  // Modal
  saveNoteBtn.addEventListener('click', saveNote);
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);

  // Close modal on background click
  window.addEventListener('click', (event) => {
    if (event.target === noteModal) {
      closeModal();
    }
  });
}

/**
 * Handle Enter/Shift+Enter in input field
 * Enter = submit, Shift+Enter = newline
 */
function handleInputKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendPrompt();
  }
}

// ============================================================================
// CHAT & NOTE GENERATION
// ============================================================================

/**
 * Send user prompt to generate a note
 * @async
 */
async function sendPrompt() {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    showNotification('Please enter some text', 'warning');
    return;
  }

  displayUserMessage(prompt);
  promptInput.value = '';
  promptInput.focus();

  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paragraph: prompt })
    });

    if (response.ok) {
      const data = await response.json();
      currentGeneratedNote = data;
      displayBotResponse(data);
    } else {
      displayErrorMessage('Failed to generate note. Please try again.');
    }
  } catch (error) {
    console.error('Generation error:', error);
    displayErrorMessage('Error generating note. Please check your connection.');
  }
}

// ============================================================================
// MESSAGE DISPLAY
// ============================================================================

/**
 * Display user message in chat
 * @param {string} text - Message text
 */
function displayUserMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user';
  messageDiv.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
  chatMessages.appendChild(messageDiv);
  scrollChatToBottom();
}

/**
 * Display bot response with generated note preview
 * @param {object} note - Generated note object { title, content, keywords }
 */
function displayBotResponse(note) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot';

  const keywordsTags = note.keywords
    .map(kw => `<span class="keyword-tag">${escapeHtml(kw)}</span>`)
    .join('');

  messageDiv.innerHTML = `
    <div class="message-content bot-response">
      <div class="response-preview">
        <div class="response-title">${escapeHtml(note.title)}</div>
        <div class="response-content">${escapeHtml(note.content)}</div>
        <div class="response-keywords">
          <label>Keywords:</label>
          <div class="keywords-list">${keywordsTags}</div>
        </div>
        <div class="response-actions">
          <button class="save-note-btn" onclick="openSaveModal()">💾 Save Note</button>
          <button class="refine-btn" onclick="promptRefineNote()">✏️ Refine</button>
        </div>
      </div>
    </div>
  `;

  chatMessages.appendChild(messageDiv);
  scrollChatToBottom();
}

/**
 * Display error message in chat
 * @param {string} error - Error message text
 */
function displayErrorMessage(error) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot error';
  messageDiv.innerHTML = `<div class="message-content">❌ ${escapeHtml(error)}</div>`;
  chatMessages.appendChild(messageDiv);
  scrollChatToBottom();
}

/**
 * Show notification to user (with alert for now)
 * @param {string} message - Notification message
 * @param {string} type - Type: 'info', 'warning', 'error'
 */
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}]`, message);
  // Could be enhanced with toast notification
}

/**
 * Scroll chat to bottom smoothly
 */
function scrollChatToBottom() {
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 0);
}

// ============================================================================
// MODAL & NOTE SAVING
// ============================================================================

/**
 * Open save note modal with current generated note
 */
function openSaveModal() {
  if (!currentGeneratedNote) {
    showNotification('No note to save', 'warning');
    return;
  }

  modalTitle.value = currentGeneratedNote.title;
  modalContent.value = currentGeneratedNote.content;

  const keywordsTags = currentGeneratedNote.keywords
    .map(kw => `<span class="keyword-tag" role="listitem">${escapeHtml(kw)}</span>`)
    .join('');
  modalKeywords.innerHTML = keywordsTags;

  noteModal.showModal();
}

/**
 * Close the save note modal
 */
function closeModal() {
  noteModal.close();
  currentGeneratedNote = null;
}

/**
 * Save note to database
 * @async
 */
async function saveNote() {
  const title = modalTitle.value.trim();
  const content = modalContent.value.trim();

  if (!title || !content) {
    showNotification('Title and content are required', 'warning');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });

    if (response.ok) {
      closeModal();
      await loadNotes();
      displayUserMessage(`✅ Note saved: "${escapeHtml(title)}"`);
      promptInput.focus();
    } else {
      showNotification('Failed to save note', 'error');
    }
  } catch (error) {
    console.error('Save error:', error);
    showNotification('Error saving note', 'error');
  }
}

// ============================================================================
// NOTES MANAGEMENT
// ============================================================================

/**
 * Load all saved notes and populate sidebar
 * @async
 */
async function loadNotes() {
  try {
    const response = await fetch(`${API_URL}/notes`);
    const notes = await response.json();

    notesList.innerHTML = '';

    if (notes.length === 0) {
      notesList.innerHTML = `<p class="empty-state">${EMPTY_STATE_MESSAGE}</p>`;
      return;
    }

    notes.forEach(note => {
      const noteItem = document.createElement('div');
      noteItem.className = 'note-item';
      noteItem.setAttribute('role', 'listitem');

      const noteDate = formatDate(note.updated_at);
      noteItem.innerHTML = `
        <div class="note-item-title" title="${escapeHtml(note.title)}">
          ${escapeHtml(note.title)}
        </div>
        <div class="note-item-date">${noteDate}</div>
      `;

      noteItem.addEventListener('click', () => viewNote(note));
      notesList.appendChild(noteItem);
    });
  } catch (error) {
    console.error('Load notes error:', error);
    notesList.innerHTML = '<p class="empty-state">Error loading notes</p>';
  }
}

/**
 * Display a saved note in the chat
 * @param {object} note - Note object from database
 */
function viewNote(note) {
  displayUserMessage(`📖 Viewing: ${escapeHtml(note.title)}`);

  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot';
  messageDiv.innerHTML = `
    <div class="message-content bot-response">
      <div class="response-preview">
        <div class="response-title">${escapeHtml(note.title)}</div>
        <div class="response-content">${escapeHtml(note.content)}</div>
        <div class="response-actions">
          <button class="delete-btn" onclick="deleteNote(${note.id})">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `;

  chatMessages.appendChild(messageDiv);
  scrollChatToBottom();
}

/**
 * Delete a note from database
 * @async
 * @param {number} id - Note ID
 */
async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await loadNotes();
      displayUserMessage('🗑️ Note deleted');
    } else {
      showNotification('Failed to delete note', 'error');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showNotification('Error deleting note', 'error');
  }
}

/**
 * Prompt user to refine the note
 */
function promptRefineNote() {
  promptInput.value = '🔄 Refine: ';
  promptInput.focus();
  scrollChatToBottom();
}

/**
 * Clear chat history and reset interface
 */
function clearChat() {
  const welcomeHTML = `
    <article class="welcome-message">
      <h3>Welcome to Notes Generator!</h3>
      <section>
        <h4>How it works:</h4>
        <ul>
          <li>📝 Share a paragraph, idea, or topic</li>
          <li>🤖 AI extracts keywords and generates a summary</li>
          <li>✏️ Review and edit before saving</li>
          <li>💾 Keep all your notes organized</li>
        </ul>
      </section>
      <p><em>Tip: You can refine the output by asking for changes.</em></p>
    </article>
  `;
  chatMessages.innerHTML = welcomeHTML;
  promptInput.value = '';
  promptInput.focus();
  currentGeneratedNote = null;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const dateFormat = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const timeFormat = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${dateFormat} ${timeFormat}`;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Raw text
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Escape attribute values
 * @param {string} text - Raw text
 * @returns {string} Escaped attribute
 */
function escapeAttr(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
