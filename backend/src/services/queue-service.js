// backend/src/services/queue-service.js
const Redis = require('ioredis');
const logger = require('../config/logger-config');

// Queue name constants
const QUEUE_NAMES = {
    IMAGE_ANALYSIS: 'image-analysis-queue'
};

// Initialize Redis client with connection details from environment
const redis = new Redis({
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
});

// Connection event handlers
redis.on('connect', () => {
    logger.info('Redis queue service connected');
});

redis.on('error', (err) => {
    logger.error('Redis queue service error:', err);
});

/**
 * Add an image analysis job to the queue
 * @param {string} diagramId - MongoDB ID of the diagram
 * @param {string} s3Key - S3 key where the image is stored
 * @param {object} metadata - Additional metadata for processing
 * @returns {Promise<boolean>} - Success status
 */
async function queueImageAnalysis(diagramId, s3Key, metadata = {}) {
    try {
        const message = {
            diagramId,
            s3Key,
            metadata,
            timestamp: Date.now()
        };
        
        await redis.lpush(QUEUE_NAMES.IMAGE_ANALYSIS, JSON.stringify(message));
        logger.info(`Added diagram ${diagramId} to analysis queue`);
        return true;
    } catch (error) {
        logger.error(`Error queueing diagram ${diagramId} for analysis:`, error);
        return false;
    }
}

/**
 * Get queue statistics
 * @returns {Promise<object>} - Queue statistics
 */
async function getQueueStats() {
    try {
        const pendingJobs = await redis.llen(QUEUE_NAMES.IMAGE_ANALYSIS);
        
        return {
            pendingJobs,
            queueName: QUEUE_NAMES.IMAGE_ANALYSIS,
            status: 'active'
        };
    } catch (error) {
        logger.error('Error getting queue statistics:', error);
        return {
            error: 'Failed to retrieve queue statistics',
            status: 'error'
        };
    }
}

/**
 * Clear a queue (for administrative purposes)
 * @param {string} queueName - Name of the queue to clear
 * @returns {Promise<boolean>} - Success status
 */
async function clearQueue(queueName) {
    try {
        if (!QUEUE_NAMES[queueName]) {
            throw new Error(`Invalid queue name: ${queueName}`);
        }
        
        await redis.del(QUEUE_NAMES[queueName]);
        logger.info(`Cleared queue: ${QUEUE_NAMES[queueName]}`);
        return true;
    } catch (error) {
        logger.error(`Error clearing queue ${queueName}:`, error);
        return false;
    }
}

module.exports = {
    queueImageAnalysis,
    getQueueStats,
    clearQueue,
    QUEUE_NAMES
};