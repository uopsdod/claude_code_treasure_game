import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// Initialize SQLite database with promisified methods - Input: none, Output: database connection object
const initializeDatabase = () => {
  const db = new sqlite3.Database('./treasure_game.db', (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
    }
  });

  // Promisify database methods for async/await usage with proper context preservation
  db.runAsync = function(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  };
  
  db.getAsync = promisify(db.get.bind(db));
  db.allAsync = promisify(db.all.bind(db));

  return db;
};

// Create database tables if they don't exist - Input: database connection, Output: void
const createTables = async (db) => {
  try {
    // Create users table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create game_scores table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS game_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        result TEXT NOT NULL,
        boxes_opened INTEGER NOT NULL,
        treasure_found BOOLEAN NOT NULL,
        played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

const db = initializeDatabase();
await createTables(db);

export default db;