const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    logger.info(`Connected to MongoDB: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}

module.exports = { connectMongoDB };
