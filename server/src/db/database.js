const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'readings.db');

let dbInstance = null;
let initPromise = null;

function getDb() {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (!initPromise) {
    initPromise = new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) return reject(err);
        db.serialize(() => {
          db.run(`
            CREATE TABLE IF NOT EXISTS medications (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE,
              created_at TEXT DEFAULT (datetime('now'))
            )
          `, (err) => {
            if (err) return reject(err);
          });

          db.run(`
            CREATE TABLE IF NOT EXISTS readings (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              systolic INTEGER NOT NULL,
              diastolic INTEGER NOT NULL,
              heart_rate INTEGER,
              medication_used INTEGER DEFAULT 0,
              medication_name TEXT,
              symptoms TEXT,
              notes TEXT,
              arm TEXT,
              created_at TEXT DEFAULT (datetime('now')),
              updated_at TEXT DEFAULT (datetime('now'))
            )
          `, (err) => {
            if (err) return reject(err);
          });

          db.run(`CREATE INDEX IF NOT EXISTS idx_readings_created ON readings(created_at)`, (err) => {
            if (err) return reject(err);
          });

          db.run(`CREATE INDEX IF NOT EXISTS idx_readings_sync ON readings(updated_at)`, (err) => {
            if (err) return reject(err);
          });

          db.all('PRAGMA table_info(readings)', (err, rows) => {
            if (err) return reject(err);
            const columns = rows.map(r => r.name);
            if (!columns.includes('arm')) {
              console.log('Migration: adding arm column to readings table');
              db.run(`ALTER TABLE readings ADD COLUMN arm TEXT`, (err) => {
                if (err && !err.includes('duplicate column')) {
                  console.error('Migration error adding arm column:', err);
                }
              });
            }
          });

          db.get('SELECT COUNT(*) as count FROM medications', (err, row) => {
            if (err) return reject(err);
            if (row.count === 0) {
              const meds = ['Losartana', 'Enalapril', 'Atenolol', 'Hidroclorotiazida', 'Amlodipina', 'Outro'];
              const stmt = db.prepare('INSERT INTO medications (name) VALUES (?)');
              meds.forEach(med => stmt.run(med));
              stmt.finalize();
            }
            dbInstance = db;
            resolve(db);
          });
        });
      });
    });
  }

  return initPromise;
}

function initDb(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS medications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `, (err) => {
        if (err) return reject(err);
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS readings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          systolic INTEGER NOT NULL,
          diastolic INTEGER NOT NULL,
          heart_rate INTEGER,
          medication_used INTEGER DEFAULT 0,
          medication_name TEXT,
          symptoms TEXT,
          notes TEXT,
          arm TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        )
      `, (err) => {
        if (err) return reject(err);
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_readings_created ON readings(created_at)`, (err) => {
        if (err) return reject(err);
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_readings_sync ON readings(updated_at)`, (err) => {
        if (err) return reject(err);
      });

      db.get('SELECT COUNT(*) as count FROM medications', (err, row) => {
        if (err) return reject(err);
        if (row.count === 0) {
          const meds = ['Losartana', 'Enalapril', 'Atenolol', 'Hidroclorotiazida', 'Amlodipina', 'Outro'];
          const stmt = db.prepare('INSERT INTO medications (name) VALUES (?)');
          meds.forEach(med => stmt.run(med));
          stmt.finalize();
        }
        resolve(db);
      });
    });
  });
}

module.exports = { getDb, initDb };
