import axios from "axios";
import { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const VITE_BASE_URL = 'https://harshsaw.tech/datadiagram/api';

// Updated interfaces to match the new API response structure
interface DiagramType {
  _id: string;
  name: string;
  category: string;
  description: string;
  created_at: string;
  __v: number;
}

interface SubjectType {
  _id: string;
  name: string;
  description: string;
  diagrams: DiagramType[];
  created_at: string;
  __v: number;
}

export default function UploadForm() {
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [availableDiagrams, setAvailableDiagrams] = useState<DiagramType[]>([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    diagramTypeId: "",
    sourceType: "",
    pageNumber: "",
    author: "",
    notes: "",
    tags: "",
    source: "",
  });

  // 📌 Image Quality Analysis (Client-side Check)
  const analyzeImageQuality = (file: File, imgElement: HTMLImageElement) => {
    return new Promise((resolve) => {
      const fileSize = (file.size / (1024 * 1024)).toFixed(2);
      const aspectRatio = (imgElement.width / imgElement.height).toFixed(2);

      let qualityScore = 0;
      if (imgElement.width >= 1920 && imgElement.height >= 1080) qualityScore += 40;
      else if (imgElement.width >= 1280 && imgElement.height >= 720) qualityScore += 30;
      else qualityScore += 20;

      const fileSizeNum = parseFloat(fileSize);
      if (fileSizeNum >= 0.1 && fileSizeNum <= 5) qualityScore += 30;
      else if (fileSizeNum > 5 && fileSizeNum <= 10) qualityScore += 20;

      const diagramClarity = Math.min(85, qualityScore + 10);
      const overallRating = Math.round((qualityScore + diagramClarity) / 2);

      const analysisResult = {
        resolution: `${imgElement.width}x${imgElement.height}`,
        fileSize: `${fileSize} MB`,
        aspectRatio: aspectRatio,
        quality: qualityScore,
        diagramClarity: diagramClarity,
        overallRating: overallRating,
      };

      resolve(analysisResult);
    });
  };

  // 📌 Handle Image Upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const img = new Image();
      img.onload = async () => {
        await analyzeImageQuality(file, img);
        setStep(2);
      };
      img.src = previewUrl;
    }
  };

  // 📌 Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // When subject changes, update available diagrams
    if (name === "subjectId") {
      const selectedSubject = subjects.find(subject => subject._id === value);
      if (selectedSubject) {
        setAvailableDiagrams(selectedSubject.diagrams);
        // Reset diagram selection
        setFormData(prev => ({
          ...prev,
          diagramTypeId: ""
        }));
      } else {
        setAvailableDiagrams([]);
      }
    }
  };

  // 📌 Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("No image selected");
      return;
    }

    setUploading(true);
    const form = new FormData();
    form.append("image", imageFile);
    Object.entries(formData).forEach(([key, value]) => form.append(key, value));

    try {
      const response = await axios.post(`${VITE_BASE_URL}/v1/analyze`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast.success("Uploaded successfully");
        setFormData({
          title: "",
          subjectId: "",
          diagramTypeId: "",
          sourceType: "",
          pageNumber: "",
          author: "",
          notes: "",
          tags: "",
          source: "",
        });
        setImagePreview(null);
        setImageFile(null);
        setStep(1);
      } else {
        toast.error("Upload Failed!");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Error during upload. Please try again.");
    }
    setUploading(false);
  };

  const fetchSubjectTypes = async () => {
    try {
      const response = await axios.get(`${VITE_BASE_URL}/v1/SubjectTypes`);
      if (response.data.success && response.data.subjectTypes) {
        setSubjects(response.data.subjectTypes);
      } else {
        console.error("Invalid API response format:", response.data);
        toast.error("Failed to load subject types.");
      }
    } catch (error) {
      console.error("Error fetching subject types:", error);
      toast.error("Failed to load subject types.");
    }
  };

  useEffect(() => {
    fetchSubjectTypes();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-r from-blue-500 to-indigo-600">
      <motion.button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 px-4 py-2 bg-white text-blue-600 rounded-md shadow-md hover:bg-gray-200 transition"
        whileHover={{ scale: 1.1 }}
      >
        Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl"
      >
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800">Step 1: Upload Image</h2>
            <div className="mt-4 flex flex-col items-center">
              <label className="w-full flex flex-col items-center px-6 py-8 bg-blue-500 text-white rounded-lg shadow-lg cursor-pointer hover:bg-blue-700 transition">
                <FaCloudUploadAlt size={40} />
                <span className="mt-2 text-base">Select an image file</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </>
        )}

        {step === 2 && (
          <motion.form
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Step 2: Enter Image Metadata</h2>
            
            <div className="flex flex-col md:flex-row gap-6 justify-between">
              {/* Image preview on the left */}
              <div className="md:w-2/5">
                {imagePreview && (
                  <div className="sticky top-6">
                    <img src={imagePreview} alt="Preview" className="rounded-lg shadow-md w-full object-contain max-h-[70vh]" />
                  </div>
                )}
              </div>
              
              {/* Form on the right */}
              <div className="space-y-4 md:w-3/5">

                <div>
                  <label className="font-semibold">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full p-2 border rounded"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="font-semibold">Subject</label>
                  <select 
                    name="subjectId" 
                    required 
                    className="w-full p-2 border rounded" 
                    value={formData.subjectId}
                    onChange={handleChange}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold">Diagram Type</label>
                  <select 
                    name="diagramTypeId" 
                    required 
                    className="w-full p-2 border rounded" 
                    value={formData.diagramTypeId}
                    onChange={handleChange}
                    disabled={!formData.subjectId}
                  >
                    <option value="">Select Diagram Type</option>
                    {availableDiagrams.map((diagram) => (
                      <option key={diagram._id} value={diagram._id}>
                        {diagram.name}
                      </option>
                    ))}
                  </select>
                  {!formData.subjectId && (
                    <p className="text-sm text-gray-600 mt-1">Please select a subject first</p>
                  )}
                </div>

                <div>
                  <label className="font-semibold">Source Type</label>
                  <select 
                    name="sourceType" 
                    required 
                    className="w-full p-2 border rounded" 
                    value={formData.sourceType}
                    onChange={handleChange}
                  >
                    <option value="">Select Source Type</option>
                    <option value="Book">Book</option>
                    <option value="Research Paper">Research Paper</option>
                    <option value="Online">Online</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold">Source (Optional)</label>
                  <input 
                    type="text" 
                    name="source" 
                    className="w-full p-2 border rounded" 
                    value={formData.source}
                    onChange={handleChange} 
                  />
                </div>

                <div>
                  <label className="font-semibold">Page Number (Optional)</label>
                  <input 
                    type="number" 
                    name="pageNumber" 
                    className="w-full p-2 border rounded" 
                    value={formData.pageNumber}
                    onChange={handleChange} 
                  />
                </div>

                <div>
                  <label className="font-semibold">Author (Optional)</label>
                  <input 
                    type="text" 
                    name="author" 
                    className="w-full p-2 border rounded" 
                    value={formData.author}
                    onChange={handleChange} 
                  />
                </div>

                <div>
                  <label className="font-semibold">Additional Notes</label>
                  <textarea 
                    name="notes" 
                    className="w-full p-2 border rounded" 
                    value={formData.notes}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4"
                  disabled={uploading}
                  whileHover={{ scale: 1.05 }}
                >
                  {uploading ? "Uploading..." : "Submit"}
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
        
        {/* Responsive adjustment for mobile */}
      
      </motion.div>
    </div>
  );
}