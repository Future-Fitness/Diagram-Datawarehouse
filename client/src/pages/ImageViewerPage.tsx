import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { request, gql } from "graphql-request";
import ImageGrid from "../components/ImageGrid";
import SearchBar from "../components/SearchBar";
import { useDebounce } from "../hooks/useDebounce";


interface Diagram {
  _id: string;
  title: string;
  image_url: string;
  subjectId: {
    _id: string;
    name: string;
    description?: string;
  };
  created_at: string;
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
  tags: string[];
  quality: string;
  minQualityScore: number;
  dateRange: {
    from: string;
    to: string;
  };
  format: string;
  sortBy: string;
}

const REST_ENDPOINT = `${import.meta.env.VITE_BASE_URL}api/v1/SubjectTypes`;
 const SEARCH_ENDPOINT =  `${import.meta.env.VITE_BASE_URL}v1/diagram`;
const ADVANCED_SEARCH_ENDPOINT =  `${import.meta.env.VITE_BASE_URL}v1/diagram/advanced`;
const AUTOCOMPLETE_ENDPOINT =  `${import.meta.env.VITE_BASE_URL}v1/diagram/autocomplete`;

const GRAPHQL_ENDPOINT = `${import.meta.env.VITE_GRAPHQL_BASE_URL}`;

// GraphQL Query to Fetch ALL Diagrams (No subject filter)
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
        created_at,
        extracted_text,
        file_info {
          format,
          resolution,
          file_size_mb
        }
        quality_scores {
        overall_quality

      }


       



      }
      total
      totalPages
      currentPage
    }
  }
`;

// GraphQL Query to Fetch Diagrams by Subject
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

// Fetch Function for Subjects (REST API)
const fetchSubjects = async (): Promise<any[]> => {
  const res = await axios.get(REST_ENDPOINT);
  return res.data.subjectTypes;
};

// Function to fetch autocomplete suggestions
const fetchAutocompleteSuggestions = async (prefix: string): Promise<any[]> => {
  if (!prefix || prefix.length < 2) return [];
  try {
    const response = await axios.get(AUTOCOMPLETE_ENDPOINT, {
      params: { prefix, limit: 5 }
    });
    return response.data;
  } catch (error) {
    console.error("Autocomplete error:", error);
    return [];
  }
};

export default function DiagramSearchPage() {
      //@ts-ignore
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<DiagramResponse | null>(null);

  // Advanced search options
  const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    textQuery: "",
    subjects: [],
    tags: [],
    quality: "",
    minQualityScore: 0,
    dateRange: { from: "", to: "" },
    format: "",
    sortBy: "searchScore"
  });

  // Tags input handling
  const [tagInput, setTagInput] = useState<string>("");

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch Subjects
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
    staleTime: 1000 * 60 * 5,
  });

  // Only fetch diagrams when not in advanced search mode
  const { data: imagesData, isLoading: basicSearchLoading, error: basicSearchError } = useQuery<DiagramResponse | null>({
    queryKey: ["diagrams", page, limit, selectedSubject, debouncedSearchTerm],
    queryFn: async () => {
      if (isAdvancedSearch) return null;
      if (debouncedSearchTerm && debouncedSearchTerm.length > 2) {
        const subjectArray = selectedSubject ? [selectedSubject] : [];
        const params = new URLSearchParams({
          query: debouncedSearchTerm,
          limit: limit.toString(),
          page: page.toString()
        });
        if (subjectArray.length > 0) {
          params.append('subjects', JSON.stringify(subjectArray));
        }
        try {
          const response = await axios.get(`${SEARCH_ENDPOINT}?${params.toString()}`);
          return {
            diagrams: response.data.results.map((item: any) => ({
              _id: item._id,
              title: item.title,
              image_url: item.image_url,
              subjectId: {
                _id: item.subjectId?._id || "",
                name: item.subjectId?.name || ""
              },
              created_at: item.upload_date || item.created_at
            })),
            total: response.data.pagination.total,
            totalPages: Math.ceil(response.data.pagination.total / limit),
            currentPage: page
          };
        } catch (error) {
          console.error("Atlas Search error:", error);
          throw error;
        }
      } else {
        if (selectedSubject) {
          return request(GRAPHQL_ENDPOINT, GET_ALL_DIAGRAMS_BY_SUBJECT, { 
            page, 
            limit, 
            subjectId: selectedSubject 
          }).then((data: any) => data.getAllDiagramsBySubjectType);
        } else {
          return request(GRAPHQL_ENDPOINT, GET_ALL_DIAGRAMS_QUERY, { page, limit })
            .then((data: any) => data.getAllDiagrams);
        }
      }
    },
    staleTime: 1000 * 60 * 2,
    enabled: !isAdvancedSearch
  });

  // Advanced Search mutation
  const advancedSearchMutation = useMutation({
    mutationFn: async (searchParams: any) => {
      const response = await axios.post(ADVANCED_SEARCH_ENDPOINT, searchParams);
      return {
        diagrams: response.data.results.map((item: any) => ({
          _id: item._id,
          title: item.title,
          image_url: item.image_url,
          subjectId: {
            _id: item.subjectId?._id || "",
            name: item.subjectId?.name || ""
          },
          created_at: item.upload_date || item.created_at
        })),
        total: response.data.pagination.total,
        totalPages: Math.ceil(response.data.pagination.total / limit),
        currentPage: searchParams.page
      };
    },
    onSuccess: (data: DiagramResponse) => {
      setSearchResults(data);
      setIsAdvancedSearch(true);
    }
  });

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
    if (isAdvancedSearch) {
      performAdvancedSearch(newPage);
    }
  };

  // Handle subject selection
  const handleSubjectClick = (subjectId: string | null) => {
    if (isAdvancedSearch) {
      setAdvancedFilters(prev => ({
        ...prev,
        subjects: subjectId ? [subjectId] : []
      }));
    } else {
      setSelectedSubject(subjectId);
    }
    setPage(1);
  };

  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
      setTagInput("");
    }
  };

  const addTag = (tag: string) => {
    if (!advancedFilters.tags.includes(tag)) {
      setAdvancedFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setAdvancedFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Update advanced filters
  const handleAdvancedFilterChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setAdvancedFilters(prev => ({
        ...prev,
        [parent]: {
          //@ts-ignore
          ...prev,
          [child]: value
        }
      }));
    } else {
      setAdvancedFilters(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Perform the advanced search
  const performAdvancedSearch = (pageNumber: number = 1) => {
    const searchParams = {
      ...advancedFilters,
      page: pageNumber,
      limit: limit,
      textQuery: advancedFilters.textQuery || searchTerm
    };
    advancedSearchMutation.mutate(searchParams);
  };

  // Apply advanced filters
  const applyAdvancedFilters = () => {
    setPage(1);
    performAdvancedSearch(1);
  };

  // Reset all filters and switch back to basic search
  const resetAllFilters = () => {
    setAdvancedFilters({
      textQuery: "",
      subjects: [],
      tags: [],
      quality: "",
      minQualityScore: 0,
      dateRange: { from: "", to: "" },
      format: "",
      sortBy: "searchScore"
    });
    setSearchTerm("");
    setSelectedSubject(null);
    setPage(1);
    setIsAdvancedSearch(false);
    setSearchResults(null);
  };

  // Update advanced filters when the main search term changes
  useEffect(() => {
    if (isAdvancedSearch && debouncedSearchTerm) {
      setAdvancedFilters(prev => ({
        ...prev,
        textQuery: debouncedSearchTerm
      }));
    }
  }, [debouncedSearchTerm, isAdvancedSearch]);

  const displayData = isAdvancedSearch ? searchResults : imagesData;
      //@ts-ignore
  const isLoading = isAdvancedSearch ? advancedSearchMutation.isLoading : basicSearchLoading;
  const errorObj = (isAdvancedSearch ? advancedSearchMutation.error : basicSearchError) as Error | null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-cyan-400">Search Diagrams</h1>
      </header>

      {/* Main Search Bar */}
      <div className="mb-6">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search by title, extracted text, notes, or tags..."
              //@ts-ignore
          getSuggestions={fetchAutocompleteSuggestions}
          darkMode={true}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showAdvancedSearch ? "Hide" : "Show"} Advanced Search
          </button>
        </div>
      </div>

      {/* Advanced Search Options */}
      {showAdvancedSearch && (
        <div className="mb-6 p-4 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-3 text-cyan-400">Advanced Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-slate-300">Quality Rating</label>
              <select
                value={advancedFilters.quality}
                onChange={(e) => handleAdvancedFilterChange("quality", e.target.value)}
                className="border border-slate-600 bg-slate-700 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Any Quality</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-slate-300">Min Quality Score</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={advancedFilters.minQualityScore}
                onChange={(e) =>
                  handleAdvancedFilterChange("minQualityScore", parseFloat(e.target.value) || 0)
                }
                className="border border-slate-600 bg-slate-700 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-slate-300">Format</label>
              <select
                value={advancedFilters.format}
                onChange={(e) => handleAdvancedFilterChange("format", e.target.value)}
                className="border border-slate-600 bg-slate-700 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Any Format</option>
                <option value="PNG">PNG</option>
                <option value="JPG">JPG</option>
                <option value="SVG">SVG</option>
                <option value="PDF">PDF</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-slate-300">Sort By</label>
              <select
                value={advancedFilters.sortBy}
                onChange={(e) => handleAdvancedFilterChange("sortBy", e.target.value)}
                className="border border-slate-600 bg-slate-700 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="searchScore">Relevance</option>
                <option value="date">Date (Newest)</option>
                <option value="quality">Quality (Highest)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-slate-300">Date From</label>
              <input
                type="date"
                value={advancedFilters.dateRange.from}
                onChange={(e) => handleAdvancedFilterChange("dateRange.from", e.target.value)}
                className="border border-slate-600 bg-slate-700 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-slate-300">Date To</label>
              <input
                type="date"
                value={advancedFilters.dateRange.to}
                onChange={(e) => handleAdvancedFilterChange("dateRange.to", e.target.value)}
                className="border border-slate-600 bg-slate-700 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="mb-1 text-sm font-medium text-slate-300">Tags</label>
            <div className="flex items-center">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add tags (press Enter)"
                className="flex-grow border border-slate-600 bg-slate-700 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  if (tagInput.trim()) {
                    addTag(tagInput.trim());
                    setTagInput("");
                  }
                }}
                className="ml-2 bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-md transition-colors"
              >
                Add
              </button>
            </div>
            {advancedFilters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {advancedFilters.tags.map((tag) => (
                  <div key={tag} className="bg-slate-700 text-cyan-400 px-2 py-1 rounded-full text-sm flex items-center">
                    <span>{tag}</span>
                    <button onClick={() => removeTag(tag)} className="ml-1 text-slate-400 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={resetAllFilters}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-md transition-colors shadow-lg"
            >
              Reset All
            </button>
            <button
              onClick={applyAdvancedFilters}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition-colors shadow-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Subject Buttons */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        <button
          onClick={() => handleSubjectClick(null)}
          className={`px-4 py-2 text-white rounded-md shadow-lg transition-colors ${
            (isAdvancedSearch ? advancedFilters.subjects.length === 0 : selectedSubject === null)
              ? "bg-cyan-600 ring-2 ring-cyan-400"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          All Diagrams
        </button>
        {subjectsLoading ? (
          <p className="text-slate-400 animate-pulse">Loading subjects...</p>
        ) : (
          subjects?.map((subject: any) => (
            <button
              key={subject._id}
              onClick={() => handleSubjectClick(subject._id)}
              className={`px-4 py-2 text-white rounded-md shadow-lg transition-colors ${
                isAdvancedSearch
                  ? advancedFilters.subjects.includes(subject._id)
                  : selectedSubject === subject._id
                    ? "bg-cyan-600 ring-2 ring-cyan-400"
                    : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              {subject.name}
            </button>
          ))
        )}
      </div>

      {isAdvancedSearch && (
        <div className="mb-4 text-center">
          <span className="bg-cyan-700 text-white px-3 py-1 rounded-md text-sm">Advanced Search Mode</span>
        </div>
      )}

      {/* Image Grid */}
      <div className="bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700">
        <ImageGrid
        //@ts-ignore
          images={displayData?.diagrams || []}
          loading={isLoading}
          error={errorObj?.message}
          darkMode={true}
        />
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        )}
        {errorObj && (
          <div className="text-red-400 bg-red-900/30 border border-red-800 p-4 rounded-md my-4">
            Error: {errorObj.message}
          </div>
        )}
        {!isLoading && !errorObj && (!displayData || displayData.diagrams.length === 0) && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400 text-lg">No diagrams found</p>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {displayData && displayData.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2 bg-slate-800 p-2 rounded-lg shadow-lg border border-slate-700">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-4 py-2 rounded-md transition-colors ${
                page === 1 ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-cyan-600 text-white hover:bg-cyan-700"
              }`}
            >
              Previous
            </button>
            <div className="flex items-center px-4 text-slate-300">
              Page {page} of {displayData.totalPages}
            </div>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === displayData.totalPages}
              className={`px-4 py-2 rounded-md transition-colors ${
                page === displayData.totalPages ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-cyan-600 text-white hover:bg-cyan-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
