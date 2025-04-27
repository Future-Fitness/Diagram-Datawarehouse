require('dotenv').config();
const { connectMongoDB } = require('./config/database');
const { dequeueMessage } = require('./queues/queueManager');
const { processMessage } = require('./services/imageProcessor');
const { logger } = require('./utils/logger');
const redis = require('./config/redis');

async function startWorker() {
  await connectMongoDB();
  logger.info('Worker started');

  while (true) {
    const message = await dequeueMessage();
    if (message) {
      await processMessage(message);
    } else {
      await new Promise(res => setTimeout(res, 1000));
    }
  }
}

process.on('SIGINT', async () => {
  logger.info('Graceful shutdown');
  await redis.quit();
  process.exit(0);
});
if (require.main === module) {
    startWorker();
  }