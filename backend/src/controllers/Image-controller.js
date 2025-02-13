const { StatusCodes } = require('http-status-codes');
const { getCloudFrontUrl } = require('../config/S3-config');

const UploadImage = (req, res) => {


    try {
        const { key, location } = req.file; // S3 key & URL
        const cloudFrontUrl = getCloudFrontUrl(key); // CloudFront URL
        console.log(key);
    
    
        
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'API is live',
            error: {},
            data: {},
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Something went wrong while uploading image',
            error: error.message,
            data: {},
        });
        
    }
 
}

module.exports = {
    UploadImage
}