const mongoose = require("mongoose");

const DiagramTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true }, // E.g., "Mathematics", "Science"
  description: { type: String },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DiagramType", DiagramTypeSchema);
