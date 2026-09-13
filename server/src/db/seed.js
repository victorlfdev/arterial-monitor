const { getDb } = require('./database');

async function ensureSeeded() {
  await getDb();
  console.log('Database initialized and seeded (handled by database.js init)');
}

ensureSeeded();
