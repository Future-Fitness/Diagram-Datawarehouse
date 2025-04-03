const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  diagrams: [{ type: mongoose.Schema.Types.ObjectId, ref: "DiagramType" }], // Array of DiagramType references
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subject", SubjectSchema);