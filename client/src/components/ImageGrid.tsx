interface ImageGridProps {
  images: ImageData[];
  loading: boolean;
  error: string | null;
  onImageClick?: (subjectId: string) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, loading, error }:any) => (
  <div className="max-w-6xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {loading ? (
      <p className="text-center text-gray-500">Loading images...</p>
    ) : error ? (
      <p className="text-center text-red-500">{error}</p>
    ) : images.length > 0 ? (
      images.map((img) => (
       
        <div
          key={img._id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
          // onClick={() => onImageClick && onImageClick(img.subjectId)}
        >

          <img src={img.image_url} alt={img.title || "Image"} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h2 className="font-semibold text-lg">{img.title || "Untitled"}</h2>
            <p className="text-sm text-gray-500">{img?.subjectId?.name || "Uncategorized"}</p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500">No images found.</p>
    )}
  </div>
);

export default ImageGrid; 