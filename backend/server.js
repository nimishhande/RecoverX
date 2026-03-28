require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin or non-browser requests
    if (!origin) return callback(null, true);
    const allowedOrigins = FRONTEND_ORIGIN.split(',').map(o => o.trim());
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS: Origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type']
}));
app.use(express.json());

// Routes — mounted at same path as Spring Boot: /api/v1/auth
app.use('/api/v1/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'RecoverX Auth Service' });
});

// Seed test user if empty
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('--- Seeding default test user ---');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);
    db.prepare(`
      INSERT INTO users (firstname, lastname, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('Test', 'User', 'test@recoverx.com', hashedPassword, 'ADMIN');
    console.log('✓ Success: Use test@recoverx.com / Password123!');
  }
}

// Start server
seedDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✓ RecoverX backend running on http://localhost:${PORT}`);
    console.log(`✓ Auth API: http://localhost:${PORT}/api/v1/auth`);
  });
});
