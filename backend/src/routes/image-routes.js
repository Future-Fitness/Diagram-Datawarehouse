const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeAndUploadImage } = require('../controllers/Image-controller');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Route for image upload and analysis
router.post('/analyze', upload.single('image'), analyzeAndUploadImage);

module.exports = router; 