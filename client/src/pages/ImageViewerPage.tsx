import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import ImageGrid from "../components/ImageGrid";
import SearchBar from "../components/SearchBar";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql"; // Change this to your API URL

const GET_ALL_DIAGRAMS_QUERY = gql`
  query GetAllDiagrams($page: Int, $limit: Int) {
    getAllDiagrams(page: $page, limit: $limit) {
      diagrams {
        id
        title
        image_url
        subjectId {
        _id
        name
        description

      }
        created_at
      }
      total
      totalPages
      currentPage
    }
  }
`;

const fetchDiagrams = async ({ queryKey }: any) => {
  const [, page, limit] = queryKey;
  return request(GRAPHQL_ENDPOINT, GET_ALL_DIAGRAMS_QUERY, { page, limit })
    .then((data) => data.getAllDiagrams);
};

export default function AllDiagramsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: imagesData, isLoading, error } = useQuery({
    queryKey: ["diagrams", 1, 10],
    queryFn: fetchDiagrams,
    staleTime: 1000 * 60 * 5,
  });

  const filteredImages = imagesData?.diagrams?.filter((img) => 
    img.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleImageClick = (subjectId: string) => {
    navigate(`/subject-diagrams/${subjectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">View All Diagrams</h1>
      </header>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ImageGrid images={filteredImages} loading={isLoading} error={error?.message} onImageClick={handleImageClick} />
    </div>
  );
} 