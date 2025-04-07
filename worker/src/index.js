// worker/image-processor.js
require('dotenv').config();
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const Redis = require('ioredis');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');

// Setup logger
const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ level, message, timestamp, error }) => {
            return `${timestamp} : ${level}: ${message} ${error ? error.stack : ''}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: path.join('logs', 'worker.log') })
    ],
});

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Configure Redis client
const redis = new Redis({
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
});

redis.on('connect', () => {
    logger.info('Connected to Redis');
});

redis.on('error', (err) => {
    logger.error('Redis connection error:', err);
});

// Configure MongoDB
const MONGODB_URL = process.env.MONGODB_URL;
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://image-analysis:5001';
const QUEUE_NAME = 'image-analysis-queue';
const TEMP_DIR = path.join(__dirname, 'temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Define Diagram schema to match your backend model
const DiagramSchema = new mongoose.Schema({
    image_url: { type: String, required: true },
    filename: { type: String, required: true },
    title: { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    diagramTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "DiagramType", required: true },
    sourceType: { type: String, required: true },
    
    // Processing fields
    processing_status: { 
        type: String, 
        enum: ["pending", "processing", "completed", "failed"], 
        default: "pending" 
    },
    processing_started_at: { type: Date },
    processing_completed_at: { type: Date },
    processing_attempts: { type: Number, default: 0 },
    processing_error: { type: String },
    
    // Other existing fields
    file_info: {
        file_size_mb: { type: Number },
        format: { type: String },
        resolution: { type: String },
        dimensions: {
            width: { type: Number },
            height: { type: Number },
            megapixels: { type: Number },
        },
    },
    extracted_text: { type: String },
    extracted_symbols: [{ symbol: { type: String } }],
    color_analysis: {
        dominant_colors: [[Number]],
        color_distribution: {
            mean_rgb: { type: [Number] },
            mean_hsv: { type: [Number] },
            mean_lab: { type: [Number] },
            std_rgb: { type: [Number] },
        },
    },
    quality_scores: {
        overall_quality: { type: Number },
        blur_score: { type: Number },
        brightness_score: { type: Number },
        contrast_score: { type: Number },
        detail_score: { type: Number },
        edge_density: { type: Number },
        noise_level: { type: Number },
        sharpness: { type: Number },
    },
    quality_rating: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    created_at: { type: Date, default: Date.now },
});

const Diagram = mongoose.model('Diagram', DiagramSchema);

/**
 * Connect to MongoDB
 */
async function connectMongoDB() {
    try {
        await mongoose.connect(MONGODB_URL);
        logger.info(`Connected to MongoDB: ${mongoose.connection.host}`);
    } catch (error) {
        logger.error('MongoDB connection failed:', error);
        process.exit(1);
    }
}

/**
 * Add a message to the processing queue
 */
async function enqueueMessage(message) {
    await redis.lpush(QUEUE_NAME, JSON.stringify(message));
    logger.info(`Added message to queue: ${message.diagramId}`);
}

/**
 * Get a message from the processing queue
 */
async function dequeueMessage() {
    const result = await redis.brpop(QUEUE_NAME, 5);
    if (!result) return null;
    
    try {
        return JSON.parse(result[1]);
    } catch (error) {
        logger.error('Error parsing message from queue:', error);
        return null;
    }
}

/**
 * Process a single message from the queue
 */
async function processMessage(message) {
    const { diagramId, s3Key } = message;
    logger.info(`Processing diagram ${diagramId} with S3 key ${s3Key}`);
    
    try {
        // 1. Update diagram status to processing
        const diagram = await Diagram.findByIdAndUpdate(
            diagramId,
            {
                processing_status: 'processing',
                processing_started_at: new Date(),
                $inc: { processing_attempts: 1 }
            },
            { new: true }
        );
        
        if (!diagram) {
            logger.error(`Diagram ${diagramId} not found`);
            return;
        }
        
        // 2. Download image from S3
        const tempFilePath = path.join(TEMP_DIR, `${Date.now()}-${diagram.filename}`);
        
        const s3Object = await s3.getObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: s3Key
        }).promise();
        
        // Write to temp file
        fs.writeFileSync(tempFilePath, s3Object.Body);
        
        // 3. Prepare request to Flask API
        const formData = new FormData();
        formData.append('image', fs.createReadStream(tempFilePath), {
            filename: diagram.filename,
            contentType: diagram.file_info.format || 'image/jpeg'
        });
        
        // 4. Call Flask API for analysis
        const flaskResponse = await axios.post(`${FLASK_API_URL}/analyze`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60000 // 60 second timeout
        });
        
        // 5. Process analysis results
        const analysisData = flaskResponse.data;
        
        // Safely access nested values
        const safeGet = (obj, path, defaultValue) => {
            try {
                const parts = path.split('.');
                let current = obj;
                
                for (const part of parts) {
                    current = current[part];
                    if (current === undefined || current === null) return defaultValue;
                }
                
                return current;
            } catch (error) {
                return defaultValue;
            }
        };
        
        // 6. Prepare update data
        const updateData = {
            processing_status: 'completed',
            processing_completed_at: new Date(),
            processing_error: null,
            
            // Extract quality data
            quality_rating: safeGet(analysisData, 'quality_rating', 'Medium'),
            quality_scores: {
                overall_quality: safeGet(analysisData, 'quality_scores.overall_quality', 50),
                blur_score: safeGet(analysisData, 'quality_scores.blur_score', 50),
                brightness_score: safeGet(analysisData, 'quality_scores.brightness_score', 50),
                contrast_score: safeGet(analysisData, 'quality_scores.contrast_score', 50),
                detail_score: safeGet(analysisData, 'quality_scores.detail_score', 50),
                edge_density: safeGet(analysisData, 'quality_scores.edge_density', 0.5),
                noise_level: safeGet(analysisData, 'quality_scores.noise_level', 5),
                sharpness: safeGet(analysisData, 'quality_scores.sharpness', 50)
            },
            
            // Extract file info
            file_info: {
              file_size_mb: diagram.file_info.file_size_mb,
              format: diagram.file_info.format,
              // Ensure resolution is a string
              resolution: (() => {
                  // Get dimensions safely
                  const width = safeGet(analysisData, 'basic_metrics.dimensions.width', 800);
                  const height = safeGet(analysisData, 'basic_metrics.dimensions.height', 600);
                  // Format as a string
                  return `${width}x${height}`;
              })(),
              dimensions: {
                  width: safeGet(analysisData, 'basic_metrics.dimensions.width', 800),
                  height: safeGet(analysisData, 'basic_metrics.dimensions.height', 600),
                  megapixels: safeGet(analysisData, 'basic_metrics.dimensions.megapixels', 0.48)
              }
          },
            
            // Extract text and symbols
            extracted_text: safeGet(analysisData, 'text_result', ''),
            extracted_symbols: (safeGet(analysisData, 'symbols_result', []) || []).map(symbol => ({ symbol })),
            
            // Extract color analysis
            color_analysis: {
                dominant_colors: safeGet(analysisData, 'color_analysis.color_stats.dominant_colors', []),
                color_distribution: {
                    mean_rgb: safeGet(analysisData, 'color_analysis.color_distribution.mean_rgb', [128, 128, 128]),
                    mean_hsv: safeGet(analysisData, 'color_analysis.color_distribution.mean_hsv', [0, 0, 128]),
                    mean_lab: safeGet(analysisData, 'color_analysis.color_distribution.mean_lab', [50, 0, 0]),
                    std_rgb: safeGet(analysisData, 'color_analysis.color_distribution.std_rgb', [50, 50, 50])
                }
            }
        };
        
        // 7. Update diagram record with analysis results
        await Diagram.findByIdAndUpdate(diagramId, updateData);
        
        logger.info(`Successfully processed diagram ${diagramId}`);
        
    } catch (error) {
        logger.error(`Error processing diagram ${diagramId}:`, error);
        
        // Update diagram with error status
        await Diagram.findByIdAndUpdate(diagramId, {
            processing_status: 'failed',
            processing_error: error.message
        });
        
        // Implement retry logic if appropriate
        const diagram = await Diagram.findById(diagramId);
        if (diagram && diagram.processing_attempts < 3) {
            logger.info(`Requeuing diagram ${diagramId} for retry (attempt ${diagram.processing_attempts})`);
            await enqueueMessage(message);
        }
    } finally {
        // Clean up temp files
        const tempFiles = fs.readdirSync(TEMP_DIR);
        for (const file of tempFiles) {
            try {
                fs.unlinkSync(path.join(TEMP_DIR, file));
            } catch (error) {
                logger.error(`Error deleting temp file ${file}:`, error);
            }
        }
    }
}

/**
 * Main worker function that continuously processes queue messages
 */
async function startWorker() {
    try {
        // Connect to MongoDB
        await connectMongoDB();
        
        logger.info('Worker started and ready to process messages');
        
        // Process messages continuously
        while (true) {
            try {
                // Get message from queue (with 5-second timeout)
                const message = await dequeueMessage();
                
                if (message) {
                    logger.info(`Received message for diagram ${message.diagramId}`);
                    await processMessage(message);
                }
                
                // Small delay to prevent tight loop if queue is empty
                if (!message) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (processingError) {
                logger.error('Error in message processing loop:', processingError);
                // Continue processing next message after a delay
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    } catch (error) {
        logger.error('Fatal worker error:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Worker shutting down...');
    
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
        
        await redis.quit();
        logger.info('Redis connection closed');
    } catch (error) {
        logger.error('Error during shutdown:', error);
    }
    
    process.exit(0);
});

// Start the worker if this file is run directly
if (require.main === module) {
    startWorker().catch(error => {
        logger.error('Failed to start worker:', error);
        process.exit(1);
    });
}

module.exports = { processMessage, startWorker };