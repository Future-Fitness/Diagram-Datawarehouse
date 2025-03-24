import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { request, gql } from "graphql-request";
import ImageGrid from "../components/ImageGrid";
import SearchBar from "../components/SearchBar";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql"; // Replace with your API URL
const REST_ENDPOINT = "http://localhost:4000/api/v1/SubjectTypes"; // REST API for fetching subjects

// ✅ GraphQL Query to Fetch ALL Diagrams (No subject filter)
const GET_ALL_DIAGRAMS_QUERY = gql`
  query GetAllDiagrams($page: Int, $limit: Int) {
    getAllDiagrams(page: $page, limit: $limit) {
      diagrams {
        _id
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

// ✅ GraphQL Query to Fetch Diagrams by Subject
const GET_ALL_DIAGRAMS_BY_SUBJECT = gql`
  query GetAllDiagramsBySubjectType($subjectId: ID!, $page: Int, $limit: Int) {
    getAllDiagramsBySubjectType(subjectId: $subjectId, page: $page, limit: $limit) {
      diagrams {
        _id
        title
        image_url
        subjectId {
          _id
          name
        }
        created_at
      }
      total
      totalPages
      currentPage
    }
  }
`;

// ✅ Fetch Function for Subjects (REST API)
const fetchSubjects = async () => {
  return axios.get(REST_ENDPOINT).then((res) => res.data.subjectTypes);
};

// ✅ Fetch Function for Diagrams (Handles both queries)
const fetchDiagrams = async ({ queryKey }: any) => {
  const [, page, limit, subjectId] = queryKey;

  if (subjectId) {
    // 🔹 Fetch Diagrams by Subject
    return request(GRAPHQL_ENDPOINT, GET_ALL_DIAGRAMS_BY_SUBJECT, { page, limit, subjectId })
      .then((data) => data.getAllDiagramsBySubjectType);
  } else {
    // 🔹 Fetch All Diagrams (No Filter)
    return request(GRAPHQL_ENDPOINT, GET_ALL_DIAGRAMS_QUERY, { page, limit })
      .then((data) => data.getAllDiagrams);
  }
};

export default function AllDiagramsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // 📌 Fetch Subjects (Using REST API)
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
    staleTime: 1000 * 60 * 5,
  });

  // 📌 Fetch Diagrams (All or By Selected Subject)
  const { data: imagesData, isLoading, error } = useQuery({
    queryKey: ["diagrams", 1, 10, selectedSubject], // ✅ Changes when subject changes
    queryFn: fetchDiagrams,
    staleTime: 1000 * 60 * 5,
  });

  // 📌 Filtered Images Based on Search Term
  const filteredImages =
    imagesData?.diagrams?.filter((img) => img.title?.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  // 📌 Handle Subject Selection (Click to Filter, Click Again to Reset)
  const handleSubjectClick = (subjectId: string | null) => {
    setSelectedSubject(subjectId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">View All Diagrams</h1>
      </header>

      {/* 📌 Subject Buttons */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {/* 🔹 Show 'All Diagrams' button */}
        <button
          onClick={() => handleSubjectClick(null)}
          className={`px-4 py-2 text-white rounded-md shadow-md transition ${
            selectedSubject === null ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          All Diagrams
        </button>

        {/* 🔹 Load Subjects from REST API */}
        {subjectsLoading ? (
          <p>Loading subjects...</p>
        ) : (
          subjects?.map((subject) => (
            <button
              key={subject._id}
              onClick={() => handleSubjectClick(subject._id)}
              className={`px-4 py-2 text-white rounded-md shadow-md transition ${
                selectedSubject === subject._id ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {subject.name}
            </button>
          ))
        )}
      </div>

      {/* 📌 Search & Image Grid */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ImageGrid images={filteredImages} loading={isLoading} error={error?.message} />
    </div>
  );
}
