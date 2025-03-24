

const FLASK_API_URL =  'http://localhost:5001';
const imageService = require('../services/image-service');
// const analyzeAndUploadImage = async (req, res) => {
//     try {

        
//         const s3 = new AWS.S3();
//         const upload = multer({
//             storage: multerS3({
//                 s3,
//                 bucket: "diagram-analysis-storage",
//                 acl: "private",
//                 key: (req, file, cb) => {
//                     cb(null, `uploads/${Date.now()}_${file.originalname}`);
//                 },
//             }),
//         });
//         const file = req.file;
//         if (!file) {
//             return res.status(400).json({ error: 'No image file provided' });
//         }

//         console.log('Attempting to analyze image:', {
//             filename: file.originalname,
//             size: file.size,
//             mimetype: file.mimetype
//         });

//         // 1. Analyze image using Flask API
//         const formData = new FormData();
//         formData.append('image', file.buffer, {
//             filename: file.originalname,
//             contentType: file.mimetype
//         });

//         // Call Flask API
//         console.log('Sending request to Flask API at:', FLASK_API_URL);
//         const flaskResponse = await axios.post(`${FLASK_API_URL}/analyze`, formData, {
//             headers: {
//                 ...formData.getHeaders(),
//             },
//             maxContentLength: Infinity,
//             maxBodyLength: Infinity,
//             timeout: 30000 // 30 second timeout
//         });
//         console.log('Received response from Flask API');

//         // 2. Upload to S3
//         // const s3Upload = await s3.upload({
//         //     Bucket: process.env.S3_BUCKET_NAME,
//         //     Key: `uploads/${Date.now()}-${file.originalname}`,
//         //     Body: file.buffer,
//         //     ContentType: file.mimetype,
//         //     ACL: 'public-read'
//         // }).promise();

//         // 3. Combine analysis results and file URL
//         // const response = {
//         //     imageUrl: getCloudFrontUrl(s3Upload.Key),
//         //     analysis: flaskResponse.data,
//         //     uploadInfo: {
//         //         bucket: s3Upload.Bucket,
//         //         key: s3Upload.Key,
//         //         location: s3Upload.Location
//         //     }
//         // };

//         // Log analysis results
//         console.log('Image Analysis Results:', {
//             filename: file.originalname,
//             fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
//            chartType: flaskResponse.data?.chart_analysis?.type || 'Unknown',
//             shapes: flaskResponse.data?.shapes_detected || {},
//             textAnalysis: flaskResponse.data?.text_analysis || {},
//             isHandwritten: flaskResponse.data?.handwritten_or_printed || 'Unknown',
//             hasGrid: flaskResponse.data?.grid_detection ?? false
//         });

//         return res.status(200).json({
//             data: flaskResponse.data
//         });

//     } catch (error) {
//         console.error('Detailed error:', {
//             message: error.message,
//             code: error.code,
//             response: error.response?.data,
//             config: {
//                 url: error.config?.url,
//                 method: error.config?.method,
//                 headers: error.config?.headers
//             }
//         });
        
//         return res.status(500).json({
//             error: 'Failed to process image',
//             details: error.message,
//             code: error.code
//         });
//     }
// };


const analyzeAndUploadImage = async (req, res) => {
    try {
        const metaData = req.body;
        // Optionally, you can also extract text values
        // and look up or create new records accordingly.
        
        const result = await imageService.processImage(req.file, metaData)

      // console.log("🚀 ~ analyzeAndUploadImage ~ result:", result)

      return res.status(200).json({data: result });
    } catch (error) {
      console.error('Error processing image:', error.message);
      return res.status(500).json({ error: 'Failed to process image' });
    }
  };

// get all images from the getDataBase

  const getAllImages = async (req, res) => {
    try {
      const results = await imageService.getAllImages();
      return res.status(200).json({ results });
    } catch (error) {
      console.error(" Error fetching images:", error);
      throw error;
    }
  }; 

module.exports = {
    analyzeAndUploadImage,
    getAllImages
};