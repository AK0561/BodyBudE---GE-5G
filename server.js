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
app.use((req, res, next) => {
    if (req.url.endsWith('.html') && !req.url.startsWith('/html/')) {
        req.url = `/html${req.url}`;
    }
    next();
});


app.use(express.static(path.join(__dirname, 'public')));
let users = [
    {
        email: 'arnav13203@bodybude.com',
        password: 'password123',
        name: 'Arnav Aggarwal',
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
        const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '2h' });
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
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
        }

        const userDetails = users.find(u => u.email === decoded.email);
        
        if (!userDetails) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            name: `Dr. ${userDetails.name}`, // ✅ Add name to response
            phone: userDetails.phone,
            email: userDetails.email,
            speciality: userDetails.typeOf, // ✅ Fix field name
            degrees: userDetails.title, // ✅ Fix field name
            university: "AIIMS, Delhi",
            experience: userDetails.experience, 
            bio: `Dr. ${userDetails.name} is a highly experienced ${userDetails.typeOf} with over ${userDetails.experience} of dedicated medical practice. 
          Specializing in ${userDetails.typeOf}, he has helped countless patients manage and recover from complex health conditions. 
          With expertise in ${userDetails.otherTreatmentAreas.join(", ")}, he provides comprehensive care tailored to each patient’s needs. 
          Passionate about patient well-being, Dr. ${userDetails.name} stays updated with the latest advancements in medical science to deliver 
          cutting-edge treatments. He is fluent in ${userDetails.languages.join(" and ")}, ensuring clear communication with his diverse patient base.`
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
