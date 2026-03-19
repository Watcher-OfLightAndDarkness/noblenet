const RANK_ORDER = ['Citizen', 'Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor'];
const RANK_COSTS = {
  'Citizen': 100,
  'Baron': 250,
  'Viscount': 500,
  'Count': 1000,
  'Marquess': 2000,
  'Duke': 5000,
  'King': 10000
};

let currentUser = null;

async function loadProfile() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) throw new Error('Not authenticated');
    const { user } = await res.json();
    currentUser = user;
    renderProfile(user);
  } catch (err) {
    window.location.href = 'login.html';
  }
}

function renderProfile(user) {
  const isCreator = user.isCreator === 1 || user.isCreator === true;
  const currentIndex = RANK_ORDER.indexOf(user.rank);
  const nextRank = RANK_ORDER[currentIndex + 1];
  const cost = nextRank ? RANK_COSTS[user.rank] : null;
  const canUpgrade = !isCreator && nextRank && nextRank !== 'Emperor' && user.totalPoints >= (cost || 0);

  const totalVotes = user.upvotesReceived + user.downvotesReceived;
  const karma = totalVotes > 0 ? Math.round((user.upvotesReceived / totalVotes) * 100) : 100;

  // Determine stipend button state
  let stipendButtonHtml = '';
  if (user.dailyStipendEligible) {
    if (user.canClaimStipend) {
      stipendButtonHtml = `<button class="stipend-btn" id="stipendBtn" onclick="claimStipend()">Claim Daily Stipend</button>`;
    } else {
      const timeDisplay = user.nextStipendIn || '24h';
      stipendButtonHtml = `<button class="stipend-btn" disabled style="background: #27ae60; color: white;">✓ Claimed (Next in ${timeDisplay})</button>`;
    }
  }

  const avatarUrl = user.profileImageUrl
    ? `<img src="${user.profileImageUrl}" class="avatar" style="border-color: ${getRankColor(user.rank)};" alt="Profile">`
    : `<div class="avatar" style="border-color: ${getRankColor(user.rank)};">👑</div>`;

  // Creator gets rank dropdown instead of progress bar
  let rankSectionHtml = '';
  if (isCreator) {
    rankSectionHtml = `
      <div class="creator-rank-section">
        <label for="creatorRankSelect">👑 Creator's Disguise</label>
        <select id="creatorRankSelect" onchange="changeCreatorRank(this.value)">
          <option value="Citizen" ${user.rank === 'Citizen' ? 'selected' : ''}>Citizen</option>
          <option value="Baron" ${user.rank === 'Baron' ? 'selected' : ''}>Baron</option>
          <option value="Viscount" ${user.rank === 'Viscount' ? 'selected' : ''}>Viscount</option>
          <option value="Count" ${user.rank === 'Count' ? 'selected' : ''}>Count</option>
          <option value="Marquess" ${user.rank === 'Marquess' ? 'selected' : ''}>Marquess</option>
          <option value="Duke" ${user.rank === 'Duke' ? 'selected' : ''}>Duke</option>
          <option value="King" ${user.rank === 'King' ? 'selected' : ''}>King</option>
          <option value="Emperor" ${user.rank === 'Emperor' ? 'selected' : ''}>Emperor</option>
        </select>
        <div class="creator-badge">✨ True Creator Rank</div>
      </div>
    `;
  } else if (nextRank && nextRank !== 'Emperor') {
    rankSectionHtml = `
      <div class="progress-section">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
          <span>Progress to ${nextRank}</span>
          <span>${(user.totalPoints ?? 0).toLocaleString()} / ${cost?.toLocaleString()} pts</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min(100, (user.totalPoints / cost) * 100)}%"></div>
        </div>
      </div>
    `;
  } else {
    rankSectionHtml = '<div class="progress-section">👑 Maximum rank achieved!</div>';
  }

  document.getElementById('content').innerHTML = `
    <div class="profile-card" style="border-color: ${getRankColor(user.rank)};">
      <div class="avatar-container">
        ${avatarUrl}
        <button class="avatar-btn" onclick="openAvatarModal()" title="Change avatar">📷</button>
      </div>
      <h1 class="username">${user.username}</h1>
      <span class="rank-badge rank-${user.rank}">${user.rank}</span>
      ${isCreator ? '<div style="color: var(--primary); font-size: 0.9rem; margin-top: 0.5rem;">👑 Creator of the Realm</div>' : ''}

      ${rankSectionHtml}

      <div class="action-buttons">
        ${canUpgrade ? `<button class="upgrade-btn" onclick="upgradeRank()">Upgrade to ${nextRank} (${cost} pts)</button>` : ''}
        ${stipendButtonHtml}
        <button class="edit-btn" onclick="openEditModal()">Edit Profile</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">${(user.totalPoints ?? 0).toLocaleString()}</div>
        <div class="stat-label">Points</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${(user.upvotesReceived ?? 0).toLocaleString()}</div>
        <div class="stat-label">Upvotes</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${(user.downvotesReceived ?? 0).toLocaleString()}</div>
        <div class="stat-label">Downvotes</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${karma}%</div>
        <div class="stat-label">Karma</div>
      </div>
    </div>
  `;
}

async function changeCreatorRank(newRank) {
  if (!confirm(`Appear as ${newRank}?`)) {
    loadProfile();
    return;
  }

  try {
    const res = await fetch('/api/me/rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rank: newRank })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    alert(`You now appear as ${newRank}`);
    loadProfile();
  } catch (err) {
    alert(err.message);
    loadProfile();
  }
}

async function upgradeRank() {
  if (!confirm('Spend points to upgrade rank?')) return;
  try {
    const res = await fetch('/api/me/upgrade', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    alert(data.message);
    loadProfile();
  } catch (err) {
    alert(err.message);
  }
}

async function claimStipend() {
  const btn = document.getElementById('stipendBtn');
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = 'Claiming...';
  btn.style.background = '#666';

  try {
    const res = await fetch('/api/me/stipend', { method: 'POST', credentials: 'include' });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Failed to claim');
      if (!data.error?.includes('already claimed')) {
        btn.disabled = false;
        btn.textContent = 'Claim Daily Stipend';
        btn.style.background = '';
      } else {
        btn.textContent = `✓ Claimed (Next in ${data.nextClaimIn || '24h'})`;
        btn.style.background = '#27ae60';
        btn.style.color = 'white';
      }
      return;
    }

    btn.textContent = '✓ Claimed!';
    btn.style.background = '#27ae60';
    btn.style.color = 'white';

    alert(`Claimed ${data.amount} points!`);
    setTimeout(() => loadProfile(), 500);

  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Claim Daily Stipend';
    btn.style.background = '';
    alert(err.message);
  }
}

function openEditModal() {
  document.getElementById('editUsername').value = currentUser.username;
  document.getElementById('editEmail').value = currentUser.email;
  document.getElementById('editGender').value = currentUser.gender || '';
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

function openAvatarModal() {
  document.getElementById('avatarModal').classList.add('active');
}

function closeAvatarModal() {
  document.getElementById('avatarModal').classList.remove('active');
  document.getElementById('avatarInput').value = '';
}

async function uploadAvatar() {
  const fileInput = document.getElementById('avatarInput');
  if (!fileInput.files[0]) {
    alert('Select an image first');
    return;
  }

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  try {
    const res = await fetch('/api/profile/image', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    alert('Avatar updated!');
    closeAvatarModal();
    loadProfile();
  } catch (err) {
    alert('Upload failed: ' + err.message);
  }
}

async function saveProfile() {
  const body = {
    username: document.getElementById('editUsername').value,
    email: document.getElementById('editEmail').value,
    gender: document.getElementById('editGender').value || null,
    currentPassword: document.getElementById('currentPassword').value,
    newPassword: document.getElementById('newPassword').value
  };

  try {
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    alert('Profile updated!');
    closeEditModal();
    loadProfile();
  } catch (err) {
    alert(err.message);
  }
}

function getRankColor(rank) {
  const colors = {
    'Citizen': '#808080',
    'Baron': '#cd7f32',
    'Viscount': '#c0c0c0',
    'Count': '#ffd700',
    'Marquess': '#e74c3c',
    'Duke': '#9b59b6',
    'King': '#f39c12',
    'Emperor': '#e94560'
  };
  return colors[rank] || '#808080';
}

// Initialize
loadProfile();
