import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
      // try {
        // setLoading(true);
        // const response = await axios.get(`http://localhost:4000/api/v1/getAllImages`); // Update API URL
        // console.log("🚀 ~ fetchImages ~ response:", response.data)
        const data = [
          {
              "file_info": {
                  "dimensions": {
                      "width": 1639,
                      "height": 1290,
                      "megapixels": 2.11431
                  },
                  "file_size_mb": 0.06,
                  "format": "image/png",
                  "resolution": "1639x1290"
              },
              "color_analysis": {
                  "color_distribution": {
                      "mean_rgb": [
                          250.14566407007487,
                          249.18907634169068,
                          246.25115522321704
                      ],
                      "mean_hsv": [
                          6.828203054424375,
                          4.358045414343214,
                          250.14566407007487
                      ],
                      "mean_lab": [
                          249.1998037184708,
                          127.24736296947941,
                          127.24643973684086
                      ],
                      "std_rgb": [
                          23.113084170951065,
                          24.220107731010945,
                          30.033249115385267
                      ]
                  },
                  "dominant_colors": [
                      [
                          255,
                          255,
                          255
                      ],
                      [
                          213,
                          202,
                          167
                      ],
                      [
                          32,
                          31,
                          29
                      ]
                  ]
              },
              "quality_scores": {
                  "overall_quality": 23,
                  "blur_score": 304.27,
                  "brightness_score": 250.15,
                  "contrast_score": 25.4,
                  "detail_score": 24.77,
                  "edge_density": 0.02,
                  "noise_level": 35.23,
                  "sharpness": 15.29
              },
              "_id": "67d30474b374ea79b8d7baf0",
              "image_url": "https://https://dqlmp36knl3ql.cloudfront.net/uploads/1741882484229-ButterflyDiagram.png",
              "filename": "ButterflyDiagram.png",
              "title": "dsadsa",
              "subjectId": "Mathematics",
              "diagramTypeId": "General",
              "sourceType": "Book",
              "pageNumber": 23,
              "author": "ads",
              "notes": "23dsda",
              "subjects": [],
              "category": "Uncategorized",
              "sub_category": "General",
              "tags": [],
              "extracted_symbols": [],
              "quality_rating": "Low",
              "extracted_text": "",
              "related_diagrams": [],
              "searchable_text": "ButterflyDiagram.png Uncategorized  ",
              "upload_date": "2025-03-13T16:14:44.840Z",
              "mathematical_expressions": [],
              "created_at": "2025-03-13T16:14:44.840Z",
              "__v": 0
          },
          {
              "file_info": {
                  "dimensions": {
                      "width": 1639,
                      "height": 1290,
                      "megapixels": 2.11431
                  },
                  "file_size_mb": 0.06,
                  "format": "image/png",
                  "resolution": "1639x1290"
              },
              "color_analysis": {
                  "color_distribution": {
                      "mean_rgb": [
                          250.14566407007487,
                          249.18907634169068,
                          246.25115522321704
                      ],
                      "mean_hsv": [
                          6.828203054424375,
                          4.358045414343214,
                          250.14566407007487
                      ],
                      "mean_lab": [
                          249.1998037184708,
                          127.24736296947941,
                          127.24643973684086
                      ],
                      "std_rgb": [
                          23.113084170951065,
                          24.220107731010945,
                          30.033249115385267
                      ]
                  },
                  "dominant_colors": [
                      [
                          255,
                          255,
                          255
                      ],
                      [
                          213,
                          202,
                          167
                      ],
                      [
                          32,
                          31,
                          29
                      ]
                  ]
              },
              "quality_scores": {
                  "overall_quality": 23,
                  "blur_score": 304.27,
                  "brightness_score": 250.15,
                  "contrast_score": 25.4,
                  "detail_score": 24.77,
                  "edge_density": 0.02,
                  "noise_level": 35.23,
                  "sharpness": 15.29
              },
              "_id": "67d30532cc7510f9b1bbe8b4",
              "image_url": "https://dqlmp36knl3ql.cloudfront.net/uploads/1741882674012-ButterflyDiagram.png",
              "filename": "ButterflyDiagram.png",
              "title": "dsadsa",
              "subjectId": "Mathematics",
              "diagramTypeId": "General",
              "sourceType": "Book",
              "pageNumber": 23,
              "author": "ads",
              "notes": "23dsda",
              "subjects": [],
              "category": "Uncategorized",
              "sub_category": "General",
              "tags": [],
              "extracted_symbols": [],
              "quality_rating": "Low",
              "extracted_text": "",
              "related_diagrams": [],
              "searchable_text": "ButterflyDiagram.png Uncategorized  ",
              "upload_date": "2025-03-13T16:17:54.671Z",
              "mathematical_expressions": [],
              "created_at": "2025-03-13T16:17:54.671Z",
              "__v": 0
          },
          {
              "file_info": {
                  "dimensions": {
                      "width": 1639,
                      "height": 1290,
                      "megapixels": 2.11431
                  },
                  "file_size_mb": 0.06,
                  "format": "image/png",
                  "resolution": "1639x1290"
              },
              "color_analysis": {
                  "color_distribution": {
                      "mean_rgb": [
                          250.14566407007487,
                          249.18907634169068,
                          246.25115522321704
                      ],
                      "mean_hsv": [
                          6.828203054424375,
                          4.358045414343214,
                          250.14566407007487
                      ],
                      "mean_lab": [
                          249.1998037184708,
                          127.24736296947941,
                          127.24643973684086
                      ],
                      "std_rgb": [
                          23.113084170951065,
                          24.220107731010945,
                          30.033249115385267
                      ]
                  },
                  "dominant_colors": [
                      [
                          255,
                          255,
                          255
                      ],
                      [
                          213,
                          202,
                          167
                      ],
                      [
                          32,
                          31,
                          29
                      ]
                  ]
              },
              "quality_scores": {
                  "overall_quality": 23,
                  "blur_score": 304.27,
                  "brightness_score": 250.15,
                  "contrast_score": 25.4,
                  "detail_score": 24.77,
                  "edge_density": 0.02,
                  "noise_level": 35.23,
                  "sharpness": 15.29
              },
              "_id": "67d30573cc7510f9b1bbe8b6",
              "image_url": "https://dqlmp36knl3ql.cloudfront.net/uploads/1741882738709-ButterflyDiagram.png",
              "filename": "ButterflyDiagram.png",
              "title": "dsadsa",
              "subjectId": "Mathematics",
              "diagramTypeId": "General",
              "sourceType": "Book",
              "pageNumber": 23,
              "author": "ads",
              "notes": "23dsda",
              "subjects": [],
              "category": "Uncategorized",
              "sub_category": "General",
              "tags": [],
              "extracted_symbols": [],
              "quality_rating": "Low",
              "extracted_text": "",
              "related_diagrams": [],
              "searchable_text": "ButterflyDiagram.png Uncategorized  ",
              "upload_date": "2025-03-13T16:18:59.348Z",
              "mathematical_expressions": [],
              "created_at": "2025-03-13T16:18:59.348Z",
              "__v": 0
          }
      ]

        setImages(data);

        // Extract unique categories
        // const cats = Array.from(new Set(data.map((img) => img.category || "Uncategorized")));
        // setCategories(["All", ...cats]);
      // } catch (err) {
      //   console.error("❌ Error fetching images", err);
      //   // setError("Failed to load images. Please try again later.");
      // } finally {
      //   setLoading(false);
      // }
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

      {/* 🔍 Search Bar */}
      <div className="max-w-4xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Search images or categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-blue-500"
        />
      </div>

      {/* 📂 Category Filter Buttons */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-wrap gap-4 justify-center">
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

      {/* 🖼️ Image Grid */}
      <div className="max-w-6xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading images...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredImages.length > 0 ? (
          filteredImages.map((img) => (
            <div
              key={img._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img src={img.image_url} alt={img.title || "Image"} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="font-semibold text-lg">{img.title || "Untitled"}</h2>
                <p className="text-sm text-gray-500">{img.category || "Uncategorized"}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No images found.</p>
        )}
      </div>
    </div>
  );
}
