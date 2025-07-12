const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
});

function processData() {
  logger.info('Processing data');
  logger.error('An error occurred');
}