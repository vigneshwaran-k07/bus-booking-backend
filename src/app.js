require('dotenv').config();
require('./events/ticketListeners');

const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req, res) => {
  res.json({ success: true, data: null, message: 'Server is healthy' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found' });
});

app.use(errorHandler);

if (process.env.VERCEL !== '1') {
  const start = async () => {
    try {
      await pool.query('SELECT 1');
      logger.info('PostgreSQL connected');
      app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
    } catch (err) {
      logger.error('Failed to connect to PostgreSQL', { message: err.message, stack: err.stack });
      process.exit(1);
    }
  };
  start();
}

module.exports = app;
