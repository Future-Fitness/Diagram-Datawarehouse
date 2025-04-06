const axios = require("axios");
const FormData = require("form-data");
const { s3, getCloudFrontUrl } = require("../config/S3-config");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const Diagram = require("../models/Diagram"); // Use correct Mongoose model

const FLASK_API_URL = process.env.FLASK_API_URL;

// ✅ Function to Save Analysis Data to MongoDB
async function saveAnalysisData(imageData, analysisData) {

  try {
    // 💡 Safely extract text (must be string, not object)
    const safeExtractedText = typeof analysisData.text_result === 'string'
      ? analysisData.text_result
      : '';

    // 💡 Safely extract symbols (must be array of objects with symbol strings)
    const safeExtractedSymbols = Array.isArray(analysisData.extracted_symbols)
      ? analysisData.extracted_symbols
      : [];
    const { basic_metrics, color_analysis, quality_scores, quality_rating } = analysisData;

    const newDiagram = new Diagram({
      image_url: imageData.imageUrl,
      filename: imageData.fileName,

      title: imageData.title,
      subjectId: imageData.subjectId,
      diagramTypeId: imageData.diagramTypeId,
      sourceType: imageData.sourceType,
      pageNumber: imageData.pageNumber,
      author: imageData.author,
      notes: imageData.notes,

      subjects: imageData.subjects || [],
      category: imageData.category || "Uncategorized",
      tags: imageData.tags || [],

      file_info: {
        file_size_mb: (imageData.fileSize / (1024 * 1024)).toFixed(2),
        format: imageData.format,
        resolution: `${basic_metrics.dimensions.width}x${basic_metrics.dimensions.height}`,
        dimensions: {
          width: basic_metrics.dimensions.width,
          height: basic_metrics.dimensions.height,
          megapixels: basic_metrics.dimensions.megapixels || 0,
        },
      },

      color_analysis: {
        dominant_colors: color_analysis.color_stats?.dominant_colors || [],
        color_distribution: color_analysis.color_distribution || {},
      },

      quality_scores: {
        overall_quality: quality_scores.overall_quality || 0,
        blur_score: quality_scores.blur_score || 0,
        brightness_score: quality_scores.brightness_score || 0,
        contrast_score: quality_scores.contrast_score || 0,
        detail_score: quality_scores.detail_score || 0,
        edge_density: quality_scores.edge_density || 0,
        noise_level: quality_scores.noise_level || 0,
        sharpness: quality_scores.sharpness || 0,
      },

      quality_rating: quality_rating || "Medium",

      extracted_text: safeExtractedText,  // ✅ Corrected
      extracted_symbols: safeExtractedSymbols,  // ✅ Corrected


      related_diagrams: [],
      searchable_text: `${imageData.fileName} ${imageData.category} ${imageData.tags.join(" ")} ${analysisData.extracted_text || ""
        }`,
    });


    await newDiagram.save();
    console.log("✅ Analysis data saved successfully in MongoDB");
    return newDiagram;
  } catch (error) {
    console.error("❌ Error saving analysis data:", error);
    throw error;
  }
}

// ✅ Function to Process Image
const processImage = async (file, imageMetadata) => {
  if (!file) {
    throw new Error("❌ No image file provided");
  }

  console.log("File details:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  try {
    // 1️⃣ **Analyze Image Using Flask API**
    const formData = new FormData();
    formData.append("image", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });


    //calling flask api service which analyzes and get all image meta data ,like text extraction, and color and oths
    const flaskResponse = await axios.post(`${FLASK_API_URL}/analyze`, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 300000,
    });
    console.log("🚀 ~ processImage ~ flaskResponse.data:", flaskResponse.data)

    if (!flaskResponse || !flaskResponse.data) {
      throw new Error("❌ No valid response from Flask API");
    }

    console.log("🚀 Flask API Analysis Completed");

    // 2️⃣ **Upload to AWS S3**
    const s3Key = `uploads/${Date.now()}-${file.originalname}`;
    const s3Upload = await s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,

    }).promise();

    console.log("✅ Image uploaded to S3:", s3Upload.Location);

    //imagemetadata - coming form frontend form
    //flaskresponseData = callin flaks service 

    // 3️⃣ **Prepare Data for MongoDB**
    const { basic_metrics } = flaskResponse.data;
    console.log("🚀 ~ processImage ~ flaskResponse.data2:", flaskResponse.data.text_result)

    const imageData = {
      fileName: file.originalname,
      fileSize: file.size,
      resolution: `${basic_metrics.dimensions.width}x${basic_metrics.dimensions.height}`,
      imageUrl: getCloudFrontUrl(s3Key),
      format: file.mimetype,

      // ✅ Mapping Metadata Fields
      title: imageMetadata.title || "Untitled",
      subjectId: imageMetadata?.subjectId,
      diagramTypeId: imageMetadata.diagramTypeId,
      sourceType: imageMetadata?.sourceType || "Unknown",
      pageNumber: imageMetadata?.pageNumber ? parseInt(imageMetadata?.pageNumber, 10) : null,
      author: imageMetadata?.author || "Unknown",
      notes: imageMetadata?.notes || "",

      subjects: imageMetadata?.subjects || [],
      category: imageMetadata?.category || "Uncategorized",
      tags: imageMetadata?.tags || [],

      extracted_text: flaskResponse.data.text_result || "\n",
      extracted_symbols: flaskResponse.data.symbols_result || []


    };

    // 4️⃣ **Save Data to MongoDB**
    const savedData = await saveAnalysisData(imageData, flaskResponse.data);

    // 5️⃣ **Return Final Response**
    return {
      imageUrl: getCloudFrontUrl(s3Key),
      analysis: flaskResponse.data.result,
      dbRecord: savedData,
    };
  } catch (error) {
    console.error("❌ Error processing image:", error);
    throw error;
  }
};

///not in use
const getAllImages = async () => {
  try {
    const images = await Diagram.find({ image_url: { $exists: true } });
    return images;
  } catch (error) {
    console.error(" Error fetching images:", error);
    throw error;
  }
};
module.exports = {
  processImage,
  saveAnalysisData,
  getAllImages
};
