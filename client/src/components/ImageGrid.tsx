import React from "react";
import { Link } from "react-router-dom";

const ImageGrid = ({ images, loading, error, darkMode = false }) => {
  // Theme classes based on dark mode
  const themeClasses = {
    card: darkMode 
      ? "bg-slate-800 border-slate-700 hover:border-cyan-600 shadow-xl" 
      : "bg-white border-gray-200 hover:border-blue-400 shadow-md",
    title: darkMode 
      ? "text-slate-200" 
      : "text-gray-800",
    subject: darkMode 
      ? "text-slate-400" 
      : "text-gray-600",
    date: darkMode 
      ? "text-slate-500" 
      : "text-gray-500",
    viewButton: darkMode 
      ? "bg-cyan-600 hover:bg-cyan-700 text-white" 
      : "bg-blue-600 hover:bg-blue-700 text-white",
    errorContainer: darkMode 
      ? "bg-red-900/30 border-red-800 text-red-400" 
      : "bg-red-100 border-red-300 text-red-700",
  };

  // Helper to format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className={`p-4 border rounded-md ${themeClasses.errorContainer}`}>
        <p>Error loading images: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((image) => (
        <div
          key={image._id}
          className={`rounded-lg overflow-hidden border transition-all duration-300 ${themeClasses.card} hover:transform hover:scale-[1.02]`}
        >
          <div className="relative aspect-w-16 aspect-h-9 overflow-hidden">
            <img
              src={image.image_url}
              alt={image.title}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            {image.subjectId?.name && (
              <div className="absolute top-0 right-0 p-2">
                <span className="px-2 py-1 text-xs rounded-full bg-cyan-600 text-white">
                  {image.subjectId.name}
                </span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className={`font-bold mb-1 line-clamp-2 ${themeClasses.title}`}>
              {image.title}
            </h3>
            <div className="flex justify-between items-center mt-3">
              <span className={`text-sm ${themeClasses.date}`}>
                {formatDate(image.created_at)}
              </span>
              <Link
                to={`/diagrams/${image._id}`}
                className={`px-3 py-1 text-sm rounded-md ${themeClasses.viewButton} transition-colors`}
              >
                View
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Empty grid cells to maintain layout */}
      {images.length > 0 && images.length % 4 !== 0 && (
        Array(4 - (images.length % 4)).fill(0).map((_, index) => (
          <div key={`empty-${index}`} className="hidden lg:block"></div>
        ))
      )}
    </div>
  );
};

export default ImageGrid;