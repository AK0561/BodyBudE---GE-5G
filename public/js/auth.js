document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/html/login.html'; // Redirect to login if not authenticated
    }
});
fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
})
.then(response => response.json())
.then(data => {
    if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('Token stored successfully:', data.token);
        window.location.href = 'myaccount.html';
    } else {
        console.error('Login failed:', data.message);
    }
})
.catch(error => console.error('Error during login:', error));
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});
