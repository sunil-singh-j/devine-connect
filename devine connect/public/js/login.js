
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
console.log("forom logdfdfdf");
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      // Store token in local storage or session storage
      localStorage.setItem('token', data.token);
      // Redirect to profile page upon successful login
      window.location.href = '/index.html';
    } else {
      const errorData = await response.json();
      alert(errorData.message || 'Failed to log in');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to log in');
  }
});
