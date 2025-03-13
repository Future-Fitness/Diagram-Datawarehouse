import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../App";
import ImageGrid from "../components/ImageGrid";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";

interface ImageData {
  _id: string;
  image_url: string;
  title?: string;
  category?: string;
}







export default function ViewAllImages() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/getAllImages`); // Update API URL
        console.log("🚀 ~ fetchImages ~ response:", response.data)
     
        const data = response.data.results;
        setImages(data);

        // Extract unique categories
        const cats = Array.from(new Set(data.map((img) => img.category || "Uncategorized")));
        setCategories(["All", ...cats]);
      } catch (err) {
        console.error("❌ Error fetching images", err);
        // setError("Failed to load images. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // **Filter Images Based on Search & Category**
  const filteredImages = images.filter((img) => {
    const matchesCategory = selectedCategory === "All" || (img.category || "Uncategorized") === selectedCategory;
    const matchesSearch =
      img.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (img.category || "Uncategorized").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 px-3 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors"
      >
        Back
      </button>

      {/* 🔹 Page Title */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">View All Images</h1>
      </header>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <ImageGrid images={filteredImages} loading={loading} error={error} />
    </div>
  );
}
