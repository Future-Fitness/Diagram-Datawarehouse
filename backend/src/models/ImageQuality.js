const mongoose = require("mongoose");

const ImageQualitySchema = new mongoose.Schema({
    filename: { type: String, required: true },
    file_size_mb: { type: Number, required: true },
    resolution: { type: String, required: true },
    aspect_ratio: { type: Number, required: true },
    uploaded_at: { type: Date, default: Date.now },
    quality_scores: {
        overall_quality: Number,
        blur_score: Number,
        contrast_score: Number,
        brightness_score: Number,
        noise_level: Number,
        sharpness: Number
    },
    tags: [{ type: String }],
    quality_rating: { type: String, enum: ["Low", "Medium", "High"], required: true },
    s3_url: { type: String, required: true }
});

// ✅ Create Indexes for Faster Queries
ImageQualitySchema.index({ uploaded_at: -1 }); // Sort by latest
ImageQualitySchema.index({ quality_rating: 1 }); // Filter by quality
ImageQualitySchema.index({ tags: "text" }); // Full-text search on tags

module.exports = mongoose.model("ImageQuality", ImageQualitySchema);
