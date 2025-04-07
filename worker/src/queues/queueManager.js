const redis = require('../config/redis');
const QUEUE_NAME = 'image-analysis-queue';

async function enqueueMessage(message) {
  await redis.lpush(QUEUE_NAME, JSON.stringify(message));
}

async function dequeueMessage() {
  const result = await redis.brpop(QUEUE_NAME, 5);
  return result ? JSON.parse(result[1]) : null;
}

module.exports = { enqueueMessage, dequeueMessage };
