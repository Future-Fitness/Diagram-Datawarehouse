// backend/src/models/Diagram.js
const mongoose = require("mongoose");

const DiagramSchema = new mongoose.Schema({
  // Basic fields
  image_url: { type: String, required: true }, // S3 or Cloud storage URL
  filename: { type: String, required: true },
  upload_date: { type: Date, default: Date.now },
  title: { type: String, required: true }, 
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
  diagramTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "DiagramType", required: true, index: true },
  sub_category: { type: String, default: "General" },
  sourceType: { type: String, required: true },
  pageNumber: { type: Number, required: false },
  author: { type: String, required: false },
  notes: { type: String, required: false },
  
  // Categorization fields
  subjects: [{ type: String, required: true }],
  tags: [{ type: String }],

  // Processing status fields
  processing_status: { 
    type: String, 
    enum: ["pending", "processing", "completed", "failed"], 
    default: "pending",
    index: true 
  },
  processing_started_at: { type: Date },
  processing_completed_at: { type: Date },
  processing_attempts: { type: Number, default: 0 },
  processing_error: { type: String },

  // Metadata extraction
  file_info: {
    file_size_mb: { type: Number, required: true },
    format: { type: String, required: true },
    resolution: { type: String, required: true },
    dimensions: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      megapixels: { type: Number, required: true },
    },
  },

  // Extracted symbols
  extracted_symbols: [
    {
      symbol: { type: String },
    },
  ],

  // Color analysis
  color_analysis: {
    dominant_colors: [[Number]],
    color_distribution: {
      mean_rgb: { type: [Number], default: [128, 128, 128] },
      mean_hsv: { type: [Number], default: [0, 0, 128] },
      mean_lab: { type: [Number], default: [50, 0, 0] },
      std_rgb: { type: [Number], default: [50, 50, 50] },
    },
  },
  
  // Quality scores - modified to have defaults
  quality_scores: {
    overall_quality: { type: Number, default: 50 },
    blur_score: { type: Number, default: 50 },
    brightness_score: { type: Number, default: 50 },
    contrast_score: { type: Number, default: 50 },
    detail_score: { type: Number, default: 50 },
    edge_density: { type: Number, default: 0.5 },
    noise_level: { type: Number, default: 5 },
    sharpness: { type: Number, default: 50 },
  },

  quality_rating: { type: String, enum: ["Low", "Medium", "High"], required: true, default: "Medium" },
  extracted_text: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
});

// Add indexes for common queries
DiagramSchema.index({ processing_status: 1, created_at: -1 });
DiagramSchema.index({ subjectId: 1, processing_status: 1 });
DiagramSchema.index({ extracted_text: "text" });

module.exports = mongoose.model("Diagram", DiagramSchema);