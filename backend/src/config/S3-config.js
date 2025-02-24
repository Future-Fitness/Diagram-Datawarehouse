const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

// AWS Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

// ✅ Function to check S3 connectivity on startup
const checkS3Connection = async () => {
    try {
      const data = await s3.listBuckets().promise();
      console.log("✅ Connected to AWS S3. Buckets:", data.Buckets.map(b => b.Name));
    } catch (error) {
      console.error("❌ Failed to connect to AWS S3:", error);
      process.exit(1);
    }
  };
  
// Multer Setup for Uploads
const upload = multer({
  storage : multer.memoryStorage()
  // storage: multerS3({
  //   s3: s3,
  //   bucket: process.env.S3_BUCKET_NAME,
  //   acl: "public-read", // Allow public access via CloudFront
  //   metadata: (req, file, cb) => {
  //     cb(null, { fieldName: file.fieldname });
  //   },
  //   key: (req, file, cb) => {
  //     cb(null, `uploads/${Date.now()}-${file.originalname}`);
  //   }
  // })
});

// Function to Generate CloudFront URL
const getCloudFrontUrl = (s3Key) => {
  return `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`;
};

module.exports = { upload, s3, getCloudFrontUrl, checkS3Connection };
