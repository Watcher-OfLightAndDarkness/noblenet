const groupId = new URLSearchParams(window.location.search).get('group');
let lastMessageId = null;
let currentUser = null;

async function init() {
  if (!groupId) {
    location.href = '/';
    return;
  }

  // Check auth
  try {
    const meRes = await fetch('/api/me', { credentials: 'include' });
    if (meRes.ok) {
      const meData = await meRes.json();
      currentUser = meData.user;
    }
  } catch (err) {
    console.log('Not authenticated');
  }

  // Load group info
  const res = await fetch(`/api/groups/${groupId}`, { credentials: 'include' });
  if (!res.ok) {
    alert('Failed to load chat');
    location.href = '/';
    return;
  }

  const data = await res.json();
  if (!data.group.isMember) {
    alert('You must be a member to enter this chat');
    location.href = `group.html?id=${groupId}`;
    return;
  }

  document.getElementById('groupName').textContent = `🏰 ${data.group.name}`;

  loadMessages();
  setInterval(loadMessages, 3000); // Poll every 3 seconds

  // Focus input
  document.getElementById('messageInput').focus();
}

async function loadMessages() {
  try {
    const url = `/api/groups/${groupId}/messages` +
      (lastMessageId ? `?after=${lastMessageId}` : '');
    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();

    const container = document.getElementById('messages');

    // Remove loading on first load
    if (lastMessageId === null && data.messages.length === 0) {
      container.innerHTML = '<div class="empty-chat">No ravens have been sent yet. Be the first to speak!</div>';
    } else if (data.messages.length > 0) {
      // Remove loading if present
      const loading = container.querySelector('.loading');
      if (loading) loading.remove();

      data.messages.forEach(msg => {
        const isOwn = currentUser && msg.author.id === currentUser.id;
        const div = document.createElement('div');
        div.className = `message ${isOwn ? 'own' : ''}`;
        div.innerHTML = `
          <img src="${msg.author.profileImageUrl || '/default-avatar.png'}"
               alt="${msg.author.username}"
               class="message-avatar"
               onerror="this.src='/default-avatar.png'">
          <div class="message-content-wrapper">
            <div class="message-header">
              <span class="message-author">${msg.author.username}</span>
              <span class="rank-badge rank-${msg.author.rank}">${msg.author.rank}</span>
              <span class="message-time">${formatTime(msg.createdAt)}</span>
            </div>
            <div class="message-content">${escapeHtml(msg.content)}</div>
          </div>
        `;
        container.appendChild(div);
      });

      lastMessageId = data.messages[data.messages.length - 1].id;
      container.scrollTop = container.scrollHeight;
    }
  } catch (err) {
    console.error('Failed to load messages:', err);
  }
}

async function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('messageInput');
  const content = input.value.trim();
  if (!content) return;

  // Disable input while sending
  input.disabled = true;
  const btn = e.target.querySelector('.send-btn');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span><span>Sending...</span>';

  try {
    const res = await fetch(`/api/groups/${groupId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content })
    });

    if (!res.ok) throw new Error('Failed to send');

    input.value = '';
    loadMessages();
  } catch (err) {
    alert('Failed to send raven');
  } finally {
    input.disabled = false;
    btn.disabled = false;
    btn.innerHTML = '<span>📜</span><span>Send</span>';
    input.focus();
  }
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle Enter key
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('messageInput');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.target.form.dispatchEvent(new Event('submit'));
      }
    });
  }
});

init();
