import { useState } from "react";

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

  const handleImageUpload = async (event : any) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Get file size
    const fileSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";

    // Get image resolution
    const img = new Image();
    img.onload = () => {
      const resolution = `${img.width}x${img.height}`;
      setFormData({ ...formData, resolution, fileSize });
      setStep(2); // Move to Step 2 after upload
    };
    img.src = URL.createObjectURL(file); // Set the src after setting up the onload handler
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
