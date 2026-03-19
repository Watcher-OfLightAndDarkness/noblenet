let currentUser = null;
let userGroups = [];
const rankHierarchy = ['Citizen', 'Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor'];

function canPost(rank) {
  return rankHierarchy.indexOf(rank) >= rankHierarchy.indexOf('Baron');
}

function canCreateGroup(rank) {
  return rankHierarchy.indexOf(rank) >= rankHierarchy.indexOf('Count');
}

async function checkAuth() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });

    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;

      showUserNav(data.user);
      updateActionBar(data.user);
      loadUserGroups();
    } else {
      showGuestNav();
    }
  } catch (err) {
    showGuestNav();
  }
  loadPosts();
}

function showUserNav(user) {
  // Desktop
  document.getElementById('guestNav').classList.add('hidden');
  document.getElementById('userNavDesktop').classList.remove('hidden');

  // Mobile
  document.getElementById('guestNavMobile').classList.add('hidden');
  document.getElementById('userNavMobile').classList.remove('hidden');

  // Desktop elements
  document.getElementById('navUsername').textContent = user.username;
  const rankBadge = document.getElementById('navRank');
  rankBadge.textContent = user.rank;
  rankBadge.className = 'nav-rank rank-' + user.rank;

  // Mobile elements
  document.getElementById('mobileUsername').textContent = user.username;
  const mobileRank = document.getElementById('mobileRank');
  mobileRank.textContent = user.rank;
  mobileRank.className = 'mobile-rank rank-' + user.rank;

  // Avatars
  const avatarUrl = user.profileImageUrl || '/default-avatar.png';
  document.getElementById('navAvatar').src = avatarUrl;
  document.getElementById('mobileAvatar').src = avatarUrl;

  // Judgment links
  const isCreator = user.isCreator === 1 || user.isCreator === true || user.isCreator === '1';
  const canAccess = user.rank === 'Emperor' || isCreator;

  if (canAccess) {
    document.getElementById('judgmentLinkDesktop').style.display = 'inline-block';
    document.getElementById('judgmentLinkMobile').style.display = 'flex';
  }
}

function showGuestNav() {
  document.getElementById('guestNav').classList.remove('hidden');
  document.getElementById('userNavDesktop').classList.add('hidden');
  document.getElementById('guestNavMobile').classList.remove('hidden');
  document.getElementById('userNavMobile').classList.add('hidden');
}

function updateActionBar(user) {
  const postBox = document.getElementById('createPostBox');
  const postText = document.getElementById('createPostText');
  const groupBtn = document.getElementById('createGroupBtn');

  if (canPost(user.rank)) {
    postBox.classList.remove('disabled');
    postText.textContent = 'What is your decree, my liege?';
    postBox.onclick = () => location.href = 'write-post.html';
  } else {
    postBox.classList.add('disabled');
    postText.textContent = 'Rise to Baron to make decrees...';
    postBox.onclick = () => alert('Only Barons and above may issue decrees!');
  }

  if (canCreateGroup(user.rank)) {
    groupBtn.classList.remove('hidden');
  } else {
    groupBtn.classList.add('hidden');
  }
}

async function loadUserGroups() {
  try {
    const res = await fetch('/api/my-groups', { credentials: 'include' });

    // Get both menu elements
    const desktopMenu = document.getElementById('groupsMenu');
    const mobileList = document.getElementById('mobileGroupsList');

    if (res.ok) {
      const data = await res.json();
      userGroups = data.groups || [];

      // Update counts
      const countEl = document.getElementById('groupCount');
      const mobileCountEl = document.getElementById('mobileGroupCount');
      if (countEl) countEl.textContent = userGroups.length;
      if (mobileCountEl) mobileCountEl.textContent = userGroups.length;

      // Build HTML for groups
      let groupsHtml;
      if (userGroups.length === 0) {
        groupsHtml = '<div style="padding: 1rem; color: #888; text-align: center;">No fiefs joined</div>';
      } else {
        groupsHtml = userGroups.map(group => `
          <a href="group.html?id=${group.id}" class="group-menu-item" onclick="event.stopPropagation()">
            <span class="group-icon">🏰</span>
            <span class="group-name">${group.name}</span>
            ${group.role === 'heir_designate' ? '<span class="group-badge">👑</span>' : ''}
          </a>
        `).join('');
      }

      // Update desktop menu
      if (desktopMenu) desktopMenu.innerHTML = groupsHtml;

    } else {
      // Error state
      const errorMsg = '<div style="padding: 1rem; color: #c00; text-align: center;">Failed to summon fiefs</div>';
      if (desktopMenu) desktopMenu.innerHTML = errorMsg;
      console.error('Failed to load groups:', res.status);
    }
  } catch (err) {
    console.error('Failed to load groups:', err);
    const desktopMenu = document.getElementById('groupsMenu');
    const errorMsg = '<div style="padding: 1rem; color: #c00; text-align: center;">Failed to summon fiefs</div>';
    if (desktopMenu) desktopMenu.innerHTML = errorMsg;
  }
}

function toggleGroups() {
  const menu = document.getElementById('groupsMenu');
  menu.classList.toggle('active');
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.getElementById('hamburgerBtn');

  menu.classList.toggle('active');

  // Animate hamburger
  const spans = btn.querySelectorAll('span');
  if (menu.classList.contains('active')) {
    spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '1';
    spans[2].style.transform = '';
  }
}

function showMobileGroups() {
  const list = document.getElementById('mobileGroupsList');

  if (list.classList.contains('active')) {
    list.classList.remove('active');
    return;
  }

  if (userGroups.length === 0) {
    list.innerHTML = '<div style="padding: 1rem; color: #888;">No fiefs joined</div>';
  } else {
    list.innerHTML = userGroups.map(group => `
      <a href="group.html?id=${group.id}" class="mobile-group-item" onclick="toggleMobileMenu()">
        🏰 ${group.name}
      </a>
    `).join('');
  }

  list.classList.add('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('groupsDropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    const menu = document.getElementById('groupsMenu');
    if (menu) menu.classList.remove('active');
  }
});

function handleCreateClick() {
  if (!currentUser) {
    location.href = 'login.html';
  } else if (canPost(currentUser.rank)) {
    location.href = 'write-post.html';
  } else {
    alert('Only Barons and above may issue decrees!');
  }
}

async function loadPosts() {
  try {
    const res = await fetch('/api/posts', { credentials: 'include' });
    const data = await res.json();
    const posts = data.posts || [];
    renderPosts(posts);
  } catch {
    renderPosts([]);
  }
}

function renderPosts(posts) {
  const feed = document.getElementById('postsFeed');

  if (!posts.length) {
    feed.innerHTML = '<div class="loading"><div class="loading-spinner"></div><div class="loading-text">No scrolls found in the kingdom...</div></div>';
    return;
  }

  feed.innerHTML = posts.map(post => {
    const groupName = post.group?.name || 'global';
    const groupId = post.group?.id;
    const authorName = post.author?.username || 'Unknown';
    const authorRank = post.author?.rank || 'Citizen';
    // Get author profile image
    const authorAvatar = post.author?.profileImageUrl || '/default-avatar.png';

    const groupLink = groupId
      ? `<a href="group.html?id=${groupId}" class="post-group" onclick="event.stopPropagation()">[${groupName}]</a>`
      : `<span class="post-group">[${groupName}]</span>`;

    return `
      <article class="post-card" onclick="location.href='post.html?id=${post.id}'">
        <div class="post-header">
          ${groupLink}
          <span>•</span>
          <!-- AUTHOR SECTION WITH AVATAR -->
          <img src="${authorAvatar}" alt="${authorName}" class="post-author-avatar" onerror="this.src='/default-avatar.png'">
          <span class="post-author">${authorName}</span>
          <span class="post-rank rank-${authorRank}">${authorRank}</span>
          <span>•</span>
          <span>${formatTime(post.createdAt)}</span>
        </div>
        <h2 class="post-title">${post.title}</h2>
        <p class="post-excerpt">${post.content?.substring(0, 200) || ''}${post.content?.length > 200 ? '...' : ''}</p>
        <div class="post-footer">
          <span class="vote-btn ${post.userVote === 'up' ? 'upvoted' : ''}" onclick="event.stopPropagation(); vote('${post.id}', 'up')">
            ▲ ${post.upvotes || 0}
          </span>
          <span class="vote-btn ${post.userVote === 'down' ? 'downvoted' : ''}" onclick="event.stopPropagation(); vote('${post.id}', 'down')">
            ▼ ${post.downvotes || 0}
          </span>
          <a href="post.html?id=${post.id}" class="comments-link" onclick="event.stopPropagation()">
            💬 ${post.commentsCount || 0}
          </a>
        </div>
      </article>
    `;
  }).join('');
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

async function vote(postId, type) {
  if (!currentUser) {
    location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ targetId: postId, targetType: 'post', voteType: type })
    });

    if (res.ok) loadPosts();
  } catch (err) {
    console.error('Vote failed:', err);
  }
}

async function logout() {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  location.reload();
}

// Initialize
checkAuth();
