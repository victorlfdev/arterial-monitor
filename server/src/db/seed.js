const db = require('./database');

function seedDatabase() {
  const count = db.prepare('SELECT COUNT(*) as count FROM medications').get();
  if (count.count === 0) {
    const meds = [
      'Losartana',
      'Enalapril',
      'Atenolol',
      'Hidroclorotiazida',
      'Amlodipina',
      'Outro'
    ];

    const insert = db.prepare('INSERT INTO medications (name) VALUES (?)');
    meds.forEach(med => insert.run(med));
    console.log('Medications seeded successfully');
  } else {
    console.log('Database already seeded');
  }
}

seedDatabase();
