import { FC } from "react";

interface ImageData {
  _id: string;
  title: string;
  url: string;
  createdAt: string;
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
  // Theme classes
  const themeClasses = {
    container: darkMode ? "bg-slate-800 text-slate-200" : "bg-white text-gray-800",
    card: darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-gray-200",
    title: darkMode ? "text-slate-200" : "text-gray-800",
    date: darkMode ? "text-slate-400" : "text-gray-500",
    error: darkMode ? "text-red-400 bg-slate-700" : "text-red-600 bg-red-100",
    noResults: darkMode ? "text-slate-400" : "text-gray-500",
  };

  // Format date to human-readable
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
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
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${themeClasses.container}`}>
      {images.map((image: ImageData) => (
        <div
          key={image._id}
          className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${themeClasses.card}`}
        >
          <div className="aspect-w-16 aspect-h-9 overflow-hidden">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className={`font-medium mb-1 ${themeClasses.title}`}>{image.title}</h3>
            <p className={`text-sm ${themeClasses.date}`}>
              {formatDate(image.createdAt)}
            </p>
            {image.description && (
              <p className="mt-2 text-sm line-clamp-2">{image.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;