const s3 = require('../config/aws');

async function downloadFileFromS3(bucket, key, destination) {
    const s3Object = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    require('fs').writeFileSync(destination, s3Object.Body);
}

module.exports = { downloadFileFromS3 };
