const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'recoverx-secret-key-2026';

// Middleware
app.use(cors());
app.use(express.json());

// POST /api/v1/auth/authenticate
app.post('/api/v1/auth/authenticate', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password with bcrypt hash
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, firstname: user.firstname },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/v1/auth/register
app.post('/api/v1/auth/register', (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password and insert
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (firstname, lastname, email, password, role) VALUES (?, ?, ?, ?, ?)'
    ).run(firstname, lastname, email, hashedPassword, 'USER');

    // Generate JWT
    const token = jwt.sign(
      { id: result.lastInsertRowid, email, role: 'USER', firstname },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, message: 'Registration successful' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`RecoverX Backend running on http://localhost:${PORT}`);
  console.log(`Auth API: http://localhost:${PORT}/api/v1/auth`);
});
