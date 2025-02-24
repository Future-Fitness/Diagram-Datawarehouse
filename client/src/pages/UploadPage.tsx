import { useState, useEffect } from "react";

import { FaCloudUploadAlt } from "react-icons/fa";

export default function UploadForm() {
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    diagramTypeId: "",
    sourceType: "",
    color: "Color",
    fileSize: "",
    resolution: "1920x1080",
    format: "",
    sourceTitle: "",
    pageNumber: "",
    author: "",
    notes: "",
  });
  const [imageQuality, setImageQuality] = useState({
    resolution: "",
    fileSize: "",
    aspectRatio: "",
    quality: 0, // 0-100
    diagramClarity: 0, // 0-100
    overallRating: 0, // 0-100
  });

  const analyzeImageQuality = (file: File, imgElement: HTMLImageElement) => {
    return new Promise((resolve) => {
      // Calculate basic metrics
      const fileSize = (file.size / (1024 * 1024)).toFixed(2);
      const aspectRatio = (imgElement.width / imgElement.height).toFixed(2);
      
      // Calculate quality score based on resolution and file size
      let qualityScore = 0;
      if (imgElement.width >= 1920 && imgElement.height >= 1080) {
        qualityScore += 40;
      } else if (imgElement.width >= 1280 && imgElement.height >= 720) {
        qualityScore += 30;
      } else {
        qualityScore += 20;
      }

      // Add points for reasonable file size (between 0.1 and 5 MB)
      const fileSizeNum = parseFloat(fileSize);
      if (fileSizeNum >= 0.1 && fileSizeNum <= 5) {
        qualityScore += 30;
      } else if (fileSizeNum > 5 && fileSizeNum <= 10) {
        qualityScore += 20;
      }

      // Estimate diagram clarity based on image analysis
      const diagramClarity = Math.min(85, qualityScore + 10); // Simplified estimation

      // Calculate overall rating
      const overallRating = Math.round((qualityScore + diagramClarity) / 2);

      const analysisResult = {
        resolution: `${imgElement.width}x${imgElement.height}`,
        fileSize: `${fileSize} MB`,
        aspectRatio: aspectRatio,
        quality: qualityScore,
        diagramClarity: diagramClarity,
        overallRating: overallRating,
      };

      setImageQuality(analysisResult);
      resolve(analysisResult);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Create image element for analysis
      const img = new Image();
      img.onload = async () => {
        const analysis = await analyzeImageQuality(file, img);
        setFormData(prev => ({
          ...prev,
          resolution: analysis.resolution,
          fileSize: analysis.fileSize,
          imageQuality: analysis.quality,
          diagramClarity: analysis.diagramClarity,
          overallRating: analysis.overallRating,
        }));
        setStep(2);
      };
      img.src = previewUrl;
    }
  };

  const handleChange = (e :any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send metadata + image URL to backend
    const response = await fetch("/upload-image-metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, imageUrl }),
    });

    if (response.ok) {
      alert("Image & Metadata Saved Successfully!");
    } else {
      alert("Upload Failed!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6 bg-blue-200 overflow-y-hidden">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-center">Step 1: Upload Image</h2>
            <div className="mt-4 flex flex-col items-center">
              <label className="w-full flex flex-col items-center px-4 py-6 bg-blue-600 text-white rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-700">
                <FaCloudUploadAlt size={40} />
                <span className="mt-2 text-base leading-normal">Select an image file</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-4 rounded-lg shadow-md" />
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Step 2: Enter Image Metadata</h2>
            
            {/* Add Image Analysis Results */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Image Analysis Results:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Resolution: {imageQuality.resolution}</div>
                <div>File Size: {imageQuality.fileSize}</div>
                <div>Aspect Ratio: {imageQuality.aspectRatio}</div>
                <div>Image Quality: {imageQuality.quality}/100</div>
                <div>Diagram Clarity: {imageQuality.diagramClarity}/100</div>
                <div>Overall Rating: {imageQuality.overallRating}/100</div>
              </div>
            </div>

            <div>
              <label className="font-semibold">Title</label>
              <input type="text" name="title" required className="w-full p-2 border rounded" onChange={handleChange} />
            </div>

            <div>
              <label className="font-semibold">Subject Domain</label>
              <select name="subject" required className="w-full p-2 border rounded" onChange={handleChange}>
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>

            <div>
              <label className="font-semibold">Diagram Type</label>
              <select name="diagramType" required className="w-full p-2 border rounded" onChange={handleChange}>
                <option value="">Select Type</option>
                <option value="Bar Chart">Bar Chart</option>
                <option value="Line Graph">Line Graph</option>
                <option value="Molecule">Molecule</option>
              </select>
            </div>

            <div>
              <label className="font-semibold">Source Type</label>
              <select name="sourceType" required className="w-full p-2 border rounded" onChange={handleChange}>
                <option value="">Select Source Type</option>
                <option value="Book">Book</option>
                <option value="Research Paper">Research Paper</option>
                <option value="Online">Online</option>
              </select>
            </div>

           

          

           

            <div>
              <label className="font-semibold">Source (Optional)</label>
              <input type="text" name="source" className="w-full p-2 border rounded" onChange={handleChange} />
            </div>

            <div>
              <label className="font-semibold">Page Number (Optional)</label>
              <input type="number" name="pageNumber" className="w-full p-2 border rounded" onChange={handleChange} />
            </div>

            <div>
              <label className="font-semibold">Author (Optional)</label>
              <input type="text" name="author" className="w-full p-2 border rounded" onChange={handleChange} />
            </div>

            <div>
              <label className="font-semibold">Additional Notes</label>
              <textarea name="notes" className="w-full p-2 border rounded" onChange={handleChange}></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4">
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
