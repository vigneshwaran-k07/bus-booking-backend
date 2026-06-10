const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error'
                : res.statusCode >= 400 ? 'warn'
                : 'info';

    logger[level](`${req.method} ${req.originalUrl} ${res.statusCode} (${ms}ms)`, {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      ms,
    });
  });

  next();
};

module.exports = requestLogger;
