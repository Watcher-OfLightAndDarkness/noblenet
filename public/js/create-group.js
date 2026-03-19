let currentUser = null;

async function init() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) {
      location.href = 'login.html';
      return;
    }

    const data = await res.json();
    currentUser = data.user;

    // Check if Count+
    const allowedRanks = ['Count', 'Marquess', 'Duke', 'King', 'Emperor'];
    if (!allowedRanks.includes(currentUser.rank)) {
      alert('Only Counts and above may establish fiefs!');
      location.href = '/';
      return;
    }

    setupForm();
  } catch (err) {
    location.href = 'login.html';
  }
}

function setupForm() {
  // Character counters
  document.getElementById('name').addEventListener('input', (e) => {
    document.getElementById('nameCount').textContent = e.target.value.length;
  });

  document.getElementById('description').addEventListener('input', (e) => {
    document.getElementById('descCount').textContent = e.target.value.length;
  });
}

document.getElementById('groupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const errorDiv = document.getElementById('errorMsg');
  const successDiv = document.getElementById('successMsg');
  const submitBtn = document.getElementById('submitBtn');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Establishing...</span>';

  const name = document.getElementById('name').value.trim();
  const description = document.getElementById('description').value.trim() || null;
  const visibility = document.querySelector('input[name="visibility"]:checked').value;

  if (name.length < 3) {
    errorDiv.textContent = 'Fief name must be at least 3 characters';
    errorDiv.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-icon">⚔️</span><span>Establish Fief</span>';
    return;
  }

  try {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, description, visibility })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to establish fief');
    }

    successDiv.textContent = 'Fief established! Redirecting...';
    successDiv.style.display = 'block';
    submitBtn.innerHTML = '<span class="btn-icon">✓</span><span>Established!</span>';

    setTimeout(() => {
      location.href = `group.html?id=${data.group.id}`;
    }, 1500);

  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-icon">⚔️</span><span>Establish Fief</span>';
  }
});

init();
