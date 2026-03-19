// Redirect if already logged in
fetch('/api/me', { credentials: 'include' })
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(() => window.location.href = '/')
  .catch(() => {});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorDiv = document.getElementById('errorMsg');
  const btn = e.target.querySelector('button');

  errorDiv.style.display = 'none';
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-icon">⏳</span><span>Entering...</span>';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    btn.innerHTML = '<span class="btn-icon">✓</span><span>Welcome!</span>';
    setTimeout(() => {
      window.location.href = '/';
    }, 500);

  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🚪</span><span>Pass the Gates</span>';
  }
});
