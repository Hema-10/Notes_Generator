const API_URL = 'http://localhost:3000/api';

// DOM Elements
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
const closeBtn = document.querySelector('.close');

let currentGeneratedNote = null;

// Load notes and setup listeners
document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  setupListeners();
});

function setupListeners() {
  sendBtn.addEventListener('click', sendPrompt);
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  });
  
  newChatBtn.addEventListener('click', clearChat);
  saveNoteBtn.addEventListener('click', saveNote);
  closeModalBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === noteModal) {
      closeModal();
    }
  });
}

// Send prompt and generate note
async function sendPrompt() {
  const prompt = promptInput.value.trim();
  
  if (!prompt) {
    alert('Please enter some text');
    return;
  }

  // Display user message
  displayUserMessage(prompt);
  promptInput.value = '';
  promptInput.focus();

  // Generate note
  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paragraph: prompt })
    });

    if (response.ok) {
      const data = await response.json();
      currentGeneratedNote = data;
      displayBotResponse(data);
    } else {
      displayErrorMessage('Failed to generate note');
    }
  } catch (error) {
    console.error('Error:', error);
    displayErrorMessage('Error generating note');
  }
}

// Display user message
function displayUserMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user';
  messageDiv.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
  chatMessages.appendChild(messageDiv);
  scrollChatToBottom();
}

// Display bot response with note preview
function displayBotResponse(note) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot';
  
  messageDiv.innerHTML = `
    <div class="message-content bot-response">
      <div class="response-preview">
        <div class="response-title">${escapeHtml(note.title)}</div>
        <div class="response-content">${escapeHtml(note.content)}</div>
        <div class="response-keywords">
          <label>Keywords:</label>
          <div class="keywords-list">
            ${note.keywords.map(kw => `<span class="keyword-tag">${escapeHtml(kw)}</span>`).join('')}
          </div>
        </div>
        <div class="response-actions">
          <button class="save-note-btn" onclick="openSaveModal()">💾 Save Note</button>
          <button class="refine-btn" onclick="refineNote()">✏️ Refine</button>
        </div>
      </div>
    </div>
  `;
  
  chatMessages.appendChild(messageDiv);
  scrollChatToBottom();
}

// Display error message
function displayErrorMessage(error) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot';
  messageDiv.innerHTML = `<div class="message-content">❌ ${escapeHtml(error)}</div>`;
  chatMessages.appendChild(messageDiv);
  scrollChatToBottom();
}

// Open save modal
function openSaveModal() {
  if (!currentGeneratedNote) return;
  
  modalTitle.value = currentGeneratedNote.title;
  modalContent.value = currentGeneratedNote.content;
  modalKeywords.innerHTML = currentGeneratedNote.keywords
    .map(kw => `<span class="keyword-tag">${escapeHtml(kw)}</span>`)
    .join('');
  
  noteModal.classList.add('show');
}

// Close modal
function closeModal() {
  noteModal.classList.remove('show');
  currentGeneratedNote = null;
}

// Save note to database
async function saveNote() {
  const title = modalTitle.value.trim();
  const content = modalContent.value.trim();

  if (!title || !content) {
    alert('Title and content are required');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, content })
    });

    if (response.ok) {
      closeModal();
      loadNotes();
      displayUserMessage(`✅ Note saved: "${title}"`);
      promptInput.focus();
    } else {
      alert('Failed to save note');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error saving note');
  }
}

// Refine note (ask for changes)
function refineNote() {
  promptInput.value = '🔄 Refine: ';
  promptInput.focus();
  scrollChatToBottom();
}

// Load all saved notes to sidebar
async function loadNotes() {
  try {
    const response = await fetch(`${API_URL}/notes`);
    const notes = await response.json();

    notesList.innerHTML = '';
    
    if (notes.length === 0) {
      notesList.innerHTML = '<p class="empty-state">No saved notes yet</p>';
      return;
    }

    notes.forEach(note => {
      const noteItem = document.createElement('div');
      noteItem.className = 'note-item';
      noteItem.innerHTML = `
        <div class="note-item-title" title="${escapeAttr(note.title)}">${escapeHtml(note.title)}</div>
        <div class="note-item-date">${formatDate(note.updated_at)}</div>
      `;
      
      noteItem.addEventListener('click', () => viewNote(note));
      notesList.appendChild(noteItem);
    });
  } catch (error) {
    console.error('Error:', error);
    notesList.innerHTML = '<p class="empty-state">Error loading notes</p>';
  }
}

// View note details
function viewNote(note) {
  displayUserMessage(`📖 Viewing: ${note.title}`);
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot';
  messageDiv.innerHTML = `
    <div class="message-content bot-response">
      <div class="response-preview">
        <div class="response-title">${escapeHtml(note.title)}</div>
        <div class="response-content">${escapeHtml(note.content)}</div>
        <div class="response-actions">
          <button class="refine-btn" onclick="deleteNoteItem(${note.id})">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `;
  
  chatMessages.appendChild(messageDiv);
  scrollChatToBottom();
}

// Delete note
async function deleteNoteItem(id) {
  if (!confirm('Delete this note?')) return;

  try {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadNotes();
      displayUserMessage('🗑️ Note deleted');
    } else {
      alert('Failed to delete note');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error deleting note');
  }
}

// Clear chat
function clearChat() {
  chatMessages.innerHTML = `
    <div class="welcome-message">
      <h3>Welcome to Notes Generator!</h3>
      <p>Share a paragraph, idea, or topic and I'll automatically generate a well-structured note with keywords extracted.</p>
      <p>You can refine the output by asking for changes.</p>
    </div>
  `;
  promptInput.value = '';
  promptInput.focus();
  currentGeneratedNote = null;
}

// Utility functions
function scrollChatToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
