const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const TEMP_DIR = path.join(__dirname, '../temp');

function cleanTempDir() {
  const files = fs.readdirSync(TEMP_DIR);
  for (const file of files) {
    try {
      fs.unlinkSync(path.join(TEMP_DIR, file));
    } catch (err) {
      logger.error(`Failed to delete temp file ${file}`, err);
    }
  }
}

module.exports = { cleanTempDir };
