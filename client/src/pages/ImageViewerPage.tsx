import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import ImageGrid from "../components/ImageGrid";
import SearchBar from "../components/SearchBar";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql"; // Change this to your API URL

const GET_DIAGRAMS_QUERY = gql`
  query GetAllDiagrams($page: Int, $limit: Int) {
    getAllDiagrams(page: $page, limit: $limit) {
      diagrams {
        id
        title
        image_url
        created_at
      }
      total
      totalPages
      currentPage
    }
  }
`;

// ✅ Function to Fetch Data Using `graphql-request`
const fetchDiagrams = async ({ queryKey }: any) => {
  const [, page, limit] = queryKey;
  return request(GRAPHQL_ENDPOINT, GET_DIAGRAMS_QUERY, { page, limit })
    .then((data) => data.getAllDiagrams);
};

export default function ViewAllImages() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ✅ Fetch images with pagination (no category filtering)
  const { data: imagesData, isLoading, error } = useQuery({
    queryKey: ["diagrams", 1, 10], // ✅ Fetch images with pagination
    queryFn: fetchDiagrams,
    staleTime: 1000 * 60 * 5,
  });

  // ✅ Filter only based on search input
  const filteredImages = imagesData?.diagrams?.filter((img) => 
    img.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
      <ImageGrid images={filteredImages} loading={isLoading} error={error?.message} />
    </div>
  );
}
