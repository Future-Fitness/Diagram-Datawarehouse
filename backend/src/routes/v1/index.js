const express = require('express');
const router = express.Router();
const multer = require('multer');

const { ImageController } = require('../../controllers');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});



router.post('/analyze', upload.single('image'), ImageController.analyzeAndUploadImage);
router.get('/getAllImages', ImageController.getAllImages);



// router.post('/createDiagramType')
// router.post('/createSubjectType')
// router.get('/digramTypes')
// router.get('/SubjectTypes')

module.exports = router;