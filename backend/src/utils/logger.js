const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    if (!this.isProduction) {
      this.logDir = path.join(__dirname, '../../logs');
      if (!fs.existsSync(this.logDir)) {
        try {
          fs.mkdirSync(this.logDir, { recursive: true });
        } catch (err) {
          console.error('Failed to create log directory:', err.message);
        }
      }
    }
  }

  info(message) {
    this.log('INFO', message);
    console.log(`\x1b[32m[INFO]\x1b[0m ${message}`);
  }

  error(message) {
    this.log('ERROR', message);
    console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`);
  }

  warn(message) {
    this.log('WARN', message);
    console.warn(`\x1b[33m[WARN]\x1b[0m ${message}`);
  }

  log(level, message) {
    if (this.isProduction) return; // Skip file logging in production

    try {
      const logEntry = `${new Date().toISOString()} [${level}] ${message}\n`;
      const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
      fs.appendFileSync(logFile, logEntry);
    } catch (err) {
      // Ignore log file errors to prevent app crash
    }
  }
}

module.exports = new Logger();