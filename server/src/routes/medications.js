const express = require('express');
const { getDb } = require('../db/database');
const { runQuery, getSingle, runInsert, run } = require('../utils/db-helpers');
const { sanitizeMedicationInput } = require('../utils/validation');

const router = express.Router();

// GET /api/medications
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const medications = await runQuery(db, 'SELECT id, name, created_at FROM medications ORDER BY name ASC');
    res.json({ success: true, data: medications });
  } catch (err) {
    console.error('Error fetching medications:', err);
    res.status(500).json({ success: false, error: 'Error fetching medications' });
  }
});

// GET /api/medications/:id
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const medication = await getSingle(db, 'SELECT id, name, created_at FROM medications WHERE id = ?', [req.params.id]);

    if (!medication) {
      return res.status(404).json({ success: false, error: 'Medication not found' });
    }

    res.json({ success: true, data: medication });
  } catch (err) {
    console.error('Error fetching medication:', err);
    res.status(500).json({ success: false, error: 'Error fetching medication' });
  }
});

// POST /api/medications
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const body = sanitizeMedicationInput(req.body);
    const { name } = body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Medication name is required' });
    }

    const lastId = await runInsert(db, "INSERT INTO medications (name) VALUES (?)", [name]);
    const medication = await getSingle(db, 'SELECT id, name, created_at FROM medications WHERE id = ?', [lastId]);
    res.status(201).json({ success: true, data: medication });
  } catch (err) {
    console.error('Error creating medication:', err);
    res.status(500).json({ success: false, error: 'Error creating medication' });
  }
});

// PUT /api/medications/:id
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const medication = await getSingle(db, 'SELECT id, name, created_at FROM medications WHERE id = ?', [req.params.id]);

    if (!medication) {
      return res.status(404).json({ success: false, error: 'Medication not found' });
    }

    const body = sanitizeMedicationInput(req.body);
    const { name } = body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Medication name is required' });
    }

    await run(db, 'UPDATE medications SET name = ? WHERE id = ?', [name, req.params.id]);
    const updated = await getSingle(db, 'SELECT id, name, created_at FROM medications WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating medication:', err);
    res.status(500).json({ success: false, error: 'Error updating medication' });
  }
});

// DELETE /api/medications/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const medication = await getSingle(db, 'SELECT id, name, created_at FROM medications WHERE id = ?', [req.params.id]);

    if (!medication) {
      return res.status(404).json({ success: false, error: 'Medication not found' });
    }

    await run(db, 'DELETE FROM medications WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Medication deleted successfully' });
  } catch (err) {
    console.error('Error deleting medication:', err);
    res.status(500).json({ success: false, error: 'Error deleting medication' });
  }
});

module.exports = router;
