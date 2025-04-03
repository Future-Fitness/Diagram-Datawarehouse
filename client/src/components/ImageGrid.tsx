import { FC, useState } from "react";
import ImageDetailModal from "./ImageDetailModal";

interface FileInfo {
  format: string;
  resolution: string;
  file_size_mb: number;
}

interface QualityScores {
  overall_quality: number;
}

interface Subject {
  _id: string;
  name: string;
  description: string;
}

interface ImageData {
  _id: string;
  title: string;
  image_url: string;
  created_at: string;
  subjectId?: Subject;
  extracted_text?: string;
  file_info?: FileInfo;
  quality_scores?: QualityScores;
  description?: string;
}

interface ImageGridProps {
  //@ts-ignore
  images: ImageData[];
  loading?: boolean;
  error?: string | null;
  darkMode?: boolean;
}

const ImageGrid: FC<ImageGridProps> = ({ images, error, darkMode = false }) => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Theme classes
  const themeClasses = {
    container: darkMode ? "bg-slate-800 text-slate-200" : "bg-white text-gray-800",
    card: darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-gray-200",
    title: darkMode ? "text-slate-200" : "text-gray-800",
    date: darkMode ? "text-slate-400" : "text-gray-500",
    error: darkMode ? "text-red-400 bg-slate-700" : "text-red-600 bg-red-100",
    noResults: darkMode ? "text-slate-400" : "text-gray-500",
    modal: darkMode ? "bg-slate-800 text-slate-200" : "bg-white text-gray-800",
    modalOverlay: darkMode ? "bg-black bg-opacity-80" : "bg-black bg-opacity-70",
    button: darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white",
    badge: darkMode ? "bg-slate-600 text-slate-200" : "bg-gray-200 text-gray-700",
    qualityMeter: darkMode ? "bg-slate-600" : "bg-gray-200",
    qualityFill: "bg-green-500",
  };

  // Format date to human-readable
  const formatDate = (dateString: string): string => {
    try {
      // Check if the dateString is valid
      if (!dateString || dateString === "undefined" || dateString === "null") {
        return "Unknown date";
      }
      
      const date = new Date(parseInt(dateString));
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Date error";
    }
  };

  // Format file size
  const formatFileSize = (size: number): string => {
    if (size < 1) {
      return `${(size * 1024).toFixed(0)} KB`;
    }
    return `${size.toFixed(2)} MB`;
  };

  // Open modal with selected image
  const openImageModal = (image: ImageData) => {
    setSelectedImage(image);
    setModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  // If there's an error, show error message
  if (error) {
    return (
      <div className={`p-4 my-4 rounded-lg ${themeClasses.error}`}>
        <p>{error}</p>
      </div>
    );
  }

  // If there are no images, show no results message
  if (images.length === 0) {
    return (
      <div className={`text-center p-8 ${themeClasses.noResults}`}>
        <p>No images found.</p>
      </div>
    );
  }

  // Render the image grid
  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${themeClasses.container}`}>
        {images.map((image: ImageData) => (
          <div
            key={image._id}
            className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${themeClasses.card}`}
            onClick={() => openImageModal(image)}
          >
            <div className="aspect-w-16 aspect-h-9 overflow-hidden">
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-50 object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className={`font-medium mb-1 ${themeClasses.title}`}>{image.title}</h3>
              <p className={`text-sm ${themeClasses.date}`}>
                {formatDate(image.created_at)}
              </p>
              {image.subjectId && (
                <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${themeClasses.badge}`}>
                  {image.subjectId.name}
                </span>
              )}
              {image.description && (
                <p className="mt-2 text-sm line-clamp-2">{image.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {/* {modalOpen && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className={`absolute inset-0 ${themeClasses.modalOverlay}`} onClick={closeModal}></div>
          <div className={`relative max-w-4xl w-full mx-4 rounded-lg shadow-2xl overflow-auto max-h-screen ${themeClasses.modal}`}>
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={closeModal}
                className="text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="relative">
              <img 
                src={selectedImage.image_url} 
                alt={selectedImage.title} 
                className="w-full max-h-[50vh] object-contain"
              />
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className={`text-xl font-semibold ${themeClasses.title}`}>
                  {selectedImage.title}
                </h2>
                {selectedImage.subjectId && (
                  <span className={`inline-block text-sm px-3 py-1 rounded-full ${themeClasses.badge}`}>
                    {selectedImage.subjectId.name}
                  </span>
                )}
              </div>
              
              <p className={`mb-4 ${themeClasses.date}`}>
                {formatDate(selectedImage.created_at)}
              </p>
              
              {selectedImage.subjectId?.description && (
                <div className="my-4 p-3 border rounded">
                  <h3 className="font-medium mb-1">Subject</h3>
                  <p className="text-sm">{selectedImage.subjectId.description}</p>
                </div>
              )}

              {selectedImage.extracted_text && (
                <div className="my-4">
                  <h3 className="font-medium mb-1">Extracted Text</h3>
                  <div className="p-3 bg-opacity-20 rounded border">
                    <p className="text-sm">{selectedImage.extracted_text || "No text extracted"}</p>
                  </div>
                </div>
              )}

              {selectedImage.file_info && (
                <div className="my-4">
                  <h3 className="font-medium mb-1">File Details</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className={`p-2 rounded ${themeClasses.badge}`}>
                      <p>Format: {selectedImage.file_info.format}</p>
                    </div>
                    <div className={`p-2 rounded ${themeClasses.badge}`}>
                      <p>Resolution: {selectedImage.file_info.resolution}</p>
                    </div>
                    <div className={`p-2 rounded ${themeClasses.badge}`}>
                      <p>Size: {formatFileSize(selectedImage.file_info.file_size_mb)}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedImage.quality_scores && (
                <div className="my-4">
                  <h3 className="font-medium mb-1">Quality Score</h3>
                  <div className="relative pt-1">
                    <div className={`overflow-hidden h-2 mb-2 text-xs flex rounded ${themeClasses.qualityMeter}`}>
                      <div style={{ width: `${selectedImage.quality_scores.overall_quality}%` }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${themeClasses.qualityFill}`}>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>0</span>
                      <span>{selectedImage.quality_scores.overall_quality}%</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className={`px-4 py-2 rounded ${themeClasses.button}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

<ImageDetailModal
        image={selectedImage}
        isOpen={modalOpen}
        onClose={closeModal}
        darkMode={darkMode}
      />
    </>
  );
};

export default ImageGrid;