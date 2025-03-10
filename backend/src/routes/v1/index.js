const express = require('express');
const router = express.Router();
const multer = require('multer');
const { InfoController } = require('../../controllers');
const { ImageController } = require('../../controllers');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

router.get('/info', InfoController.info);

router.post('/analyze', upload.single('image'), ImageController.analyzeAndUploadImage);

module.exports = router;