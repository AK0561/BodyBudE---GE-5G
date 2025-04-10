document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Retrieve all form input values
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const name = document.getElementById('name').value;
            const title = document.getElementById('title').value;
            const phone = document.getElementById('phone').value;
            const gender = document.getElementById('gender').value;
            const dob = document.getElementById('dob').value;
            const experience = document.getElementById('experience').value;
            const typeOf = document.getElementById('typeOf').value;
            const otherTreatmentAreas = document.getElementById('otherTreatmentAreas').value;

            // Hardcoded values from hidden inputs
            const officePhone = document.getElementById('officePhone').value;
            const address = document.getElementById('address').value;
            const languages = document.getElementById('languages').value.split(',').map(lang => lang.trim());

            // Validate password confirmation
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            // Prepare data to send in the POST request
            const userData = {
                email, password, name, title, phone, gender, dob, experience, typeOf, otherTreatmentAreas, officePhone, address, languages
            };

            // Send POST request to signup API endpoint
            try {
                const response = await fetch('http://localhost:3000/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    alert('Sign-up successful! Please log in.');
                    window.location.href = '/html/login.html'; // Redirect to login page
                } else {
                    alert('Sign-up failed. Please try again.');
                }
            } catch (error) {
                console.error('Error during sign-up:', error);
                alert('Sign-up failed. Please check your network connection and try again.');
            }
        });
    } else {
        console.error('Signup form element not found.');
    }
});
