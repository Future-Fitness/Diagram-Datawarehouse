const mongoose = require("mongoose");

const DiagramSchema = new mongoose.Schema({
  image_url: { type: String, required: true }, // S3 or Cloud storage URL
  filename: { type: String, required: true },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  upload_date: { type: Date, default: Date.now },

  // **Categorization**
  subjects: [{ type: String }], // E.g., ["Mathematics", "Science", "CS"]
  category: { type: String, required: true },
  sub_category: { type: String, default: "General" },
  tags: [{ type: String }],

  // **Metadata Extraction**
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

  // **Mathematical Expressions & Extracted Symbols (Removed Indexing)**
  mathematical_expressions: [
    {
      expression: { type: String }, // ❌ No Indexing
    },
  ],
  extracted_symbols: [
    {
      symbol: { type: String }, // ❌ No Indexing
    },
  ],

  // **Color & Quality Analysis**
  color_analysis: {
    dominant_colors: [[Number]],
    color_distribution: {
      mean_rgb: { type: [Number], required: true },
      mean_hsv: { type: [Number], required: true },
      mean_lab: { type: [Number], required: true },
      std_rgb: { type: [Number], required: true },
    },
  },
  quality_scores: {
    overall_quality: { type: Number, required: true },
    blur_score: { type: Number, required: true },
    brightness_score: { type: Number, required: true },
    contrast_score: { type: Number, required: true },
    detail_score: { type: Number, required: true },
    edge_density: { type: Number, required: true },
    noise_level: { type: Number, required: true },
    sharpness: { type: Number, required: true },
  },

  quality_rating: { type: String, enum: ["Low", "Medium", "High"], required: true, default: "Medium" },

  extracted_text: { type: String },
  related_diagrams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Diagram" }],
  searchable_text: { type: String },

  created_at: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Diagram", DiagramSchema);
