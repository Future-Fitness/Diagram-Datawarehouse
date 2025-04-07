const connectMongoDB = require('./src/config/database');
const { dequeueMessage } = require('./src/queues/queueManager');
const { processMessage } = require('./imageProcessor');
const { logger } = require('./src/utils/logger');


async function startWorker() {
    try {
        await connectMongoDB();
        logger.info('Worker started and ready to process messages');

        while (true) {
            const message = await dequeueMessage();
            if (message) {
                await processMessage(message);
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    } catch (error) {
        logger.error('Fatal worker error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    startWorker();
}
