document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            window.location.href = '/html/index.html'; // Redirect to the main dashboard

            // Decode and log the JWT token
            const token = data.token;
            const parts = token.split('.');
            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            const signature = parts[2];

            console.log('Decoded JWT Token:');
            console.log('Header:', header);
            console.log('Payload:', payload);
            console.log('Signature:', signature);
        } else {
            alert('Login failed. Please check your credentials.');
        }
    });
});
