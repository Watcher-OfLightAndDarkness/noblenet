let currentUser = null;
let selectedVictim = null;
let searchTimeout = null;
let lastCheck = Date.now();

async function init() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) throw new Error('Not authenticated');

    const data = await res.json();
    currentUser = data.user;

    // Only Emperor+ allowed
    const isCreator = currentUser.isCreator === 1 || currentUser.isCreator === true || currentUser.isCreator === '1';
    if (currentUser.rank !== 'Emperor' && !isCreator) {
      alert('Only the highest nobility may enter the Hall of Judgment');
      location.href = '/';
      return;
    }

    setupSearch();
    setupWebSocket();
    setupPolling();
  } catch (err) {
    location.href = 'login.html';
  }
}

function setupSearch() {
  const input = document.getElementById('searchInput');

  input.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length < 2) {
      document.getElementById('usersGrid').innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <div class="loading-text">Type to search...</div>
        </div>
      `;
      return;
    }

    searchTimeout = setTimeout(() => searchUsers(query), 300);
  });
}

async function searchUsers(query) {
  try {
    const res = await fetch(`/api/executions/search-users?q=${encodeURIComponent(query)}`, {
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Search failed');

    const data = await res.json();
    renderUsers(data.users);
  } catch (err) {
    console.error('Search error:', err);
    document.getElementById('usersGrid').innerHTML = `
      <div class="error-state">Failed to search nobles</div>
    `;
  }
}

function renderUsers(users) {
  const grid = document.getElementById('usersGrid');

  if (users.length === 0) {
    grid.innerHTML = '<div class="no-results">No nobles found in the realm</div>';
    return;
  }

  grid.innerHTML = users.map(user => `
    <div class="user-card ${user.isExecuted ? 'executed' : ''}"
         data-user='${JSON.stringify(user).replace(/'/g, "&apos;")}'
         onclick="openExecutionModal('${user.id}')"
         onmouseenter="showTooltip(event, '${user.id}')"
         onmouseleave="hideTooltip()">

      <img src="${user.profileImageUrl || '/default-avatar.png'}"
           alt="${user.username}"
           class="user-avatar"
           onerror="this.src='/default-avatar.png'">

      <div class="user-info">
        <div class="user-rank rank-${user.rank}">${user.rank}</div>
        <div class="user-name">${user.username}</div>
        <div class="user-karma ${user.karma < 50 ? 'low' : ''}"
             onclick="event.stopPropagation(); showKarmaModal('${user.id}')">
          ${user.karma}% karma
        </div>
      </div>

      ${user.isExecuted ? '<div class="executed-badge">† EXECUTED</div>' : ''}
    </div>
  `).join('');
}

function showTooltip(event, userId) {
  const card = event.currentTarget;
  const user = JSON.parse(card.dataset.user);
  const tooltip = document.getElementById('userTooltip');

  document.getElementById('tooltipAvatar').src = user.profileImageUrl || '/default-avatar.png';
  document.getElementById('tooltipName').textContent = user.username;
  document.getElementById('tooltipRank').textContent = user.rank;
  document.getElementById('tooltipRank').className = `tooltip-rank rank-${user.rank}`;
  document.getElementById('tooltipKarma').textContent = user.karma + '%';
  document.getElementById('tooltipKarma').className = `stat-value ${user.karma < 50 ? 'low' : ''}`;
  document.getElementById('tooltipPoints').textContent = user.totalPoints.toLocaleString();

  const rect = card.getBoundingClientRect();
  let left = rect.right + 10;
  let top = rect.top;

  // Keep tooltip on screen
  if (left + 220 > window.innerWidth) {
    left = rect.left - 230;
  }
  if (top + 150 > window.innerHeight) {
    top = window.innerHeight - 160;
  }

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  tooltip.classList.remove('hidden');
}

function hideTooltip() {
  document.getElementById('userTooltip').classList.add('hidden');
}

function showKarmaModal(userId) {
  const card = document.querySelector(`[data-user*='"id":"${userId}"']`);
  const user = JSON.parse(card.dataset.user);

  alert(`${user.username}'s Karma: ${user.karma}%\n\nBased on community upvotes and downvotes received.`);
}

function openExecutionModal(userId) {
  const card = document.querySelector(`[data-user*='"id":"${userId}"']`);
  const user = JSON.parse(card.dataset.user);

  if (user.isExecuted) {
    alert('This noble has already been executed');
    return;
  }

  const isCreator = currentUser.isCreator === 1 || currentUser.isCreator === true || currentUser.isCreator === '1';

  if (!isCreator) {
    const rankHierarchy = ['Citizen', 'Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor'];
    const victimIndex = rankHierarchy.indexOf(user.rank);
    const executorIndex = rankHierarchy.indexOf(currentUser.rank);

    if (victimIndex >= executorIndex) {
      alert('You cannot execute someone of equal or higher rank');
      return;
    }
  }

  selectedVictim = user;

  document.getElementById('victimPreview').innerHTML = `
    <img src="${user.profileImageUrl || '/default-avatar.png'}"
         class="preview-avatar"
         onerror="this.src='/default-avatar.png'">
    <div class="preview-info">
      <div class="preview-rank rank-${user.rank}">${user.rank}</div>
      <div class="preview-name">${user.username}</div>
    </div>
  `;

  document.getElementById('executionModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('executionModal').classList.add('hidden');
  document.body.style.overflow = '';
  selectedVictim = null;
  document.getElementById('executionReason').value = '';
  document.getElementById('reasonCount').textContent = '0';
}

async function confirmExecution() {
  if (!selectedVictim) return;

  const reason = document.getElementById('executionReason').value.trim();
  if (!reason) {
    alert('You must state the crimes');
    return;
  }

  const btn = document.querySelector('.btn-danger');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span><span>Executing...</span>';

  try {
    const res = await fetch('/api/executions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: selectedVictim.id,
        reason: reason,
        isPermanent: document.getElementById('isPermanent').checked
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Execution failed');

    closeModal();

    // Refresh search
    const query = document.getElementById('searchInput').value;
    if (query) searchUsers(query);

  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.innerHTML = '<span>⚔️</span><span>EXECUTE</span>';
  }
}

function setupWebSocket() {
  const ws = new WebSocket(`wss://${location.host}/ws/execution`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'CREATOR_EXECUTION') {
      showBroadcast(data.payload);
    }
  };

  ws.onerror = (err) => {
    console.error('WebSocket error:', err);
  };
}

function setupPolling() {
  setInterval(async () => {
    try {
      const res = await fetch(`/api/executions/recent?since=${lastCheck}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.executions?.length > 0) {
          data.executions.forEach(ex => {
            showBroadcast({
              victim: {
                username: ex.victim.username,
                rank: ex.victim.rank,
                profileImageUrl: ex.victim.profileImageUrl || '/default-avatar.png'
              },
              reason: ex.reason
            });
          });
        }
      }
      lastCheck = Date.now();
    } catch (e) {
      console.error('Poll error:', e);
    }
  }, 5000);
}

function showBroadcast(payload) {
  const modal = document.getElementById('broadcastModal');
  const sound = document.getElementById('executionSound');

  document.getElementById('broadcastAvatar').src = payload.victim.profileImageUrl || '/default-avatar.png';
  document.getElementById('broadcastRank').textContent = payload.victim.rank;
  document.getElementById('broadcastRank').className = `victim-rank rank-${payload.victim.rank}`;
  document.getElementById('broadcastName').textContent = payload.victim.username;
  document.getElementById('broadcastReason').textContent = `"${payload.reason}"`;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  sound.currentTime = 0;
  sound.play().catch(e => console.log('Sound autoplay blocked'));
}

function dismissBroadcast() {
  document.getElementById('broadcastModal').classList.add('hidden');
  document.body.style.overflow = '';
}

// Character counter
document.getElementById('executionReason')?.addEventListener('input', (e) => {
  document.getElementById('reasonCount').textContent = e.target.value.length;
});

// Close modal on outside click
document.getElementById('executionModal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

init();
