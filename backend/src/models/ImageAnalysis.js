const mongoose = require("mongoose");

const ImageAnalysisSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    file_size_mb: { type: Number, required: true },
    resolution: { type: String, required: true },
    aspect_ratio: { type: Number, required: true },
    uploaded_at: { type: Date, default: Date.now },
    subject: { type: String, required: true },
    s3_url: { type: String, required: true },
    quality_scores: {
        overall_quality: Number,
        blur_score: Number,
        contrast_score: Number,
        brightness_score: Number,
        noise_level: Number,
        sharpness: Number,
        edge_density: Number,
        detail_score: Number
    },
    chart_analysis: {
        type: Object,
        default: {}
    },
    shapes_detected: {
        circles: Number,
        rectangles: Number,
        lines: Number
    },
    text_analysis: {
        blocks: [{
            text: String,
            confidence: Number
        }],
        total_words: Number,
        average_confidence: Number
    },
    color_analysis: {
        dominant_colors: [[Number]],
        color_contrast: {
            rg_contrast: Number,
            rb_contrast: Number,
            gb_contrast: Number
        }
    },
    grid_detection: Boolean
});

// ✅ Indexing for Faster Queries
ImageAnalysisSchema.index({ uploaded_at: -1 }); // Sort by latest
ImageAnalysisSchema.index({ subject: 1 }); // Query by subject
ImageAnalysisSchema.index({ "text_analysis.blocks.text": "text" }); // Full-text search

module.exports = mongoose.model("ImageAnalysis", ImageAnalysisSchema);
