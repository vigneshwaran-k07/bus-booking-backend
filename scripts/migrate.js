/**
 * Safe migration — adds new columns without touching existing data.
 * Run: npm run migrate
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool = require('../src/config/db');

const migrations = [
  {
    name: 'add_gender_to_tickets',
    sql: `ALTER TABLE tickets
          ADD COLUMN IF NOT EXISTS gender VARCHAR(10)
          CHECK (gender IN ('male', 'female'))`,
  },
];

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const m of migrations) {
      console.log(`  running: ${m.name}`);
      await client.query(m.sql);
      console.log(`  done:    ${m.name}`);
    }

    await client.query('COMMIT');
    console.log('\nMigration complete — no data was deleted.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
