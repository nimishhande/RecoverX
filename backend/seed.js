require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('--- Seeding database ---');
  
  const testEmail = 'test@recoverx.com';
  const testPassword = 'Password123!';
  
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(testEmail);
  
  if (existingUser) {
    console.log('✓ Test user already exists.');
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(testPassword, salt);
  
  const stmt = db.prepare(
    'INSERT INTO users (firstname, lastname, email, password, role) VALUES (?, ?, ?, ?, ?)'
  );
  
  stmt.run('Test', 'User', testEmail, hashedPassword, 'ADMIN');
  
  console.log('✓ Created test user:');
  console.log(`  Email: ${testEmail}`);
  console.log(`  Password: ${testPassword}`);
  console.log('------------------------');
}

seed().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
