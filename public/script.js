const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const clearBtn = document.getElementById('clear-btn');
const newChatBtn = document.getElementById('new-chat-btn');

// Internal state
let conversationHistory = [];

// Configure marked with highlight.js
marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  breaks: true,
  gfm: true
});

/**
 * Custom renderer for code blocks to add copy button
 */
const renderer = new marked.Renderer();
renderer.code = function(code, language) {
  const validLang = !!(language && hljs.getLanguage(language));
  const highlighted = validLang ? hljs.highlight(code, { language }).value : code;
  
  return `
    <div class="code-container">
      <div class="code-header">
        <span>${language || 'code'}</span>
        <button class="copy-btn" onclick="copyToClipboard(this)">Copy</button>
      </div>
      <pre><code class="hljs ${validLang ? 'language-' + language : ''}">${highlighted}</code></pre>
    </div>
  `;
};
marked.use({ renderer });

/**
 * Copies code to clipboard
 */
window.copyToClipboard = (btn) => {
  const code = btn.parentElement.nextElementSibling.innerText;
  navigator.clipboard.writeText(code).then(() => {
    const originalText = btn.innerText;
    btn.innerText = 'Copied!';
    setTimeout(() => {
      btn.innerText = originalText;
    }, 2000);
  });
};

/**
 * Auto-resize textarea
 */
userInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
});

/**
 * Clear chat and reset state
 */
function resetChat() {
  chatBox.innerHTML = '';
  conversationHistory = [];
  userInput.value = '';
  userInput.style.height = 'auto';
}

clearBtn.addEventListener('click', () => {
  if (confirm('Bersihkan semua chat?')) {
    resetChat();
  }
});

newChatBtn.addEventListener('click', () => {
  if (chatBox.children.length > 0) {
    resetChat();
  }
});

/**
 * Handles the chat form submission
 */
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // Add to internal history
  conversationHistory.push({ role: 'user', text: message });

  // 1. Add user message to UI
  appendMessage('user', message);
  
  const payload = {
    conversation: conversationHistory
  };

  // Reset input
  userInput.value = '';
  userInput.style.height = 'auto';

  // 2. Show thinking animation
  const botMessageElement = appendMessage('bot', '<div class="thinking"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${response.status}`);
    }

    const data = await response.json();

    // 4. Render Markdown response
    if (data && data.result) {
      botMessageElement.innerHTML = marked.parse(data.result);
      conversationHistory.push({ role: 'bot', text: data.result });
    } else {
      botMessageElement.textContent = 'Maaf, server tidak memberikan respon.';
    }

  } catch (error) {
    console.error('Chat Error:', error);
    botMessageElement.innerHTML = `<div class="error-msg">Error: ${error.message || 'Koneksi gagal'}</div>`;
  }
  
  chatBox.scrollTop = chatBox.scrollHeight;
});

/**
 * Appends a message to the chat box
 */
function appendMessage(sender, content) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  
  if (sender === 'user') {
    const textDiv = document.createElement('div');
    textDiv.textContent = content;
    msg.innerHTML = `<div>${textDiv.innerHTML}</div>`;
  } else {
    msg.innerHTML = content;
  }
  
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
