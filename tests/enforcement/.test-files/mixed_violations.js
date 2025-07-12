const winston = require('winston');
const logger = winston.createLogger();

function goodFunction() {
  logger.info("This is good");
}

function badFunction() {
  console.log("This is bad");
  console.error("Multiple violations");
}