// backend/src/controllers/Image-controller.js
const { s3, getCloudFrontUrl } = require('../config/S3-config');
const Diagram = require("../models/Diagram");
const queueService = require('../services/queue-service');
const logger = require('../config/logger-config');

/**
 * Handles image upload and queues it for analysis
 */
const analyzeAndUploadImage = async (req, res) => {
    try {
        // Check if image file exists
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No image file provided' 
            });
        }

        // Extract metadata from request
        const metaData = req.body;
        
        // Validate required fields
        if (!metaData.subjectId || !metaData.diagramTypeId) {
            return res.status(400).json({
                success: false,
                error: 'Required fields missing: subjectId and diagramTypeId are required'
            });
        }

        try {
            // 1. Upload the image to S3 first
            const s3Key = `uploads/${Date.now()}-${req.file.originalname}`;
            
            const s3Upload = await s3.upload({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: s3Key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            }).promise();

            logger.info(`Image uploaded to S3: ${s3Upload.Key}`);
            
            // Generate public URL
            const imageUrl = getCloudFrontUrl(s3Key);
            
            // 2. Create preliminary record in database with default quality scores
            const preliminaryData = {
                image_url: imageUrl,
                filename: req.file.originalname,
                title: metaData.title || "Untitled Diagram",
                subjectId: metaData.subjectId,
                diagramTypeId: metaData.diagramTypeId,
                sourceType: metaData.sourceType || "Unknown",
                pageNumber: metaData.pageNumber ? parseInt(metaData.pageNumber, 10) : null,
                author: metaData.author || "Unknown",
                notes: metaData.notes || "",
                subjects: metaData.subjects || [],
                category: metaData.category || "Uncategorized",
                sub_category: metaData.sub_category || "",
                tags: metaData.tags || [],
                processing_status: "pending",
                
                // Initial file info with placeholder values for dimensions
                file_info: {
                    file_size_mb: (req.file.size / (1024 * 1024)).toFixed(2),
                    format: req.file.mimetype,
                    resolution: "Unknown",
                    dimensions: {
                        width: 800,
                        height: 600,
                        megapixels: 0.48
                    }
                },
                
                // Add default quality scores to satisfy schema requirements
                quality_scores: {
                    overall_quality: 50,
                    blur_score: 50,
                    brightness_score: 50,
                    contrast_score: 50,
                    detail_score: 50,
                    edge_density: 0.5,
                    noise_level: 5,
                    sharpness: 50
                },
                
                // Initial placeholder for color analysis
                color_analysis: {
                    dominant_colors: [[128, 128, 128]],
                    color_distribution: {
                        mean_rgb: [128, 128, 128],
                        mean_hsv: [0, 0, 128],
                        mean_lab: [50, 0, 0],
                        std_rgb: [50, 50, 50]
                    }
                }
            };
            
            const diagram = new Diagram(preliminaryData);
            await diagram.save();
            
            logger.info(`Created preliminary diagram record: ${diagram._id}`);
            
            // 3. Queue the image for background processing
            const queueSuccess = await queueService.queueImageAnalysis(
                diagram._id.toString(),
                s3Key,
                {
                    filename: req.file.originalname,
                    fileSize: req.file.size,
                    fileType: req.file.mimetype
                }
            );
            
            if (!queueSuccess) {
                logger.warn(`Failed to queue diagram ${diagram._id} for analysis`);
            }
            
            // 4. Return immediate response with diagram details
            return res.status(200).json({
                success: true,
                message: "Image uploaded and queued for analysis",
                data: {
                    diagramId: diagram._id,
                    imageUrl: imageUrl,
                    status: "pending",
                    processingMessage: "Your image is being analyzed. Check back in a few moments."
                }
            });
            
        } catch (uploadError) {
            logger.error('Error during upload process:', uploadError);
            return res.status(500).json({
                success: false,
                error: 'Failed to process upload',
                message: uploadError.message
            });
        }
        
    } catch (error) {
        logger.error('Unhandled exception in image upload:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

/**
 * Get analysis status for a diagram
 */
const getDiagramStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const diagram = await Diagram.findById(id).select('processing_status processing_error processing_started_at processing_completed_at');
        
        if (!diagram) {
            return res.status(404).json({
                success: false,
                error: 'Diagram not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            status: diagram.processing_status,
            started: diagram.processing_started_at,
            completed: diagram.processing_completed_at,
            error: diagram.processing_error
        });
        
    } catch (error) {
        logger.error(`Error fetching diagram status for ${req.params.id}:`, error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch diagram status'
        });
    }
};

/**
 * Get all images from the database
 */
const getAllImages = async (req, res) => {
    try {
        const results = await Diagram.find({ image_url: { $exists: true } });
        return res.status(200).json({ 
            success: true,
            results 
        });
    } catch (error) {
        logger.error("Error fetching images:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch images",
            message: error.message
        });
    }
};

/**
 * Get diagrams with filtering
 */
const getDiagrams = async (req, res) => {
    try {
        const {
            text,
            quality,
            subjectId,
            diagramTypeId,
            tag,
            minQualityScore,
            status,
            limit = 20,
            page = 1,
        } = req.query;

        const query = {};

        if (text) {
            query.extracted_text = { $regex: text, $options: "i" };
        }

        if (quality) {
            query.quality_rating = quality;
        }

        if (subjectId) {
            query.subjectId = subjectId;
        }

        if (diagramTypeId) {
            query.diagramTypeId = diagramTypeId;
        }

        if (tag) {
            query.tags = tag;
        }
        
        if (status) {
            query.processing_status = status;
        }

        if (minQualityScore) {
            query["quality_scores.overall_quality"] = { $gte: parseFloat(minQualityScore) };
        }

        try {
            const diagrams = await Diagram.find(query)
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .sort({ created_at: -1 });

            const total = await Diagram.countDocuments(query);

            res.json({
                success: true,
                page: Number(page),
                limit: Number(limit),
                total,
                diagrams,
            });
        } catch (dbError) {
            logger.error("Database error:", dbError);
            return res.status(500).json({ 
                success: false, 
                message: "Database Error", 
                error: dbError.message 
            });
        }

    } catch (err) {
        logger.error(err);
        res.status(500).json({ 
            success: false, 
            message: "Server Error",
            error: err.message
        });
    }
};

/**
 * Get queue statistics for admin purposes
 */
const getQueueStats = async (req, res) => {
    try {
        const stats = await queueService.getQueueStats();
        
        return res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        logger.error('Error getting queue stats:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve queue statistics'
        });
    }
};

module.exports = {
    analyzeAndUploadImage,
    getAllImages,
    getDiagrams,
    getDiagramStatus,
    getQueueStats
};