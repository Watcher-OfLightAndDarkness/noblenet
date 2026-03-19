let currentUser = null;
let selectedFiles = [];
const rankLimits = {
  'Citizen': 500,
  'Baron': 1000,
  'Viscount': 2000,
  'Count': 5000,
  'Marquess': 10000,
  'Duke': 20000,
  'King': 50000,
  'Emperor': Infinity
};

const pinCosts = {
  'Baron': 100,
  'Viscount': 200,
  'Count': 300,
  'Marquess': 400,
  'Duke': 500,
  'King': 1000,
  'Emperor': 0
};

async function init() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) {
      location.href = 'login.html';
      return;
    }

    const data = await res.json();
    currentUser = data.user;

    const canPost = ['Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor'].includes(currentUser.rank);
    if (!canPost) {
      alert('Only Barons and above may issue decrees!');
      location.href = '/';
      return;
    }

    setupForm();
    loadGroups();
  } catch (err) {
    location.href = 'login.html';
  }
}

function setupForm() {
  const rank = currentUser.rank;
  const maxChars = rankLimits[rank] || 500;

  document.getElementById('maxContent').textContent = maxChars === Infinity ? '∞' : maxChars;
  document.getElementById('content').maxLength = maxChars === Infinity ? 50000 : maxChars;

  document.getElementById('rankInfo').innerHTML = `
    <div class="info-header">
      <span class="info-icon">👑</span>
      <span>${rank} Privileges</span>
    </div>
    <ul>
      <li>Character limit: <strong>${maxChars === Infinity ? 'Unlimited' : maxChars + ' characters'}</strong></li>
      <li>Media: <strong>${rank === 'Citizen' || rank === 'Baron' ? 'Text only' : 'Images allowed'}</strong></li>
    </ul>
  `;

  if (['Viscount', 'Count', 'Marquess', 'Duke', 'King', 'Emperor'].includes(rank)) {
    document.getElementById('mediaUpload').classList.remove('hidden');
  }

  if (pinCosts[rank] !== undefined) {
    const pinOption = document.getElementById('pinOption');
    pinOption.classList.remove('hidden');
    document.getElementById('pinCost').textContent = pinCosts[rank] || '0';
  }

  document.getElementById('title').addEventListener('input', (e) => {
    document.getElementById('titleCount').textContent = e.target.value.length;
  });

  document.getElementById('content').addEventListener('input', (e) => {
    document.getElementById('contentCount').textContent = e.target.value.length;
  });

  document.getElementById('fileInput').addEventListener('change', (e) => {
    selectedFiles = Array.from(e.target.files);
    document.getElementById('fileList').innerHTML = selectedFiles.map(f => `📷 ${f.name}`).join('<br>');
  });
}

async function loadGroups() {
  try {
    const res = await fetch('/api/my-groups', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      const groups = data.groups;

      const select = document.getElementById('group');
      select.innerHTML = `
        <option value="">Choose where to post...</option>
        <option value="global">🏰 Global Square (All realms)</option>
      `;

      groups.forEach(g => {
        const option = document.createElement('option');
        option.value = g.id;
        option.textContent = `🏰 ${g.name}`;
        select.appendChild(option);
      });
    }
  } catch (err) {
    console.error('Failed to load groups:', err);
  }
}

document.getElementById('postForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const errorDiv = document.getElementById('errorMsg');
  const successDiv = document.getElementById('successMsg');
  const submitBtn = document.getElementById('submitBtn');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Publishing...</span>';

  try {
    const formData = new FormData();
    formData.append('groupId', document.getElementById('group').value);
    formData.append('title', document.getElementById('title').value);
    formData.append('content', document.getElementById('content').value);
    formData.append('isPinned', document.getElementById('pinPost').checked);

    selectedFiles.forEach(file => {
      formData.append('media', file);
    });

    const res = await fetch('/api/posts', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to publish decree');
    }

    successDiv.textContent = 'Decree published! Redirecting...';
    successDiv.style.display = 'block';
    submitBtn.innerHTML = '<span class="btn-icon">✓</span><span>Published!</span>';

    setTimeout(() => {
      location.href = `post.html?id=${data.post.id}`;
    }, 1500);
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-icon">📜</span><span>Publish Decree</span>';
  }
});

init();
