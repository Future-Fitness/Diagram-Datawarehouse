const express = require('express');

const { InfoController } = require('../../controllers');
const {ImageController} = require('../../controllers');

const router = express.Router();

router.get('/info', InfoController.info);

router.post('/uploadImage', ImageController.UploadImage);




module.exports = router;