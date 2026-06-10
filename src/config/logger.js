const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

const { combine, timestamp, errors, json, colorize, printf } = format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ timestamp: ts, level, message, stack }) =>
    stack
      ? `[${ts}] ${level}: ${message}\n${stack}`
      : `[${ts}] ${level}: ${message}`
  )
);

const activeTransports = [new transports.Console({ format: consoleFormat })];

// File transports are only used locally — Vercel's filesystem is read-only
if (!process.env.VERCEL) {
  const logsDir = path.resolve(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  const fileFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  );

  activeTransports.push(
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    })
  );
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: activeTransports,
});

module.exports = logger;
