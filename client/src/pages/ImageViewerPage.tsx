import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { request, gql } from "graphql-request";
import ImageGrid from "../components/ImageGrid";
import SearchBar from "../components/SearchBar";
import { useDebounce } from "../hooks/useDebounce";

interface Diagram {
  _id: string;
  title: string;
  image_url: string;
  created_at: string;
  quality_scores: { overall_quality: number };
  quality_rating: string;
}

interface DiagramResponse {
  diagrams: Diagram[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface AdvancedFilters {
  textQuery: string;
  subjects: string[];
  quality: "Low" | "Medium" | "High" | "";
}

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api/';
const VITE_GRAPHQL_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api/graphql/';
const REST_ENDPOINT = `${VITE_BASE_URL}v1/SubjectTypes`;
const GRAPHQL_ENDPOINT = `${VITE_GRAPHQL_BASE_URL}`;

// Combined search resolver
const SEARCH_DIAGRAMS_QUERY = gql`
  query SearchDiagrams(
    $query: String,
    $subjectId: ID,
    $minQualityScore: Int,
    $page: Int,
    $limit: Int
  ) {
    searchDiagrams(
      query: $query,
      subjectId: $subjectId,
      minQualityScore: $minQualityScore,
      page: $page,
      limit: $limit
    ) {
      diagrams {
        _id
        title
        image_url
        created_at

        file_info {
        
        file_size_mb
    format

    resolution

        }
        quality_scores { overall_quality 
          blur_score
    brightness_score
    contrast_score
    detail_score
    edge_density
    noise_level
    sharpness
        
        }

        quality_rating

        extracted_text


      }


      totalPages
      currentPage
    }
  }
`;

export default function DiagramSearchPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    textQuery: "",
    subjects: [],
    quality: "",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch subjects
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => (await axios.get(REST_ENDPOINT)).data.subjectTypes,
    staleTime: 300_000,
  });

  // Map quality selection to numeric threshold
  const qualityMap = { Low: 0, Medium: 50, High: 80 };
  const minQuality = advancedFilters.quality ? qualityMap[advancedFilters.quality] : 0;

  // Combined search query (basic + advanced)
  const { data: searchData, isLoading, error } = useQuery<DiagramResponse>({
    queryKey: ["searchDiagrams", debouncedSearchTerm, selectedSubject, minQuality, page],
    queryFn: () => {
      const variables = {
        query: debouncedSearchTerm.length > 2 ? debouncedSearchTerm : "",
        subjectId: selectedSubject || undefined,
        minQualityScore: minQuality,
        page,
        limit,
      };
      return request(GRAPHQL_ENDPOINT, SEARCH_DIAGRAMS_QUERY, variables)
        .then((res: any) => res.searchDiagrams);
    },
    keepPreviousData: true,
  });

  // Handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleSubjectClick = (subjectId: string | null) => {
    setSelectedSubject(subjectId);
    setPage(1);
  };

  const handleAdvancedFilterChange = (field: keyof AdvancedFilters, value: any) => {
    setAdvancedFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetAllFilters = () => {
    setAdvancedFilters({ textQuery: "", subjects: [], quality: "" });
    setSearchTerm("");
    setSelectedSubject(null);
    setPage(1);
  };

  // Keep advanced textQuery in sync
  useEffect(() => {
    if (showAdvancedSearch) {
      setAdvancedFilters(prev => ({ ...prev, textQuery: debouncedSearchTerm }));
    }
  }, [debouncedSearchTerm, showAdvancedSearch]);

  // Data to display
  const displayData = searchData;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-cyan-400">Search Diagrams</h1>
      </header>

      <button onClick={() => navigate(-1)} className="mb-6 bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-md">Back</button>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        placeholder="Search by extracted text..."
        //@ts-ignore
        getSuggestions={async (prefix) => {
          if (prefix.length < 2) return [];
          const res = await axios.get(`${VITE_BASE_URL}v1/diagram/autocomplete`, { params: { prefix, limit: 5 } });
          return res.data;
        }}
        darkMode={true}
      />

      <div className="flex justify-end mt-2">
        <button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className="text-sm text-cyan-400">
          {showAdvancedSearch ? "Hide" : "Show"} Advanced
        </button>
      </div>

      {showAdvancedSearch && (
        <div className="mb-6 p-4 bg-slate-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm">Quality Rating</label>
              <select
                value={advancedFilters.quality}
                onChange={e => handleAdvancedFilterChange("quality", e.target.value)}
                className="w-full mt-1 p-2 bg-slate-700 rounded"
              >
                <option value="">Any</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <button onClick={resetAllFilters} className="px-4 py-2 bg-slate-700 rounded">Reset</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => handleSubjectClick(null)} className={`px-4 py-2 rounded ${!selectedSubject ? "bg-cyan-600" : "bg-slate-700"}`}>All</button>
        {subjectsLoading ? (
          <p>Loading...</p>
        ) : (
          subjects?.map(s => (
            <button
              key={s._id}
              onClick={() => handleSubjectClick(s._id)}
              className={`px-4 py-2 rounded ${selectedSubject === s._id ? "bg-cyan-600" : "bg-slate-700"}`}
            >{s.name}</button>
          ))
        )}
      </div>

      <ImageGrid
        images={displayData?.diagrams || []}
        loading={isLoading}
        error={error?.message}
        darkMode={true}
      />

      {displayData && displayData.totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <button disabled={page === 1} onClick={() => handlePageChange(page - 1)} className="px-4 py-2 bg-cyan-600 rounded">Prev</button>
          <span className="text-slate-300">{page} / {displayData.totalPages}</span>
          <button disabled={page === displayData.totalPages} onClick={() => handlePageChange(page + 1)} className="px-4 py-2 bg-cyan-600 rounded">Next</button>
        </div>
      )}
    </div>
  );
}
