// imageProcessor.js
const path = require('path');
const fs = require('fs');
const { logger } = require('../utils/logger');
const Diagram = require('../models/Diagram');
const s3 = require('../config/aws');
const { analyzeImage } = require('../services/flaskClient');
const { enqueueMessage } = require('../queues/queueManager');
const { cleanTempDir } = require('../services/fileService');
// … other imports …
const { extractTextFromBuffer } = require("../../textract");

async function processMessage(message) {
  const { diagramId, s3Key } = message;
  logger.info(`Processing diagram ${diagramId} with S3 key ${s3Key}`);

  try {
    const diagram = await Diagram.findByIdAndUpdate(
      diagramId,
      {
        processing_status: 'processing',
        processing_started_at: new Date(),
        $inc: { processing_attempts: 1 },
      },
      { new: true }
    );

    if (!diagram) {
      logger.error(`Diagram ${diagramId} not found`);
      return;
    }

    const TEMP_DIR = path.join(__dirname, '../temp');
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    const tempFilePath = path.join(TEMP_DIR, `${Date.now()}-${diagram.filename}`);
    const s3Object = await s3.getObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key
    }).promise();

    fs.writeFileSync(tempFilePath, s3Object.Body);


    let awsTextractText = "";
try {
  awsTextractText = await extractTextFromBuffer(s3Object.Body);
  logger.info("✅ Textract extracted:", awsTextractText.slice(0, 120));
} catch (err) {
  logger.warn("❌ Textract failed:", err);
}

    const analysisData = await analyzeImage(
      process.env.FLASK_API_URL,
      tempFilePath,
      diagram.filename,
      diagram.file_info?.format
    );

    const safeGet = (obj, path, defaultValue) => {
      try {
        return path.split('.').reduce((o, k) => (o || {})[k], obj) ?? defaultValue;
      } catch {
        return defaultValue;
      }
    };



    


    const width = safeGet(analysisData, 'basic_metrics.dimensions.width', 800);
    const height = safeGet(analysisData, 'basic_metrics.dimensions.height', 600);

    const updateData = {
      processing_status: 'completed',
      processing_completed_at: new Date(),
      processing_error: null,
      quality_rating: safeGet(analysisData, 'quality_rating', 'Medium'),
      quality_scores: {
        overall_quality: safeGet(analysisData, 'quality_scores.overall_quality', 50),
        blur_score: safeGet(analysisData, 'quality_scores.blur_score', 50),
        brightness_score: safeGet(analysisData, 'quality_scores.brightness_score', 50),
        contrast_score: safeGet(analysisData, 'quality_scores.contrast_score', 50),
        detail_score: safeGet(analysisData, 'quality_scores.detail_score', 50),
        edge_density: safeGet(analysisData, 'quality_scores.edge_density', 0.5),
        noise_level: safeGet(analysisData, 'quality_scores.noise_level', 5),
        sharpness: safeGet(analysisData, 'quality_scores.sharpness', 50),
      },
      file_info: {
        file_size_mb: diagram.file_info.file_size_mb,
        format: diagram.file_info.format,
        resolution: `${width}x${height}`,
        dimensions: {
          width,
          height,
          megapixels: safeGet(analysisData, 'basic_metrics.dimensions.megapixels', 0.48),
        },
      },
      extracted_text:  awsTextractText || {},
      extracted_symbols: (safeGet(analysisData, 'symbols_result', []) || []).map(symbol => ({ symbol })),
      color_analysis: {
        dominant_colors: safeGet(analysisData, 'color_analysis.color_stats.dominant_colors', []),
        color_distribution: {
          mean_rgb: safeGet(analysisData, 'color_analysis.color_distribution.mean_rgb', [128, 128, 128]),
          mean_hsv: safeGet(analysisData, 'color_analysis.color_distribution.mean_hsv', [0, 0, 128]),
          mean_lab: safeGet(analysisData, 'color_analysis.color_distribution.mean_lab', [50, 0, 0]),
          std_rgb: safeGet(analysisData, 'color_analysis.color_distribution.std_rgb', [50, 50, 50]),
        },
      },
    };

    await Diagram.findByIdAndUpdate(diagramId, updateData);
    logger.info(`Successfully processed diagram ${diagramId}`);
  } catch (error) {
    logger.error(`Error processing diagram ${diagramId}:`, error);
    await Diagram.findByIdAndUpdate(diagramId, {
      processing_status: 'failed',
      processing_error: error.message,
    });

    const diagram = await Diagram.findById(diagramId);
    if (diagram && diagram.processing_attempts < 3) {
      logger.info(`Requeuing diagram ${diagramId} for retry (attempt ${diagram.processing_attempts})`);
      await enqueueMessage(message);
    }
  } finally {
    cleanTempDir();
  }
}

module.exports = { processMessage };