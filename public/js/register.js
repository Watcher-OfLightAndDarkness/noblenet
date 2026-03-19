document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorDiv = document.getElementById('errorMsg');
  const successDiv = document.getElementById('successMsg');
  const btn = e.target.querySelector('button');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-icon">⏳</span><span>Joining...</span>';

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        gender: document.getElementById('gender').value || null
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    successDiv.textContent = 'Welcome to the realm! Redirecting...';
    successDiv.style.display = 'block';
    btn.innerHTML = '<span class="btn-icon">✓</span><span>Joined!</span>';

    setTimeout(() => {
      window.location.href = '/';
    }, 1500);

  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">⚔️</span><span>Join the Kingdom</span>';
  }
});
