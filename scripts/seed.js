require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool = require('../src/config/db');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id          SERIAL PRIMARY KEY,
        seat_number INTEGER NOT NULL UNIQUE CHECK (seat_number BETWEEN 1 AND 40),
        status      VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
        first_name  VARCHAR(100),
        last_name   VARCHAR(100),
        email       VARCHAR(255),
        gender      VARCHAR(10) CHECK (gender IN ('male', 'female')),
        booked_at   TIMESTAMP,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Idempotent: add gender column if the table already existed without it
    await client.query(`
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female'))
    `);

    await client.query('DELETE FROM tickets');

    const inserts = Array.from({ length: 40 }, (_, i) => i + 1)
      .map((seat) => `(${seat}, 'open')`)
      .join(', ');

    await client.query(`INSERT INTO tickets (seat_number, status) VALUES ${inserts}`);

    await client.query('COMMIT');
    console.log('Seed complete: 40 open tickets created');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
