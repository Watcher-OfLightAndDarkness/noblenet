let currentUser = null;
let currentPost = null;

async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (!postId) {
    document.getElementById('mainContent').innerHTML = '<div class="error">No decree specified</div>';
    return;
  }

  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
    }
  } catch (err) {
    // Guest viewing is fine
  }

  loadPost(postId);
}

async function loadPost(postId) {
  try {
    const res = await fetch(`/api/posts/${postId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Decree not found');

    const data = await res.json();
    currentPost = data.post;
    renderPost(data.post);
  } catch (err) {
    document.getElementById('mainContent').innerHTML = `<div class="error">${err.message}</div>`;
  }
}

function renderPost(post) {
  const container = document.getElementById('mainContent');

  let mediaUrls = post.mediaUrls;
  if (typeof mediaUrls === 'string') {
    try {
      mediaUrls = JSON.parse(mediaUrls);
    } catch (e) {
      mediaUrls = [];
    }
  }
  if (!Array.isArray(mediaUrls)) {
    mediaUrls = [];
  }

  const mediaHtml = mediaUrls.length ? `
    <div class="post-media">
      ${mediaUrls.map(url => `<img src="${url}" onclick="window.open('${url}', '_blank')" loading="lazy">`).join('')}
    </div>
  ` : '';

  const pinnedBadge = post.isPinned ? `<span class="pinned-badge">📌 PINNED</span>` : '';

  const authorAvatar = post.author?.profileImageUrl || '/default-avatar.png';

  container.innerHTML = `
    <article class="post-full">
      <div class="post-header">
        <div class="author-section">
          <img src="${authorAvatar}" alt="${post.author.username}" class="post-author-avatar" onerror="this.src='/default-avatar.png'">
          <div class="author-info">
            <span class="post-author" onclick="location.href='profile.html?user=${post.author.username}'">
              ${post.author.username}
            </span>
            <span class="rank-badge rank-${post.author.rank}">${post.author.rank}</span>
          </div>
        </div>
        <div class="post-meta">
          <span class="post-group">[${post.group?.name || 'global'}]</span>
          <span class="time-separator">•</span>
          <span class="post-time">${formatTime(post.createdAt)}</span>
          ${pinnedBadge}
        </div>
      </div>

      <h1 class="post-title">${post.title}</h1>

      <div class="post-content">${escapeHtml(post.content)}</div>

      ${mediaHtml}

      <div class="post-footer">
        <span class="vote-btn ${post.userVote === 'up' ? 'upvoted' : ''}" onclick="vote('up')">
          ▲ ${post.upvotes}
        </span>
        <span class="vote-btn ${post.userVote === 'down' ? 'downvoted' : ''}" onclick="vote('down')">
          ▼ ${post.downvotes}
        </span>
        <span class="comments-count">💬 ${post.comments?.length || 0} replies</span>
      </div>
    </article>

    <section class="comments-section">
      <h2 class="comments-header">💬 Royal Discussion</h2>

      ${currentUser ? `
        <form class="comment-form" onsubmit="submitComment(event)">
          <textarea class="comment-input" id="commentContent" placeholder="Share your thoughts on this decree..." required></textarea>
          <button type="submit" class="comment-submit">Post Reply</button>
        </form>
      ` : '<p class="guest-notice">Enter the realm to join the discussion</p>'}

      <div id="commentsList">
        ${renderComments(post.comments || [])}
      </div>
    </section>
  `;
}

function renderComments(comments, depth = 0) {
  if (!comments.length) return '<p class="no-comments">No replies yet. Be the first to speak!</p>';

  return comments.map(comment => {
    if (comment.isDeleted) {
      return `
        <div class="comment deleted" style="margin-left: ${depth * 1.5}rem;">
          <p class="deleted-comment">[This message has been stricken from the records]</p>
        </div>
      `;
    }

    const commentAvatar = comment.author?.profileImageUrl || '/default-avatar.png';
    const repliesHtml = comment.replies?.length ?
      `<div class="replies">${renderComments(comment.replies, depth + 1)}</div>` : '';

    return `
      <div class="comment" style="margin-left: ${depth * 1.5}rem;" id="comment-${comment.id}">
        <div class="comment-header">
          <img src="${commentAvatar}" alt="${comment.author.username}" class="comment-avatar" onerror="this.src='/default-avatar.png'">
          <div class="comment-author-info">
            <span class="comment-author">${comment.author.username}</span>
            <span class="rank-badge rank-${comment.author.rank}">${comment.author.rank}</span>
            <span class="comment-time">• ${formatTime(comment.createdAt)}</span>
          </div>
        </div>
        <div class="comment-content">${escapeHtml(comment.content)}</div>
        <div class="comment-footer">
          <span class="vote-btn ${comment.userVote === 'up' ? 'upvoted' : ''}" onclick="voteComment('${comment.id}', 'up')">
            ▲ ${comment.upvotes}
          </span>
          <span class="vote-btn ${comment.userVote === 'down' ? 'downvoted' : ''}" onclick="voteComment('${comment.id}', 'down')">
            ▼ ${comment.downvotes}
          </span>
          ${currentUser ? `<span class="reply-btn" onclick="replyTo('${comment.id}')">Reply</span>` : ''}
        </div>
        ${repliesHtml}
      </div>
    `;
  }).join('');
}

async function submitComment(e) {
  e.preventDefault();
  const content = document.getElementById('commentContent').value;
  const btn = e.target.querySelector('button');

  btn.disabled = true;
  btn.textContent = 'Posting...';

  try {
    const res = await fetch(`/api/posts/${currentPost.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content, parentCommentId: null })
    });

    if (!res.ok) throw new Error('Failed to post reply');

    document.getElementById('commentContent').value = '';
    loadPost(currentPost.id);
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.textContent = 'Post Reply';
  }
}

async function vote(type) {
  if (!currentUser) {
    location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        targetId: currentPost.id,
        targetType: 'post',
        voteType: type
      })
    });

    if (res.ok) loadPost(currentPost.id);
  } catch (err) {
    console.error('Vote failed:', err);
  }
}

async function voteComment(commentId, type) {
  if (!currentUser) {
    location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        targetId: commentId,
        targetType: 'comment',
        voteType: type
      })
    });

    if (res.ok) loadPost(currentPost.id);
  } catch (err) {
    console.error('Vote failed:', err);
  }
}

function replyTo(commentId) {
  const content = prompt('Your reply:');
  if (!content) return;

  fetch(`/api/posts/${currentPost.id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content, parentCommentId: commentId })
  }).then(() => loadPost(currentPost.id));
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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

init();
