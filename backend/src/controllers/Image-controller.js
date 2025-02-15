const axios = require('axios');
const FormData = require('form-data');
const { upload, s3, getCloudFrontUrl } = require('../config/S3-config');

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5001';

const analyzeAndUploadImage = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        console.log('Attempting to analyze image:', {
            filename: file.originalname,
            size: file.size,
            mimetype: file.mimetype
        });

        // 1. Analyze image using Flask API
        const formData = new FormData();
        formData.append('image', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype
        });

        // Call Flask API
        console.log('Sending request to Flask API at:', FLASK_API_URL);
        const flaskResponse = await axios.post(`${FLASK_API_URL}/analyze`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 30000 // 30 second timeout
        });
        console.log('Received response from Flask API');

        // 2. Upload to S3
        // const s3Upload = await s3.upload({
        //     Bucket: process.env.S3_BUCKET_NAME,
        //     Key: `uploads/${Date.now()}-${file.originalname}`,
        //     Body: file.buffer,
        //     ContentType: file.mimetype,
        //     ACL: 'public-read'
        // }).promise();

        // 3. Combine analysis results and file URL
        // const response = {
        //     imageUrl: getCloudFrontUrl(s3Upload.Key),
        //     analysis: flaskResponse.data,
        //     uploadInfo: {
        //         bucket: s3Upload.Bucket,
        //         key: s3Upload.Key,
        //         location: s3Upload.Location
        //     }
        // };

        // Log analysis results
        // console.log('Image Analysis Results:', {
        //     filename: file.originalname,
        //     fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        //     chartType: flaskResponse.data.chart_analysis.type,
        //     shapes: flaskResponse.data.shapes_detected,
        //     textAnalysis: flaskResponse.data.text_analysis,
        //     isHandwritten: flaskResponse.data.handwritten_or_printed,
        //     hasGrid: flaskResponse.data.grid_detection
        // });

        return res.status(200).json({
            data: flaskResponse.data
        });

    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers
            }
        });
        
        return res.status(500).json({
            error: 'Failed to process image',
            details: error.message,
            code: error.code
        });
    }
};

// Example response structure:
/*
{
    imageUrl: "https://your-cloudfront-domain.com/uploads/image.jpg",
    analysis: {
        shapes_detected: {
            circles: 2,
            rectangles: 5,
            lines: 10
        },
        chart_analysis: {
            type: "Bar Chart",
            characteristics: {
                is_pie_chart: false,
                is_bar_chart: true,
                vertical_bars: 5,
                horizontal_bars: 0
            }
        },
        text_analysis: {
            blocks: [
                { text: "Label 1", confidence: 95 },
                { text: "Value", confidence: 88 }
            ],
            total_words: 2,
            average_confidence: 91.5
        },
        color_analysis: [[145, 128, 156], [78, 45, 89], [198, 167, 201]],
        grid_detection: true,
        handwritten_or_printed: "Printed"
    },
    uploadInfo: {
        bucket: "your-bucket-name",
        key: "uploads/1234567890-image.jpg",
        location: "https://s3.amazonaws.com/..."
    }
}
*/

module.exports = {
    analyzeAndUploadImage
};