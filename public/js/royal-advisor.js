const messagesArea = document.getElementById('messagesArea');
const questionInput = document.getElementById('questionInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const suggestedBtns = document.querySelectorAll('.suggested-btn');

// Event listeners
questionInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendQuestion();
});

sendBtn.addEventListener('click', sendQuestion);

suggestedBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const question = btn.getAttribute('data-question');
    questionInput.value = question;
    sendQuestion();
  });
});

function sendQuestion() {
  const question = questionInput.value.trim();
  if (!question) return;

  questionInput.value = '';
  sendBtn.disabled = true;

  addMessage('user', '👤 You', question);
  showTyping();

  fetchAnswer(question);
}

async function fetchAnswer(question) {
  try {
    const res = await fetch('/api/ask-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ question })
    });

    const data = await res.json();
    hideTyping();

    if (data.answer) {
      addMessage('advisor', '🤖 Royal Advisor', data.answer);
    } else {
      addMessage('advisor', '🤖 Royal Advisor',
        'Forgive me, my liege. ' + (data.error || 'The knowledge scrolls are sealed.'));
    }

  } catch (err) {
    hideTyping();
    addMessage('advisor', '🤖 Royal Advisor',
      'Alas! The connection to the Royal Archive has been severed.');
  }

  sendBtn.disabled = false;
  scrollToBottom();
}

function addMessage(type, header, content) {
  const div = document.createElement('div');
  div.className = `message ${type}`;
  div.innerHTML = `
    <div class="message-header">${escapeHtml(header)}</div>
    <div class="message-content">${escapeHtml(content)}</div>
  `;
  messagesArea.appendChild(div);
  scrollToBottom();
}

function showTyping() {
  typingIndicator.classList.add('active');
  scrollToBottom();
}

function hideTyping() {
  typingIndicator.classList.remove('active');
}

function scrollToBottom() {
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Check auth
async function init() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) {
      window.location.href = 'login.html';
    }
  } catch {
    window.location.href = 'login.html';
  }
}

init();
