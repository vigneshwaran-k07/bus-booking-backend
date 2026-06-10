const logger = require('../config/logger');

const PG_ERRORS = {
  '23505': { status: 409, message: 'Duplicate entry — seat already exists' },
  '22P02': { status: 400, message: 'Invalid ID format' },
  '42703': { status: 500, message: 'Database column missing — run: npm run migrate' },
  '23514': { status: 400, message: 'Value violates a database constraint' },
};

const errorHandler = (err, req, res, _next) => {
  const pgMapped = err.code ? PG_ERRORS[err.code] : null;

  const status = pgMapped?.status ?? err.status ?? 500;
  const isServerError = status >= 500;

  // Always log full detail — stack trace goes to error.log
  logger.error(`${req.method} ${req.originalUrl} → ${status}`, {
    message: err.message,
    code: err.code,
    stack: err.stack,
    body: req.body,
  });

  const message = pgMapped?.message
    ?? (isServerError ? 'Internal server error' : err.message);

  // In development expose the raw DB message so it's easier to debug in Postman
  const detail =
    process.env.NODE_ENV !== 'production' && isServerError
      ? err.message
      : undefined;

  res.status(status).json({
    success: false,
    data: null,
    message,
    ...(detail && { detail }),
  });
};

module.exports = errorHandler;
