const mongoose = require('mongoose');

const DiagramSchema = new mongoose.Schema({
    image_url: { type: String, required: true },
    filename: { type: String, required: true },
    title: { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    diagramTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "DiagramType", required: true },
    sourceType: { type: String, required: true },
    processing_status: { 
        type: String, 
        enum: ["pending", "processing", "completed", "failed"], 
        default: "pending" 
    },
    processing_started_at: { type: Date },
    processing_completed_at: { type: Date },
    processing_attempts: { type: Number, default: 0 },
    processing_error: { type: String },
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

module.exports = mongoose.model('Diagram', DiagramSchema);