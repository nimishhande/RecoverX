const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/v1/auth/register
// Mirrors: AuthenticationController.register() from Spring Boot
router.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, email, password, role } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ 
        message: 'All fields are required: firstname, lastname, email, password' 
      });
    }

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password (mirrors Spring Boot's BCryptPasswordEncoder)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user (mirrors: repository.save(user))
    const userRole = role || 'USER';
    const stmt = db.prepare(
      'INSERT INTO users (firstname, lastname, email, password, role) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(firstname, lastname, email, hashedPassword, userRole);

    // Generate JWT (mirrors: jwtService.generateToken(user))
    const token = jwt.sign(
      { 
        sub: email,
        userId: result.lastInsertRowid,
        firstname,
        lastname,
        role: userRole
      },
      process.env.JWT_SECRET || 'recoverx_fallback_secret_key_12345',
      { expiresIn: (parseInt(process.env.JWT_EXPIRATION) || 86400000) / 1000 } // Convert ms to seconds
    );

    // Return response (mirrors: AuthenticationResponse { token })
    res.status(201).json({ token });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/v1/auth/authenticate
// Mirrors: AuthenticationController.authenticate() from Spring Boot
router.post('/authenticate', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email (mirrors: repository.findByEmail(email).orElseThrow())
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password (mirrors: authenticationManager.authenticate())
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT (mirrors: jwtService.generateToken(user))
    const token = jwt.sign(
      { 
        sub: user.email,
        userId: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role
      },
      process.env.JWT_SECRET || 'recoverx_fallback_secret_key_12345',
      { expiresIn: (parseInt(process.env.JWT_EXPIRATION) || 86400000) / 1000 }
    );

    // Return response (mirrors: AuthenticationResponse { token })
    res.json({ token });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/v1/auth/me
// Protected route that returns current user info based on JWT
router.get('/me', authenticateToken, (req, res) => {
  const { userId } = req.user || {};
  if (!userId) {
    return res.status(400).json({ message: 'Invalid token payload' });
  }
  const user = db.prepare('SELECT id, firstname, lastname, email, role, created_at FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json({ user });
});

module.exports = router;
