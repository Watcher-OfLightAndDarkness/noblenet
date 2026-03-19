let currentUser = null;
let currentGroup = null;
let searchTimeout;

async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const groupId = urlParams.get('id');

  if (!groupId) {
    document.getElementById('mainContent').innerHTML = '<div class="error">No fief specified</div>';
    return;
  }

  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
    }
  } catch (err) {
    // Guest viewing allowed for public groups
  }

  loadGroup(groupId);
}

async function loadGroup(groupId) {
  try {
    const res = await fetch(`/api/groups/${groupId}`, { credentials: 'include' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Fief not found');
    }

    const data = await res.json();
    currentGroup = data.group;
    renderGroup(data.group);
  } catch (err) {
    document.getElementById('mainContent').innerHTML = `<div class="error">${err.message}</div>`;
  }
}

function renderGroup(group) {
  const container = document.getElementById('mainContent');

  const isMember = group.isMember || false;
  const isOwner = currentUser && group.owner.id === currentUser.id;
  const visibilityClass = group.visibility === 'private' ? 'visibility-private' : 'visibility-public';
  const visibilityText = group.visibility === 'private' ? '🔒 Private' : '🌐 Public';

  // Owner avatar
  const ownerAvatar = group.owner?.profileImageUrl || '/default-avatar.png';

  let actionButtons = '';

  if (!currentUser) {
    if (group.visibility === 'public') {
      actionButtons = `<a href="login.html" class="btn btn-primary">Enter Realm to Join</a>`;
    } else {
      actionButtons = `<div class="private-notice">🔒 Private fief. Invitation required.</div>`;
    }
  } else if (isOwner) {
    if (group.visibility === 'private') {
      actionButtons = `
        <button class="btn btn-secondary" onclick="openInviteModal()">📨 Invite</button>
        <button class="btn btn-primary" onclick="openChat()">💬 Chat</button>
      `;
    } else {
      actionButtons = `<button class="btn btn-primary" onclick="openChat()">💬 Chat</button>`;
    }
  } else if (isMember) {
    let inviteBtn = group.visibility === 'private' ?
      `<button class="btn btn-secondary" onclick="openInviteModal()">📨 Invite</button>` : '';
    actionButtons = `
      ${inviteBtn}
      <button class="btn btn-danger" onclick="leaveGroup()">🚪 Leave</button>
      <button class="btn btn-primary" onclick="openChat()">💬 Chat</button>
    `;
  } else {
    if (group.visibility === 'public') {
      actionButtons = `<button class="btn btn-primary" onclick="joinGroup()">🏰 Join Fief</button>`;
    } else {
      actionButtons = `<div class="private-notice">🔒 Private fief. Invitation required.</div>`;
    }
  }

  container.innerHTML = `
    <div class="group-header">
      <div class="group-icon">🏰</div>
      <h1 class="group-name">${group.name}</h1>
      <span class="visibility-badge ${visibilityClass}">${visibilityText}</span>

      <div class="owner-section">
        <img src="${ownerAvatar}" alt="${group.owner.username}" class="owner-avatar" onerror="this.src='/default-avatar.png'">
        <div class="owner-info">
          <span class="owner-label">Founded by</span>
          <span class="owner-name" onclick="location.href='profile.html?user=${group.owner.username}'">${group.owner.username}</span>
          <span class="rank-badge rank-${group.owner.rank}">${group.owner.rank}</span>
        </div>
      </div>

      <div class="group-time">• ${formatTime(group.createdAt)}</div>

      ${group.description ? `<p class="group-desc">${group.description}</p>` : ''}

      <div class="group-stats">
        <div class="stat">
          <div class="stat-value">${group.memberCount || 0}</div>
          <div class="stat-label">Members</div>
        </div>
        <div class="stat">
          <div class="stat-value">${group.postsCount || 0}</div>
          <div class="stat-label">Decrees</div>
        </div>
      </div>

      <div class="action-buttons">
        ${actionButtons}
      </div>
    </div>

    <div class="posts-section">
      <h2 class="section-title">📜 Fief Decrees</h2>
      <div id="groupPosts">
        <div class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">Summoning scrolls...</div>
        </div>
      </div>
    </div>
  `;

  if (isMember || group.visibility === 'public') {
    loadGroupPosts(group.id);
  } else {
    document.getElementById('groupPosts').innerHTML = '<div class="empty">Join the fief to see decrees</div>';
  }
}

async function loadGroupPosts(groupId) {
  try {
    const res = await fetch(`/api/groups/${groupId}/posts`, { credentials: 'include' });
    const data = await res.json();
    renderPosts(data.posts || []);
  } catch {
    document.getElementById('groupPosts').innerHTML = '<div class="empty">No decrees issued in this fief yet</div>';
  }
}

function renderPosts(posts) {
  const container = document.getElementById('groupPosts');

  if (!posts || posts.length === 0) {
    container.innerHTML = '<div class="empty">No decrees issued in this fief yet. Be the first to speak!</div>';
    return;
  }

  container.innerHTML = posts.map(post => {
    const authorAvatar = post.author?.profileImageUrl || '/default-avatar.png';

    return `
      <article class="post-card" onclick="location.href='post.html?id=${post.id}'">
        <div class="post-header">
          <img src="${authorAvatar}" alt="${post.author?.username || 'Unknown'}" class="post-author-avatar" onerror="this.src='/default-avatar.png'">
          <div class="post-author-info">
            <span class="post-author">${post.author?.username || 'Unknown'}</span>
            <span class="post-rank rank-${post.author?.rank || 'Citizen'}">${post.author?.rank || 'Citizen'}</span>
          </div>
          <span class="time-separator">•</span>
          <span class="post-time">${formatTime(post.createdAt)}</span>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-excerpt">${post.content?.substring(0, 200) || ''}${post.content?.length > 200 ? '...' : ''}</p>
        <div class="post-footer">
          <span class="vote-btn">▲ ${post.upvotes || 0}</span>
          <span class="vote-btn">▼ ${post.downvotes || 0}</span>
          <span class="comments-link">💬 ${post.commentsCount || 0} replies</span>
        </div>
      </article>
    `;
  }).join('');
}

function openInviteModal() {
  document.getElementById('inviteModal').classList.add('active');
  document.getElementById('inviteSearch').value = '';
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('inviteSearch').focus();
  document.getElementById('inviteSearch').addEventListener('input', handleSearch);
}

function closeInviteModal() {
  document.getElementById('inviteModal').classList.remove('active');
  document.getElementById('inviteSearch').removeEventListener('input', handleSearch);
}

function handleSearch(e) {
  clearTimeout(searchTimeout);
  const query = e.target.value.trim();

  if (query.length < 2) {
    document.getElementById('searchResults').innerHTML = '';
    return;
  }

  searchTimeout = setTimeout(() => searchUsers(query), 300);
}

async function searchUsers(query) {
  try {
    const res = await fetch(`/api/executions/search-users?q=${encodeURIComponent(query)}`, {
      credentials: 'include'
    });
    const data = await res.json();

    if (!data.users || data.users.length === 0) {
      document.getElementById('searchResults').innerHTML = '<div class="no-results">No nobles found</div>';
      return;
    }

    document.getElementById('searchResults').innerHTML = data.users.map(u => `
      <div class="user-result" onclick="inviteUser('${u.id}', '${u.username}')">
        <img src="${u.profileImageUrl || '/default-avatar.png'}" alt="${u.username}" class="user-avatar" onerror="this.src='/default-avatar.png'">
        <span class="user-rank rank-${u.rank}">${u.rank}</span>
        <span class="user-name">${u.username}</span>
      </div>
    `).join('');
  } catch (err) {
    console.error('Search failed:', err);
  }
}

async function inviteUser(userId, username) {
  try {
    const res = await fetch(`/api/groups/${currentGroup.id}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId })
    });

    if (res.ok) {
      alert(`Invitation sent to ${username}!`);
      closeInviteModal();
      loadGroup(currentGroup.id);
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to send invitation');
    }
  } catch (err) {
    alert('Failed to send invitation');
  }
}

async function joinGroup() {
  if (!currentUser) {
    location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`/api/groups/${currentGroup.id}/join`, {
      method: 'POST',
      credentials: 'include'
    });

    if (res.ok) {
      alert('You have joined the fief!');
      loadGroup(currentGroup.id);
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to join fief');
    }
  } catch (err) {
    alert('Failed to join fief');
  }
}

async function leaveGroup() {
  if (!confirm('Are you sure you wish to abandon this fief?')) return;

  try {
    const res = await fetch(`/api/groups/${currentGroup.id}/leave`, {
      method: 'POST',
      credentials: 'include'
    });

    if (res.ok) {
      alert('You have left the fief');
      loadGroup(currentGroup.id);
    }
  } catch (err) {
    alert('Failed to leave fief');
  }
}

function openChat() {
  location.href = `chat.html?group=${currentGroup.id}`;
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

// Close modal on outside click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('inviteModal');
  if (e.target === modal) {
    closeInviteModal();
  }
});

init();
