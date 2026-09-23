const request = require('supertest');

// Create a test database that uses an in-memory SQLite instance
let dbInstance = null;
let initPromise = null;
let initLock = false;

function getTestDb() {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (!initPromise) {
    initPromise = (async () => {
      while (initLock) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      initLock = true;

      try {
        if (dbInstance) {
          return dbInstance;
        }

        const sqlite3 = require('sqlite3').verbose();

        return new Promise((resolve, reject) => {
          const db = new sqlite3.Database(':memory:', (err) => {
            if (err) return reject(err);
            db.serialize(() => {
              db.run(`
                CREATE TABLE medications (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL UNIQUE,
                  created_at TEXT DEFAULT (datetime('now'))
                )
              `, (err) => {
                if (err) return reject(err);
              });

              db.run(`
                CREATE TABLE readings (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  systolic INTEGER NOT NULL,
                  diastolic INTEGER NOT NULL,
                  heart_rate INTEGER,
                  medication_used INTEGER,
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

              // Seed medications
              const meds = ['Losartana', 'Enalapril', 'Atenolol', 'Hidroclorotiazida', 'Amlodipina', 'Outro'];
              const stmt = db.prepare('INSERT INTO medications (name) VALUES (?)');
              meds.forEach(med => stmt.run(med));
              stmt.finalize();

              dbInstance = db;
              resolve(db);
            });
          });
        });
      } finally {
        initLock = false;
      }
    })();
  }

  return initPromise;
}

// Override the module cache
const originalCacheKey = require.resolve('../db/database');
const originalModule = require.cache[originalCacheKey];
require.cache[originalCacheKey] = { exports: { getDb: getTestDb, initDb: () => Promise.resolve() } };

// Load the app
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const readingsRoutes = require('../routes/readings');
const medicationsRoutes = require('../routes/medications');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use('/api/readings', readingsRoutes);
app.use('/api/medications', medicationsRoutes);

// Unique prefix per test run to avoid UNIQUE constraint collisions
const SUFFIX = `-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

// Clean up before each test to ensure isolated state
beforeEach(() => {
  return new Promise((resolve) => {
    if (dbInstance) {
      dbInstance.run('DELETE FROM medications', (err) => {
        if (err) return resolve(err);
        resolve();
      });
    } else {
      resolve();
    }
  });
});

// Clean up after each test
afterEach(() => {
  if (dbInstance) {
    dbInstance.close();
  }
  dbInstance = null;
  initPromise = null;
  initLock = false;
  require.cache[originalCacheKey] = originalModule;
  // Clear routes module cache to reset any internal state
  delete require.cache[require.resolve('../routes/readings')];
  delete require.cache[require.resolve('../routes/medications')];
});
describe('GET /api/medications', () => {
  it('returns all medications', async () => {
    const res = await request(app).get('/api/medications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('returns medications sorted by name', async () => {
    const res = await request(app).get('/api/medications');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

describe('GET /api/medications/:id', () => {
  it('returns a medication by id', async () => {
    const res = await request(app).get('/api/medications/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBeDefined();
    expect(res.body.data.id).toBe(1);
  });

  it('returns 404 for nonexistent id', async () => {
    const res = await request(app).get('/api/medications/999999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/medications', () => {
  it('creates a new medication', async () => {
    const res = await request(app)
      .post('/api/medications')
      .send({ name: `Med-CREATE-01${SUFFIX}` });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(`Med-CREATE-01${SUFFIX}`);
    expect(res.body.data.id).toBeDefined();
  });

  it('rejects missing name', async () => {
    const res = await request(app).post('/api/medications').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects empty name', async () => {
    const res = await request(app).post('/api/medications').send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('escapes XSS in name', async () => {
    const res = await request(app)
      .post('/api/medications')
      .send({ name: `<script>xss-X${SUFFIX}</script>` });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(`&lt;script&gt;xss-X${SUFFIX}&lt;/script&gt;`);
  });

  it('creates medication with only name field', async () => {
    const res = await request(app)
      .post('/api/medications')
      .send({ name: `Med-CREATE-03${SUFFIX}` });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(`Med-CREATE-03${SUFFIX}`);
    expect(res.body.data.id).toBeDefined();
  });
});

describe('PUT /api/medications/:id', () => {
  it('updates a medication', async () => {
    const createRes = await request(app)
      .post('/api/medications')
      .send({ name: `Med-PUT-UPD-01${SUFFIX}` });
    const id = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/medications/${id}`)
      .send({ name: `Updated Target${SUFFIX}` });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(`Updated Target${SUFFIX}`);
  });

  it('returns 404 for nonexistent id', async () => {
    const res = await request(app)
      .put('/api/medications/999999')
      .send({ name: 'New Name' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('rejects empty name update', async () => {
    const createRes = await request(app)
      .post('/api/medications')
      .send({ name: `Med-PUT-UPD-02${SUFFIX}` });
    const id = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/medications/${id}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('escapes XSS in name update', async () => {
    const createRes = await request(app)
      .post('/api/medications')
      .send({ name: `Med-PUT-UPD-03${SUFFIX}` });
    const id = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/medications/${id}`)
      .send({ name: `<script>xss-Y${SUFFIX}</script>` });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(`&lt;script&gt;xss-Y${SUFFIX}&lt;/script&gt;`);
  });
});

describe('DELETE /api/medications/:id', () => {
  it('deletes a medication', async () => {
    // First create a medication to delete
    const createRes = await request(app)
      .post('/api/medications')
      .send({ name: `To Be Deleted${SUFFIX}` });
    const id = createRes.body.data.id;

    const res = await request(app).delete(`/api/medications/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Medication deleted successfully');
  });

  it('returns 404 for nonexistent id', async () => {
    const res = await request(app).delete('/api/medications/999999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
