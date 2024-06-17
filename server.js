const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000; 
const SECRET_KEY = 'your_secret_key';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let users = [
    {
        email: 'arnav13203@bodybude.com',
        password: 'password123',
        name: 'Dr. Arnav Aggarwal',
        title: 'MBBS, DNB (General Medicine)',
        phone: '+91-9891656822',
        officePhone: '0124-3252852',
        address: '43 Park Avenue, Chennai, Tamil Nadu, 603203',
        gender: 'Male',
        dob: '13/09/1977',
        experience: '15 Years',
        languages: ['English', 'Hindi'],
        typeOf: 'Cardiologist',
        otherTreatmentAreas: ['General Physician', 'Infectious Diseases Physician', 'Diabetologist']
    }
];

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.post('/api/signup', (req, res) => {
    const { email, password, name, title, phone, gender, dob, experience, typeOf, otherTreatmentAreas } = req.body;

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = {
        email,
        password,
        name,
        title,
        phone,
        officePhone: '0124-3252852',
        address: '43 Park Avenue, Chennai, Tamil Nadu, 603203',
        gender,
        dob,
        experience,
        languages: ['English', 'Hindi'],
        typeOf,
        otherTreatmentAreas: otherTreatmentAreas.split(',').map(area => area.trim())
    };

    users.push(newUser);
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

app.get('/api/account', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        const userDetails = users.find(u => u.email === user.email);
        if (!userDetails) {
            return res.sendStatus(404);
        }

        res.json(userDetails);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
