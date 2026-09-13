import * as SQLite from 'expo-sqlite';

let db = null;

export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('bp-monitor.db');
  }
  return db;
}

export async function initializeDB() {
  try {
    const database = await getDB();

    let tableInfo;
    try {
      tableInfo = await database.getAllAsync('PRAGMA table_info(readings)');
    } catch {
      tableInfo = [];
    }

    const hasServerId = tableInfo.some(col => col.name === 'server_id');

    if (!hasServerId) {
      console.log('Migration: creating new schema with server_id column');
      try {
        await database.execAsync(`CREATE TABLE readings_backup AS SELECT * FROM readings;`);
      } catch {
        console.log('Migration: no backup table found, creating from scratch');
      }
      try {
        await database.execAsync(`DROP TABLE IF EXISTS readings;`);
      } catch {
        console.log('Migration: readings table not found');
      }
      try {
        await database.execAsync(`DROP TABLE IF EXISTS readings_backup;`);
      } catch {}

      await database.execAsync(`
        CREATE TABLE readings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          server_id INTEGER UNIQUE,
          systolic INTEGER NOT NULL,
          diastolic INTEGER NOT NULL,
          heart_rate INTEGER,
          medication_used INTEGER DEFAULT 0,
          medication_name TEXT,
          symptoms TEXT,
          notes TEXT,
          arm TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          synced_at TEXT
        );
      `);

      try {
        const backupCols = await database.getAllAsync('PRAGMA table_info(readings_backup)');
        const hasBackup = backupCols.length > 0;
        if (hasBackup) {
          const columns = backupCols.map(c => c.name).filter(n => n !== 'id' || true).join(', ');
          await database.execAsync(`
            INSERT INTO readings (${columns})
            SELECT ${columns} FROM readings_backup;
          `);
          await database.execAsync(`DROP TABLE readings_backup;`);
          console.log('Migration: data restored from backup');
        }
      } catch {
        console.log('Migration: could not restore backup data');
      }
    }

    let currentTableInfo;
    try {
      currentTableInfo = await database.getAllAsync('PRAGMA table_info(readings)');
    } catch {
      currentTableInfo = [];
    }

    const hasArm = currentTableInfo.some(col => col.name === 'arm');

    if (!hasArm) {
      console.log('Migration: adding arm column');
      try {
        await database.execAsync(`ALTER TABLE readings ADD COLUMN arm TEXT;`);
        console.log('Migration: arm column added');
      } catch (err) {
        if (!err.message?.includes('duplicate column') && !err.message?.includes('duplicate column name')) {
          console.error('Migration error adding arm column:', err);
        }
      }
    }

    await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_readings_synced ON readings(synced_at);`);
    await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_readings_server_id ON readings(server_id);`);
    console.log('Local database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export async function getAllReadings() {
  const db = await getDB();
  const results = await db.getAllAsync('SELECT * FROM readings ORDER BY created_at DESC');
  const seen = new Map();
  for (const row of results) {
    const localKey = String(row.id);
    const serverKey = row.server_id ? String(row.server_id) : null;
    if (serverKey && !seen.has(serverKey)) {
      seen.set(serverKey, row);
    }
    if (!seen.has(localKey)) {
      seen.set(localKey, row);
    }
  }
  return Array.from(seen.values())
    .map(row => ({
      id: row.id,
      server_id: row.server_id || null,
      systolic: row.systolic,
      diastolic: row.diastolic,
      heart_rate: row.heart_rate,
      medication_used: row.medication_used,
      medication_name: row.medication_name,
      symptoms: row.symptoms,
      notes: row.notes,
      arm: row.arm,
      created_at: row.created_at,
      updated_at: row.updated_at,
      synced_at: row.synced_at,
    }));
}

export async function getUnsyncedReadings() {
  const db = await getDB();
  const results = await db.getAllAsync(
    "SELECT * FROM readings WHERE (synced_at IS NULL OR synced_at = '') AND server_id IS NULL ORDER BY created_at ASC"
  );
  return results.map(row => ({
    id: row.id,
    systolic: row.systolic,
    diastolic: row.diastolic,
    heart_rate: row.heart_rate,
    medication_used: row.medication_used,
    medication_name: row.medication_name,
    symptoms: row.symptoms,
    notes: row.notes,
    arm: row.arm,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function saveReading(reading) {
  const db = await getDB();
  const { id, server_id, ...data } = reading;
  const now = new Date().toISOString();

  if (data.systolic !== undefined && (data.systolic < 20 || data.systolic > 500)) {
    throw new Error(`Valor inválido para pressão sistólica: ${data.systolic}. Deve estar entre 20 e 500 mmHg.`);
  }
  if (data.diastolic !== undefined && (data.diastolic < 10 || data.diastolic > 300)) {
    throw new Error(`Valor inválido para pressão diastólica: ${data.diastolic}. Deve estar entre 10 e 300 mmHg.`);
  }
  if (data.systolic !== undefined && data.diastolic !== undefined && data.systolic <= data.diastolic) {
    throw new Error(`A pressão sistólica (${data.systolic}) deve ser maior que a diastólica (${data.diastolic}).`);
  }
  if (data.heart_rate !== undefined && (data.heart_rate < 20 || data.heart_rate > 300)) {
    throw new Error(`Valor inválido para frequência cardíaca: ${data.heart_rate}. Deve estar entre 20 e 300 bpm.`);
  }

  if (id && server_id) {
    await db.runAsync(
      `UPDATE readings SET systolic = ?, diastolic = ?, heart_rate = ?, medication_used = ?, medication_name = ?, symptoms = ?, notes = ?, arm = ?, updated_at = ?, synced_at = NULL WHERE server_id = ?`,
      [data.systolic, data.diastolic, data.heart_rate, data.medication_used, data.medication_name, data.symptoms, data.notes, data.arm || null, now, server_id]
    );
    return id;
  } else if (id && !server_id) {
    await db.runAsync(
      `UPDATE readings SET systolic = ?, diastolic = ?, heart_rate = ?, medication_used = ?, medication_name = ?, symptoms = ?, notes = ?, arm = ?, updated_at = ?, synced_at = NULL WHERE id = ?`,
      [data.systolic, data.diastolic, data.heart_rate, data.medication_used, data.medication_name, data.symptoms, data.notes, data.arm || null, now, id]
    );
    return id;
  } else {
    const result = await db.runAsync(
      `INSERT INTO readings (server_id, systolic, diastolic, heart_rate, medication_used, medication_name, symptoms, notes, arm, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [server_id, data.systolic, data.diastolic, data.heart_rate, data.medication_used, data.medication_name, data.symptoms, data.notes, data.arm || null, now, now]
    );
    return result.lastInsertRowId;
  }
}

export async function syncToLocal(readings) {
  const db = await getDB();
  const now = new Date().toISOString();

  for (const reading of readings) {
    let existing = await db.getAllAsync('SELECT * FROM readings WHERE server_id = ?', [reading.id]);

    if (existing.length > 0) {
      const localId = existing[0].id;
      await db.runAsync(
        `UPDATE readings SET systolic = ?, diastolic = ?, heart_rate = ?, medication_used = ?, medication_name = ?, symptoms = ?, notes = ?, arm = ?, updated_at = ?, synced_at = ?, server_id = ? WHERE id = ?`,
        [
          reading.systolic,
          reading.diastolic,
          reading.heart_rate,
          reading.medication_used,
          reading.medication_name,
          reading.symptoms,
          reading.notes,
          reading.arm || null,
          reading.updated_at || now,
          now,
          reading.id,
          localId,
        ]
      );
    } else {
      await db.runAsync(
        `INSERT INTO readings (server_id, systolic, diastolic, heart_rate, medication_used, medication_name, symptoms, notes, arm, created_at, updated_at, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reading.id,
          reading.systolic,
          reading.diastolic,
          reading.heart_rate,
          reading.medication_used,
          reading.medication_name,
          reading.symptoms,
          reading.notes,
          reading.arm || null,
          reading.created_at,
          reading.updated_at,
          now,
        ]
      );
    }
  }
}

export async function markSynced(localId, serverId) {
  const db = await getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE readings SET synced_at = ?, server_id = ? WHERE id = ?',
    [now, serverId, localId]
  );
}

export async function deleteLocalReading(id) {
  const db = await getDB();
  await db.runAsync('DELETE FROM readings WHERE id = ?', [id]);
}

export async function deleteLocalReadingByServerId(serverId) {
  const db = await getDB();
  const result = await db.runAsync('DELETE FROM readings WHERE server_id = ?', [serverId]);
  return result.changes;
}

export async function clearLocalData() {
  const db = await getDB();
  await db.runAsync('DELETE FROM readings');
}
