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
    symptoms: sanitizeString(body.symptoms),
    notes: sanitizeString(body.notes),
    medication_name: sanitizeString(body.medication_name),
    arm: sanitizeString(body.arm),
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

// GET /api/readings
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { since, limit = 100, order = 'desc', medication_name, arm, date_from, date_to, pressure_order } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 100, 1), 1000);

    let whereClauses = [];
    let params = [];

    if (since) {
      whereClauses.push('created_at >= ?');
      params.push(since);
    }
    if (date_from) {
      whereClauses.push('created_at >= ?');
      params.push(date_from);
    }
    if (date_to) {
      whereClauses.push('created_at <= ?');
      params.push(date_to);
    }
    if (medication_name) {
      whereClauses.push('medication_name = ?');
      params.push(medication_name);
    }
    if (arm) {
      whereClauses.push('arm = ?');
      params.push(arm);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderBy = 'created_at';
    if (pressure_order) {
      orderBy = pressure_order === 'asc' ? 'systolic ASC' : 'systolic DESC';
    } else {
      orderBy = `${orderBy} ${order}`;
    }

    const sql = `SELECT * FROM readings ${whereSql} ORDER BY ${orderBy} LIMIT ?`;
    params.push(parsedLimit);

    const readings = await runQuery(db, sql, params);
    res.json({ success: true, data: readings, count: readings.length });
  } catch (err) {
    console.error('Error fetching readings:', err);
    res.status(500).json({ success: false, error: 'Error fetching readings' });
  }
});

// GET /api/readings/stats
router.get('/stats', async (req, res) => {
  try {
    const db = await getDb();
    const { date_from, date_to } = req.query;

    let whereSql = '';
    let params = [];
    if (date_from || date_to) {
      const clauses = [];
      if (date_from) {
        clauses.push('created_at >= ?');
        params.push(date_from);
      }
      if (date_to) {
        clauses.push('created_at <= ?');
        params.push(date_to);
      }
      whereSql = `WHERE ${clauses.join(' AND ')}`;
    }

    const statsRow = await getSingle(db, `
      SELECT
        COUNT(*) as count,
        AVG(systolic) as avg_systolic,
        AVG(diastolic) as avg_diastolic,
        MIN(systolic) as min_systolic,
        MIN(diastolic) as min_diastolic,
        MAX(systolic) as max_systolic,
        MAX(diastolic) as max_diastolic,
        AVG(heart_rate) as avg_heart_rate,
        MIN(heart_rate) as min_heart_rate,
        MAX(heart_rate) as max_heart_rate
      FROM readings
      ${whereSql}
    `, params);

    const stats = {
      count: statsRow.count,
      systolic: {
        avg: statsRow.avg_systolic ? parseFloat(statsRow.avg_systolic.toFixed(1)) : null,
        min: statsRow.min_systolic,
        max: statsRow.max_systolic,
      },
      diastolic: {
        avg: statsRow.avg_diastolic ? parseFloat(statsRow.avg_diastolic.toFixed(1)) : null,
        min: statsRow.min_diastolic,
        max: statsRow.max_diastolic,
      },
      heart_rate: {
        avg: statsRow.avg_heart_rate ? parseFloat(statsRow.avg_heart_rate.toFixed(1)) : null,
        min: statsRow.min_heart_rate,
        max: statsRow.max_heart_rate,
      },
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, error: 'Error fetching statistics' });
  }
});

// GET /api/readings/:id
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const reading = await getSingle(db, 'SELECT * FROM readings WHERE id = ?', [req.params.id]);

    if (!reading) {
      return res.status(404).json({ success: false, error: 'Reading not found' });
    }

    res.json({ success: true, data: reading });
  } catch (err) {
    console.error('Error fetching reading:', err);
    res.status(500).json({ success: false, error: 'Error fetching reading' });
  }
});

// POST /api/readings
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const body = sanitizeInput(req.body);
    const { systolic, diastolic, heart_rate, medication_used, medication_name, symptoms, notes, arm } = body;

    if (!systolic || !diastolic || systolic < 20 || diastolic < 20) {
      return res.status(400).json({ success: false, error: 'Systolic and diastolic pressure are required and must be positive values' });
    }
    if (systolic > 600 || diastolic > 400) {
      return res.status(400).json({ success: false, error: 'Pressure values are outside realistic physiological range' });
    }
    if (systolic <= diastolic) {
      return res.status(400).json({ success: false, error: 'Systolic pressure must be greater than diastolic pressure' });
    }

    const lastId = await runInsert(db,
      `INSERT INTO readings (systolic, diastolic, heart_rate, medication_used, medication_name, symptoms, notes, arm)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [systolic, diastolic, heart_rate || null, medication_used || 0, medication_name || null, symptoms || null, notes || null, arm || null]
    );

    const newReading = await getSingle(db, 'SELECT * FROM readings WHERE id = ?', [lastId]);
    res.status(201).json({ success: true, data: newReading });
  } catch (err) {
    console.error('Error creating reading:', err);
    res.status(500).json({ success: false, error: 'Error creating reading' });
  }
});

// PUT /api/readings/:id
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const reading = await getSingle(db, 'SELECT * FROM readings WHERE id = ?', [req.params.id]);

    if (!reading) {
      return res.status(404).json({ success: false, error: 'Reading not found' });
    }

    const body = sanitizeInput(req.body);
    const { systolic, diastolic, heart_rate, medication_used, medication_name, symptoms, notes, arm } = body;
    const updates = [];
    const params = [];

    if (systolic !== undefined || diastolic !== undefined) {
      const sys = systolic !== undefined ? systolic : reading.systolic;
      const dia = diastolic !== undefined ? diastolic : reading.diastolic;
      if (sys < 20 || dia < 20) {
        return res.status(400).json({ success: false, error: 'Systolic and diastolic pressure must be positive values' });
      }
      if (sys > 600 || dia > 400) {
        return res.status(400).json({ success: false, error: 'Pressure values are outside realistic physiological range' });
      }
      if (sys <= dia) {
        return res.status(400).json({ success: false, error: 'Systolic pressure must be greater than diastolic pressure' });
      }
    }
    if (systolic !== undefined) { updates.push('systolic = ?'); params.push(systolic); }
    if (diastolic !== undefined) { updates.push('diastolic = ?'); params.push(diastolic); }
    if (heart_rate !== undefined) { updates.push('heart_rate = ?'); params.push(heart_rate); }
    if (medication_used !== undefined) { updates.push('medication_used = ?'); params.push(medication_used); }
    if (medication_name !== undefined) { updates.push('medication_name = ?'); params.push(medication_name); }
    if (symptoms !== undefined) { updates.push('symptoms = ?'); params.push(symptoms); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (arm !== undefined) { updates.push('arm = ?'); params.push(arm); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);
    await db.run(`UPDATE readings SET ${updates.join(', ')} WHERE id = ?`, params);

    const updatedReading = await getSingle(db, 'SELECT * FROM readings WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedReading });
  } catch (err) {
    console.error('Error updating reading:', err);
    res.status(500).json({ success: false, error: 'Error updating reading' });
  }
});

// DELETE /api/readings/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const reading = await getSingle(db, 'SELECT * FROM readings WHERE id = ?', [req.params.id]);

    if (!reading) {
      return res.status(404).json({ success: false, error: 'Reading not found' });
    }

    await db.run('DELETE FROM readings WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Reading deleted successfully' });
  } catch (err) {
    console.error('Error deleting reading:', err);
    res.status(500).json({ success: false, error: 'Error deleting reading' });
  }
});

module.exports = router;
