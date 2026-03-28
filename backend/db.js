const fs = require('fs');
const path = require('path');

/**
 * High-Fidelity Mock for better-sqlite3
 * This allows the backend to run on systems that fail to compile binary modules (like better-sqlite3).
 * It saves data to 'database.json' as a simple JSON-based storage.
 */
class MockDB {
  constructor(dbName) {
    this.dbPath = path.join(__dirname, 'db.json');
    this.data = { users: [] };
    this.load();
  }

  load() {
    if (fs.existsSync(this.dbPath)) {
      try {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Failed to load database.json:', err.message);
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.error('Failed to save to database.json:', err.message);
    }
  }

  // better-sqlite3 mimicry
  pragma() { return this; }
  exec(sql) {
    // Basic table creation logic
    if (sql.includes('CREATE TABLE IF NOT EXISTS users')) {
      if (!this.data.users) this.data.users = [];
      this.save();
    }
    return this;
  }

  prepare(sql) {
    const db = this;
    return {
      get(...args) {
        if (sql.includes('SELECT count(*)')) {
          return { count: db.data.users.length };
        }
        if (sql.includes('SELECT count')) {
          return { count: db.data.users.length };
        }
        if (sql.includes('SELECT id FROM users WHERE email = ?') || sql.includes('SELECT * FROM users WHERE email = ?')) {
          return db.data.users.find(u => u.email === args[0]) || null;
        }
        if (sql.includes('SELECT id, firstname')) {
           return db.data.users.find(u => u.id === args[0]) || null;
        }
        if (sql.includes('SELECT * FROM users WHERE id = ?')) {
           return db.data.users.find(u => u.id === args[0]) || null;
        }
        return null;
      },
      run(...args) {
        if (sql.includes('INSERT INTO users')) {
          const [firstname, lastname, email, password, role] = args;
          const newUser = {
            id: db.data.users.length + 1,
            firstname,
            lastname,
            email,
            password,
            role,
            created_at: new Date().toISOString()
          };
          db.data.users.push(newUser);
          db.save();
          return { lastInsertRowid: newUser.id, changes: 1 };
        }
        return { lastInsertRowid: 0, changes: 0 };
      },
      all() {
        if (sql.includes('SELECT * FROM users')) return db.data.users;
        return [];
      }
    };
  }
}

// Singleton instance
const db = new MockDB('recoverx.db');

// Re-run table creation logic on import to be safe
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
