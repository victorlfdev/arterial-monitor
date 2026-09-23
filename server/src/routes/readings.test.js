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
                  medication_used INTEGER REFERENCES medications(id) DEFAULT 0,
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

// Override the module cache to use our in-memory database
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

// Clean up after each test
afterEach(() => {
  dbInstance = null;
  initPromise = null;
  initLock = false;
  require.cache[originalCacheKey] = originalModule;
  // Clear routes module cache to reset any internal state
  delete require.cache[require.resolve('../routes/readings')];
  delete require.cache[require.resolve('../routes/medications')];
});

describe('GET /api/readings', () => {
  it('returns all readings when no filters', async () => {
    // Create a reading first
    await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80 });

    const res = await request(app).get('/api/readings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.count).toBeGreaterThanOrEqual(0);
  });

  it('filters by date range', async () => {
    await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80 });

    const res = await request(app).get('/api/readings').query({ date_from: '2020-01-01', date_to: '2030-12-31' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('filters by medication_name', async () => {
    await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80, medication_name: 'Amlodipina' });

    const res = await request(app).get('/api/readings').query({ medication_name: 'Amlodipina' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('filters by arm', async () => {
    await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80, arm: 'left' });

    const res = await request(app).get('/api/readings').query({ arm: 'left' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('limits results to max 1000', async () => {
    const res = await request(app).get('/api/readings').query({ limit: 5000 });
    expect(res.status).toBe(200);
  });

  it('sorts by created_at descending by default', async () => {
    const res = await request(app).get('/api/readings').query({ order: 'desc' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('sorts by systolic when sort_by is provided', async () => {
    await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80 });
    await request(app)
      .post('/api/readings')
      .send({ systolic: 140, diastolic: 90 });

    const res = await request(app).get('/api/readings').query({ sort_by: 'systolic', order: 'asc' });
    expect(res.status).toBe(200);
  });

  it('handles invalid sort_by with default', async () => {
    const res = await request(app).get('/api/readings').query({ sort_by: 'invalid_column' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns empty array when no readings match', async () => {
    const res = await request(app).get('/api/readings').query({ medication_name: 'Nonexistent' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});

describe('GET /api/readings/stats', () => {
  it('returns statistics', async () => {
    await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80, heart_rate: 70 });

    const res = await request(app).get('/api/readings/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBeGreaterThanOrEqual(0);
    expect(res.body.data.systolic).toBeDefined();
    expect(res.body.data.diastolic).toBeDefined();
    expect(res.body.data.heart_rate).toBeDefined();
  });

  it('filters stats by date range', async () => {
    const res = await request(app).get('/api/readings/stats').query({
      date_from: '2020-01-01',
      date_to: '2030-12-31',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/readings/:id', () => {
  let createdReading;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80, heart_rate: 70 });
    createdReading = res.body.data;
  });

  it('returns a reading by id', async () => {
    const res = await request(app).get(`/api/readings/${createdReading.id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.systolic).toBe(120);
    expect(res.body.data.diastolic).toBe(80);
  });

  it('returns 404 for nonexistent id', async () => {
    const res = await request(app).get('/api/readings/999999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/readings', () => {
  it('creates a new reading', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.systolic).toBe(120);
    expect(res.body.data.diastolic).toBe(80);
    expect(res.body.data.id).toBeDefined();
  });

  it('creates a reading with optional fields', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({
        systolic: 130,
        diastolic: 85,
        heart_rate: 75,
        medication_name: 'Amlodipina',
        symptoms: 'Headache',
        notes: 'Morning reading',
        arm: 'left',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.heart_rate).toBe(75);
    expect(res.body.data.medication_name).toBe('Amlodipina');
    expect(res.body.data.symptoms).toBe('Headache');
    expect(res.body.data.arm).toBe('left');
  });

  it('rejects missing systolic', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ diastolic: 80 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects missing diastolic', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 120 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects systolic <= diastolic', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 100, diastolic: 100 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects diastolic >= systolic', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 90, diastolic: 110 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects systolic below minimum', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 10, diastolic: 5 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects diastolic below minimum', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 15 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects systolic above maximum', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 700, diastolic: 200 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects diastolic above maximum', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 200, diastolic: 450 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects non-integer systolic', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 120.5, diastolic: 80 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects non-integer diastolic', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80.5 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid heart rate', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80, heart_rate: 400 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects heart_rate below minimum', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80, heart_rate: 0 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('accepts heart_rate in valid range', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80, heart_rate: 60 });
    expect(res.status).toBe(201);
    expect(res.body.data.heart_rate).toBe(60);
  });

  it('escapes XSS in string fields', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({
        systolic: 120,
        diastolic: 80,
        symptoms: '<script>alert("xss")</script>',
        notes: 'a & b',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.symptoms).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(res.body.data.notes).toBe('a &amp; b');
  });

  it('rejects empty body', async () => {
    const res = await request(app).post('/api/readings').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/readings/:id', () => {
  let createdReading;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80, heart_rate: 70 });
    createdReading = res.body.data;
  });

  it('updates a reading', async () => {
    const res = await request(app)
      .put(`/api/readings/${createdReading.id}`)
      .send({ systolic: 130 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.systolic).toBe(130);
    // Diastolic should remain unchanged
    expect(res.body.data.diastolic).toBe(80);
  });

  it('updates a reading partially', async () => {
    const res = await request(app)
      .put(`/api/readings/${createdReading.id}`)
      .send({ notes: 'Updated notes' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notes).toBe('Updated notes');
    expect(res.body.data.systolic).toBe(120); // unchanged
  });

  it('returns 404 for nonexistent id', async () => {
    const res = await request(app)
      .put('/api/readings/999999')
      .send({ systolic: 130 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid update (systolic <= diastolic)', async () => {
    const res = await request(app)
      .put(`/api/readings/${createdReading.id}`)
      .send({ systolic: 70 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects no fields to update', async () => {
    const res = await request(app)
      .put(`/api/readings/${createdReading.id}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/readings/:id', () => {
  let createdReading;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ systolic: 120, diastolic: 80 });
    createdReading = res.body.data;
  });

  it('deletes a reading', async () => {
    const res = await request(app).delete(`/api/readings/${createdReading.id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 for nonexistent id', async () => {
    const res = await request(app).delete('/api/readings/999999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
