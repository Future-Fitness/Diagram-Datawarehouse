import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ImageData {
  id: string;
  imageUrl: string;
  title?: string;
  category?: string;
  // Add additional fields as needed.
}

export default function ViewAllImages() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch all images from the API.
    // Replace the URL with your API endpoint.
    fetch("/api/images")
      .then((res) => res.json())
      .then((data: ImageData[]) => {
        setImages(data);
        // Derive a unique list of categories from the images.
        const cats = Array.from(
          new Set(data.map((img) => img.category || "Uncategorized"))
        );
        setCategories(["All", ...cats]);
      })
      .catch((err) => console.error("Error fetching images", err));
  }, []);

  const filteredImages = images.filter((img) => {
    const matchesCategory =
      selectedCategory === "All" || (img.category || "Uncategorized") === selectedCategory;
    const matchesSearch =
      img.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (img.category || "Uncategorized").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">

<button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 px-3 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors"
      >
        Back
      </button>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">View All Images</h1>
      </header>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Search images or categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-wrap gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-md ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Image Grid */}
      <div className="max-w-6xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <img src={img.imageUrl} alt={img.title || "Image"} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="font-semibold text-lg">{img.title || "Untitled"}</h2>
              <p className="text-sm text-gray-500">{img.category || "Uncategorized"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}