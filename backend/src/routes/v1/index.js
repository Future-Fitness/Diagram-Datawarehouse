const express = require('express');

const { InfoController } = require('../../controllers');
const {ImageController} = require('../../controllers');
const { upload } = require('../../config/S3-config');

const router = express.Router();

router.get('/info', InfoController.info);

router.post('/uploadImage', upload.single('image'),   ImageController.UploadImage);




module.exports = router;