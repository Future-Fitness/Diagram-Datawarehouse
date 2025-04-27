const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ level, message, timestamp, error }) =>
      `${timestamp} : ${level}: ${message} ${error ? error.stack : ''}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join('logs', 'worker.log') }),
  ],
});

module.exports = { logger };
