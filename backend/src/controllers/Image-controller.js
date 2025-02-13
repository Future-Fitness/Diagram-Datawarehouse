const { StatusCodes } = require('http-status-codes');

const UploadImage = (req, res) => {
    return res.status(StatusCodes.OK).json({
        success: true,
        message: 'API is live',
        error: {},
        data: {},
    });
}

module.exports = {
    UploadImage
}