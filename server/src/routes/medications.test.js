const express = require('express');
const supertest = require('supertest');

let app;

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

describe('Medications API Integration', () => {
  beforeEach(() => {
    jest.resetModules();

    const expressModule = require('express');
    const cors = require('cors');
    const morgan = require('morgan');

    app = expressModule();
    app.use(cors());
    app.use(expressModule.json());
    app.use(morgan('dev'));

    const router = require('./medications');
    app.use('/api/medications', router);
    global._testApp = app;
  });

  describe('GET /api/medications', () => {
    it('returns success with medications array', async () => {
      const res = await supertest(global._testApp).get('/api/medications');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/medications', () => {
    it('returns 400 for missing name', async () => {
      const res = await supertest(global._testApp)
        .post('/api/medications')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 201 for valid medication', async () => {
      const name = `TestMedPost_${Date.now()}`;
      const res = await supertest(global._testApp)
        .post('/api/medications')
        .send({ name });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(name);
    });

    it('sanitizes input to prevent XSS', async () => {
      const name = `XssMed_${Date.now()}<script>alert("xss")</script>`;
      const res = await supertest(global._testApp)
        .post('/api/medications')
        .send({ name });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toContain('&lt;');
      expect(res.body.data.name).toContain('&gt;');
    });
  });

  describe('PUT /api/medications/:id', () => {
    it('returns 404 for non-existent medication', async () => {
      const res = await supertest(global._testApp)
        .put('/api/medications/999')
        .send({ name: 'New Name' });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for missing name', async () => {
      // First create a medication to get a valid ID
      const createName = `TestMedPut_${Date.now()}`;
      const createRes = await supertest(global._testApp)
        .post('/api/medications')
        .send({ name: createName });
      expect(createRes.status).toBe(201);

      const res = await supertest(global._testApp)
        .put('/api/medications/' + createRes.body.data.id)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns updated medication when exists', async () => {
      const createName = `TestMedPutUpdate_${Date.now()}`;
      const newName = `UpdatedMed_${Date.now()}`;
      const createRes = await supertest(global._testApp)
        .post('/api/medications')
        .send({ name: createName });
      expect(createRes.status).toBe(201);

      const res = await supertest(global._testApp)
        .put('/api/medications/' + createRes.body.data.id)
        .send({ name: newName });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(newName);
    });
  });

  describe('DELETE /api/medications/:id', () => {
    it('returns 404 for non-existent medication', async () => {
      const res = await supertest(global._testApp)
        .delete('/api/medications/999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('returns success when medication exists', async () => {
      const createName = `TestMedDel_${Date.now()}`;
      const createRes = await supertest(global._testApp)
        .post('/api/medications')
        .send({ name: createName });
      expect(createRes.status).toBe(201);

      const res = await supertest(global._testApp)
        .delete('/api/medications/' + createRes.body.data.id);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
