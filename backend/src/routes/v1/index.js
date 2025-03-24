const express = require("express");
const router = express.Router();
const multer = require("multer");
const diagramSearchController = require('../../controllers/diagramSearchController');

const { ImageController } = require("../../controllers");
const { CreateCategory } = require("../../controllers");
const { DiagramController } = require("../../controllers");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post(
  "/analyze",
  upload.single("image"),
  ImageController.analyzeAndUploadImage
);
router.get("/getAllImages", ImageController.getAllImages);

router.post("/createDiagramType", DiagramController.createDiagramType);
router.post("/createSubjectType", CreateCategory.createSubjectType);
router.get("/diagramTypes", DiagramController.getAllDiagramsType);
router.get("/SubjectTypes", CreateCategory.getAllSubjectType);

// Basic text search with filters
router.get('/diagram', diagramSearchController.searchDiagrams);

// Advanced search with complex filtering options
router.post('/diagram/advanced', diagramSearchController.advancedSearch);

// Autocomplete suggestions
router.get('/diagram/autocomplete', diagramSearchController.getAutocompleteSuggestions);

// Find similar
router.get('/diagram/:diagramId/similar', diagramSearchController.findSimilarDiagrams);




module.exports = router;
