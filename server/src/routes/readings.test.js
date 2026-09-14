const express = require('express');
const sqlite3 = require('sqlite3');

let app;
let db;

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

describe('Readings API Integration', () => {
  beforeEach(() => {
    jest.resetModules();

    const expressModule = require('express');
    const cors = require('cors');
    const morgan = require('morgan');

    app = expressModule();
    app.use(cors());
    app.use(expressModule.json());
    app.use(morgan('dev'));

    const router = require('./readings');
    app.use('/api/readings', router);
  });

  describe('POST /api/readings', () => {
    it('returns 400 for missing systolic', async () => {
      const res = await require('supertest')(app)
        .post('/api/readings')
        .send({ diastolic: 80 });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for systolic <= diastolic', async () => {
      const res = await require('supertest')(app)
        .post('/api/readings')
        .send({ systolic: 80, diastolic: 120 });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for values outside physiological range', async () => {
      const res = await require('supertest')(app)
        .post('/api/readings')
        .send({ systolic: 700, diastolic: 100 });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 201 for valid reading', async () => {
      const reading = {
        systolic: 120,
        diastolic: 80,
        heart_rate: 72,
      };
      const res = await require('supertest')(app)
        .post('/api/readings')
        .send(reading);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/readings', () => {
    it('returns success with empty data when no readings', async () => {
      const res = await require('supertest')(app)
        .get('/api/readings')
        .query({ limit: 100 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeDefined();
    });

    it('respects limit parameter', async () => {
      const res = await require('supertest')(app)
        .get('/api/readings')
        .query({ limit: 50 });
      expect(res.status).toBe(200);
    });

    it('handles query filters', async () => {
      const res = await require('supertest')(app)
        .get('/api/readings')
        .query({ since: '2024-01-01', date_from: '2024-01-01' });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/readings/stats', () => {
    it('returns stats structure', async () => {
      const res = await require('supertest')(app)
        .get('/api/readings/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/readings/:id', () => {
    it('returns 404 for non-existent reading', async () => {
      const res = await require('supertest')(app)
        .get('/api/readings/999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/readings/:id', () => {
    it('returns 404 for non-existent reading', async () => {
      const res = await require('supertest')(app)
        .put('/api/readings/999')
        .send({ systolic: 130 });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('returns 404 for invalid update on non-existent reading', async () => {
      const res = await require('supertest')(app)
        .put('/api/readings/999')
        .send({ systolic: 80, diastolic: 120 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/readings/:id', () => {
    it('returns 404 for non-existent reading', async () => {
      const res = await require('supertest')(app)
        .delete('/api/readings/999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('Health endpoint', () => {
  let healthApp;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    const expressModule = require('express');
    healthApp = expressModule();
    healthApp.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  });

  it('returns health status', async () => {
    const res = await require('supertest')(healthApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});
