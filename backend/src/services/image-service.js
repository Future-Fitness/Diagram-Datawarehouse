// imageService.js
const axios = require('axios');
const FormData = require('form-data');
const { s3, getCloudFrontUrl } = require('../config/S3-config');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5001';
async function saveAnalysisData(imageData, analysisData) {
    try {
      // Save file record in DimFile
      const fileRecord = await prisma.dimFile.create({
        data: {
          fileName: imageData.fileName,
          fileSize: imageData.fileSize,
          resolution: imageData.resolution,
          imageUrl: imageData.imageUrl,
          format: imageData.format,
          metadata: imageData.metadata || null,
        },
      });
  
      // Create FactDiagram record referencing the new file along with provided foreign keys.
      const factDiagramRecord = await prisma.factDiagram.create({
        data: {
          fileId: fileRecord.id,
          subjectId: analysisData.subjectId,
          diagramTypeId: analysisData.diagramTypeId,
          sourceId: analysisData.sourceId,
          // storageDate is automatically set via default(now())
        },
      });
  
      return factDiagramRecord;
    } catch (error) {
      console.error('Error saving analysis data:', error);
      throw error;
    }
  }
const processImage = async (file, analysisData) => {
  if (!file) {
    throw new Error('No image file provided');
  }

  // 1. Analyze image using Flask API
  const formData = new FormData();
  formData.append('image', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });
  const flaskResponse = await axios.post(`${FLASK_API_URL}/analyze`, formData, {
    headers: formData.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 30000,
  });

  // 2. Upload to S3 (example using AWS SDK directly)
  const s3Client = new AWS.S3();
  const s3Key = `uploads/${Date.now()}-${file.originalname}`;
  const s3Upload = await s3Client
    .upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    })
    .promise();

  // 3. Prepare data for insertion into PostgreSQL
  const imageData = {
    fileName: file.originalname,
    fileSize: file.size,
    resolution: '1920x1080', // Replace with dynamic resolution if needed
    imageUrl: getCloudFrontUrl(s3Key),
    format: file.mimetype,
    metadata: null, // Add metadata if available
  };



    const savedData = await saveAnalysisData(imageData, analysisData);

  // 3. Combine analysis results and file URL
  const response = {
    imageUrl: getCloudFrontUrl(s3Key),
    analysis: flaskResponse.data,
    uploadInfo: {
      bucket: s3Upload.Bucket,
      key: s3Upload.Key,
      location: s3Upload.Location,
    },
    dbRecord: savedData,
  };

  return response;
};


/**
 * Saves analysis data and image file information into PostgreSQL.
 * @param {Object} imageData - Details about the image file.
 *   Example: { fileName, fileSize, resolution, imageUrl, format, metadata }
 * @param {Object} analysisData - IDs for foreign keys; extra analysis data can be stored separately.
 *   Example: { subjectId, diagramTypeId, sourceId }
 * @returns {Object} Newly created FactDiagram record.
 */

module.exports = {
  processImage,
    saveAnalysisData,
};