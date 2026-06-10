const pool = require('../config/db');

const ticketModel = {
  async findAll() {
    const { rows } = await pool.query(
      'SELECT * FROM tickets ORDER BY seat_number ASC'
    );
    return rows;
  },

  async findByStatus(status) {
    const { rows } = await pool.query(
      'SELECT * FROM tickets WHERE status = $1 ORDER BY seat_number ASC',
      [status]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async update(id, fields) {
    const { status, first_name, last_name, email, gender, isNewBooking } = fields;

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (status === 'open') {
      // Cancel: always wipe passenger fields regardless of what was sent
      setClauses.push(`first_name = NULL`);
      setClauses.push(`last_name = NULL`);
      setClauses.push(`email = NULL`);
      setClauses.push(`gender = NULL`);
      setClauses.push(`booked_at = NULL`);
    } else {
      // Book or update: apply only the fields that were provided
      if (first_name !== undefined) {
        setClauses.push(`first_name = $${paramIndex++}`);
        values.push(first_name);
      }
      if (last_name !== undefined) {
        setClauses.push(`last_name = $${paramIndex++}`);
        values.push(last_name);
      }
      if (email !== undefined) {
        setClauses.push(`email = $${paramIndex++}`);
        values.push(email);
      }
      if (gender !== undefined) {
        setClauses.push(`gender = $${paramIndex++}`);
        values.push(gender);
      }
      if (isNewBooking) {
        setClauses.push(`booked_at = NOW()`);
      }
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE tickets
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  },

  async resetAll() {
    const { rows } = await pool.query(`
      UPDATE tickets
      SET status = 'open',
          first_name = NULL,
          last_name = NULL,
          email = NULL,
          gender = NULL,
          booked_at = NULL,
          updated_at = NOW()
      RETURNING *
    `);
    return rows;
  },
};

module.exports = ticketModel;
