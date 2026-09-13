const express = require('express');
const { getDb } = require('../db/database');

const router = express.Router();

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>&"']/g, (char) => {
    const escapes = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' };
    return escapes[char];
  });
}

function sanitizeInput(body) {
  return {
    ...body,
    name: sanitizeString(body.name),
  };
}

async function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
              if (err) return reject(err);
              resolve(rows);
            });
  });
}

async function getSingle(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
              if (err) return reject(err);
              resolve(row);
            });
  });
}

async function runInsert(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
              if (err) return reject(err);
              resolve(this.lastID);
            });
  });
}

// GET /api/medications
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const medications = await runQuery(db, 'SELECT * FROM medications ORDER BY name ASC');
    res.json({ success: true, data: medications });
  } catch (err) {
    console.error('Error fetching medications:', err);
    res.status(500).json({ success: false, error: 'Error fetching medications' });
  }
});

// POST /api/medications
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const body = sanitizeInput(req.body);
    const { name } = body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Medication name is required' });
    }

    const lastId = await runInsert(db, 'INSERT INTO medications (name) VALUES (?)', [name]);
    const medication = await getSingle(db, 'SELECT * FROM medications WHERE id = ?', [lastId]);
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
    const medication = await getSingle(db, 'SELECT * FROM medications WHERE id = ?', [req.params.id]);

    if (!medication) {
      return res.status(404).json({ success: false, error: 'Medication not found' });
    }

    const { name } = sanitizeInput(req.body);

    if (!name) {
      return res.status(400).json({ success: false, error: 'Medication name is required' });
    }

    await db.run('UPDATE medications SET name = ? WHERE id = ?', [name, req.params.id]);
    const updated = await getSingle(db, 'SELECT * FROM medications WHERE id = ?', [req.params.id]);
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
    const medication = await getSingle(db, 'SELECT * FROM medications WHERE id = ?', [req.params.id]);

    if (!medication) {
      return res.status(404).json({ success: false, error: 'Medication not found' });
    }

    await db.run('DELETE FROM medications WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Medication deleted successfully' });
  } catch (err) {
    console.error('Error deleting medication:', err);
    res.status(500).json({ success: false, error: 'Error deleting medication' });
  }
});

module.exports = router;
