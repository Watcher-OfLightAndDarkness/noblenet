let currentUser = null;
let selectedUser = null;
let searchTimeout = null;

async function init() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) throw new Error('Not authenticated');

    const data = await res.json();
    currentUser = data.user;

    // Check permissions - only Creator or Emperor
    const isCreator = currentUser.isCreator === 1 || currentUser.isCreator === true;
    const isEmperor = currentUser.rank === 'Emperor';

    if (!isCreator && !isEmperor) {
      alert('Only the Emperor or Creator may enter the Throne Room');
      location.href = '/';
      return;
    }

    // If Emperor, hide Creator-only options
    if (!isCreator) {
      document.getElementById('rankOption').style.display = 'none';
      document.getElementById('emperorOption').style.display = 'none';
    }

    setupSearch();
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
      document.getElementById('usersList').innerHTML = '';
      return;
    }

    searchTimeout = setTimeout(() => searchUsers(query), 300);
  });
}

async function searchUsers(query) {
  try {
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Search failed');

    const data = await res.json();
    renderUsers(data.users);
  } catch (err) {
    console.error('Search error:', err);
  }
}

function renderUsers(users) {
  const list = document.getElementById('usersList');

  if (users.length === 0) {
    list.innerHTML = '<div class="no-results">No nobles found</div>';
    return;
  }

  list.innerHTML = users.map(user => `
    <div class="user-item" onclick="selectUser('${user.id}')">
      <img src="${user.profileImageUrl || '/default-avatar.png'}" alt="${user.username}" class="user-avatar-small" onerror="this.src='/default-avatar.png'">
      <div class="user-item-info">
        <div class="user-item-rank rank-${user.rank}">${user.rank}</div>
        <div class="user-item-name">${user.username}</div>
      </div>
      <div class="user-item-points">${(user.totalPoints ?? 0).toLocaleString()} pts</div>
    </div>
  `).join('');
}

async function selectUser(userId) {
  try {
    const res = await fetch(`/api/users/${userId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch user');

    const data = await res.json();
    selectedUser = data.user;

    // Don't allow modifying yourself
    if (selectedUser.id === currentUser.id) {
      alert('You cannot bless yourself!');
      return;
    }

    // Don't allow modifying Creator (if you're Emperor)
    if (selectedUser.isCreator && !currentUser.isCreator) {
      alert('You cannot modify the Creator!');
      return;
    }

    // Show action panel
    const panel = document.getElementById('actionPanel');
    panel.classList.remove('hidden');
    panel.classList.add('animate-in');

    // Fill user info
    document.getElementById('selectedAvatar').src = selectedUser.profileImageUrl || '/default-avatar.png';
    document.getElementById('selectedRank').textContent = selectedUser.rank;
    document.getElementById('selectedRank').className = `selected-rank rank-${selectedUser.rank}`;
    document.getElementById('selectedName').textContent = selectedUser.username;
    document.getElementById('currentPoints').textContent = (selectedUser.totalPoints ?? 0).toLocaleString();
    document.getElementById('emperorTarget').textContent = selectedUser.username;
    document.getElementById('rankTarget').textContent = selectedUser.username;

    // Reset form
    document.getElementById('blessingType').value = '';
    document.getElementById('pointsGroup').classList.add('hidden');
    document.getElementById('rankGroup').classList.add('hidden');
    document.getElementById('emperorGroup').classList.add('hidden');
    document.getElementById('bestowBtn').disabled = true;
    document.getElementById('pointsAmount').value = '';
    document.getElementById('rankSelect').value = '';

    // Scroll to action panel on mobile
    if (window.innerWidth <= 768) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  } catch (err) {
    console.error('Error selecting user:', err);
  }
}

function onBlessingTypeChange() {
  const type = document.getElementById('blessingType').value;
  const pointsGroup = document.getElementById('pointsGroup');
  const rankGroup = document.getElementById('rankGroup');
  const emperorGroup = document.getElementById('emperorGroup');
  const btn = document.getElementById('bestowBtn');

  // Hide all first
  pointsGroup.classList.add('hidden');
  rankGroup.classList.add('hidden');
  emperorGroup.classList.add('hidden');
  btn.disabled = true;

  if (type === 'points') {
    pointsGroup.classList.remove('hidden');
    btn.innerHTML = '<span class="btn-icon">💰</span><span>Grant Points</span>';
  } else if (type === 'rank') {
    rankGroup.classList.remove('hidden');
    btn.innerHTML = '<span class="btn-icon">⚔️</span><span>Set Rank</span>';
    validateRank();
  } else if (type === 'emperor') {
    emperorGroup.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">👑</span><span>Crown as Emperor</span>';
  }
}

function setPoints(amount) {
  document.getElementById('pointsAmount').value = amount;
  validatePoints();
}

function validatePoints() {
  const amount = parseInt(document.getElementById('pointsAmount').value);
  const btn = document.getElementById('bestowBtn');
  btn.disabled = !(amount > 0);
}

function validateRank() {
  const rank = document.getElementById('rankSelect').value;
  const btn = document.getElementById('bestowBtn');
  btn.disabled = !rank;
}

// Event listeners
document.getElementById('pointsAmount')?.addEventListener('input', validatePoints);
document.getElementById('rankSelect')?.addEventListener('change', validateRank);

async function bestowBlessing() {
  const type = document.getElementById('blessingType').value;
  const btn = document.getElementById('bestowBtn');

  if (!type || !selectedUser) return;

  btn.disabled = true;
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">⏳</span><span>Bestowing...</span>';

  try {
    let res, data;

    if (type === 'points') {
      const amount = parseInt(document.getElementById('pointsAmount').value);
      if (!amount || amount <= 0) throw new Error('Please enter a valid amount');

      res = await fetch('/api/admin/grant-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: selectedUser.id, amount })
      });

    } else if (type === 'rank') {
      const rank = document.getElementById('rankSelect').value;
      if (!rank) throw new Error('Please select a rank');
      if (!confirm(`Are you sure you want to set ${selectedUser.username}'s rank to ${rank}?`)) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        return;
      }

      res = await fetch('/api/admin/set-rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: selectedUser.id, rank })
      });

    } else if (type === 'emperor') {
      if (!confirm(`Are you sure you want to crown ${selectedUser.username} as Emperor?`)) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        return;
      }

      res = await fetch('/api/admin/make-emperor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: selectedUser.id })
      });
    }

    data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to bestow blessing');

    showSuccess(data.message);
    selectUser(selectedUser.id);

    // Refresh search
    const query = document.getElementById('searchInput').value;
    if (query) searchUsers(query);

  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

function showSuccess(message) {
  document.getElementById('successMessage').textContent = message;
  const modal = document.getElementById('successModal');
  modal.classList.remove('hidden');

  // Auto-close after 3 seconds
  setTimeout(() => {
    closeSuccessModal();
  }, 3000);
}

function closeSuccessModal() {
  document.getElementById('successModal').classList.add('hidden');
}

init();
