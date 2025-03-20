import axios from "axios";
import { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../App";
import { toast } from "react-toastify";

export default function UploadForm() {
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [subject,setSubject ] = useState([])
  const [diagram,setDiagram ]= useState([])
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    diagramTypeId: "",
    sourceType: "",
    pageNumber: "",
    author: "",
    notes: "",
  });

  const [imageQuality, setImageQuality] = useState({
    resolution: "",
    fileSize: "",
    aspectRatio: "",
    quality: 0,
    diagramClarity: 0,
    overallRating: 0,
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

      setImageQuality(analysisResult);
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 📌 Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("no image")
      return;
    }

    setUploading(true);
    const form = new FormData();
    form.append("image", imageFile);
    Object.entries(formData).forEach(([key, value]) => form.append(key, value));

    try {
      const response = await axios.post("http://127.0.0.1:4000/api/v1/analyze", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast.success("Image & Metadata Saved Successfully!");
      } else {
        toast.error("Upload Failed!");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      // toast.success("Error uploading the image.");
    }
    setUploading(false);
  };

  const fetchoptions = async()=>{
    const  diagram = await axios.get(`${BASE_URL}/diagramTypes`)
    setDiagram(diagram.data.diagramTypes)
    console.log("🚀 ~ fetchoptions ~ diagram:", diagram)
    const subject = await axios.get(`${BASE_URL}/SubjectTypes`)
    setSubject(subject.data.subjectTypes)
    console.log("🚀 ~ fetchoptions ~ subject:", subject.data)

  }
  useEffect(()=>{
    fetchoptions()

  },[])

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6 bg-blue-200 overflow-y-hidden">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 px-3 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors"
      >
        Back
      </button>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-center">Step 1: Upload Image</h2>
            <div className="mt-4 flex flex-col items-center">
              <label className="w-full flex flex-col items-center px-4 py-6 bg-blue-600 text-white rounded-lg shadow-lg tracking-wide uppercase cursor-pointer hover:bg-blue-700">
                <FaCloudUploadAlt size={40} />
                <span className="mt-2 text-base leading-normal">Select an image file</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 rounded-lg shadow-md" />}
            </div>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Step 2: Enter Image Metadata</h2>

            {/* Image Analysis Results */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Image Analysis Results:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(imageQuality).map(([key, value]) => (
                  <div key={key}>
                    {key.replace(/([A-Z])/g, " $1")}: {value}
                  </div>
                ))}
              </div>
            </div>

            <input type="text" name="title" required className="w-full p-2 border rounded" placeholder="Title" onChange={handleChange} />
            <select name="subjectId" required className="w-full p-2 border rounded" onChange={handleChange}>
              <option value="">Select Subject</option>
              {
                subject.map((i)=>(
                  <option value={i._id}>{i.name}</option>
                ))
              }

            </select>

            <div>
              <label className="font-semibold">Diagram Type</label>
              <select name="diagramType" required className="w-full p-2 border rounded" onChange={handleChange}>
                <option value="">Select Type</option>
              {
                diagram.map((i)=>(
                  <option value={i._id}>{i.category}</option>
                ))
              }
          
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



            

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4" disabled={uploading}>
              {uploading ? "Uploading..." : "Submit"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
