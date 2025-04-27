const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function analyzeImage(apiUrl, filePath, filename, format) {
  const form = new FormData();
  form.append('image', fs.createReadStream(filePath), {
    filename,
    contentType: format || 'image/jpeg',
  });

  const response = await axios.post(`${apiUrl}/analyze`, form, {
    headers: form.getHeaders(),
    timeout: 900000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return response.data;
}

module.exports = { analyzeImage };
