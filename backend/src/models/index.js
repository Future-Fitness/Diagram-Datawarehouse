'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

const connectDB = async () => {

  console.log('Attempting to connect to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Import all models with detailed logging
const loadedModels = [];
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const filePath = path.join(__dirname, file);
    const model = require(filePath);
    loadedModels.push(model.modelName);
    db[model.modelName] = model;
    console.log(`Loaded model: ${model.modelName} from file: ${file}`);
  });

console.log(`Total models loaded: ${loadedModels.length}`);
db.mongoose = mongoose;

module.exports = { connectDB, db };