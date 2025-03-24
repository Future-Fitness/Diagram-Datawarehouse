import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { request, gql } from "graphql-request";
import ImageGrid from "../components/ImageGrid";
import SearchBar from "../components/SearchBar";
import { useDebounce } from "../hooks/useDebounce";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";
const REST_ENDPOINT = "http://localhost:4000/api/v1/SubjectTypes";
const SEARCH_ENDPOINT = "http://localhost:4000/api/v1/diagram"; // Atlas Search endpoint
const AUTOCOMPLETE_ENDPOINT = "http://localhost:4000/api/v1/diagram/autocomplete"; // Autocomplete endpoint

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
        created_at
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
const fetchSubjects = async () => {
  return axios.get(REST_ENDPOINT).then((res) => res.data.subjectTypes);
};

// Fetch Function for Diagrams (Handles both queries)
const fetchDiagrams = async ({ queryKey }) => {
  const [, page, limit, subjectId, searchTerm, filters] = queryKey;

  // If we have a search term, use Atlas Search
  if (searchTerm && searchTerm.length > 2) {
    // Convert subjectId to array format for the search API
    let subjectArray = subjectId ? [subjectId] : [];
    
    // Build query parameters
    const params = new URLSearchParams({
      query: searchTerm,
      limit: limit,
      page: page
    });
    
    // Add subject filter if present
    if (subjectArray.length > 0) {
      params.append('subjects', JSON.stringify(subjectArray));
    }
    
    // Add other filters if present
    if (filters) {
      if (filters.quality) {
        params.append('quality', filters.quality);
      }
      if (filters.format) {
        params.append('format', filters.format);
      }
      if (filters.sourceType) {
        params.append('sourceType', filters.sourceType);
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo);
      }
    }
    
    // Use Atlas Search API
    try {
      const response = await axios.get(`${SEARCH_ENDPOINT}?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json'
          // Include auth token if needed
          // 'Authorization': `Bearer ${token}`
        }
      });
      
      // Transform the response to match our expected format
      // This adapts the Atlas Search response to the same structure expected from GraphQL
      return {
        diagrams: response.data.results.map(item => ({
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
    // Use GraphQL for non-search queries
    if (subjectId) {
      // Fetch Diagrams by Subject
      return request(GRAPHQL_ENDPOINT, GET_ALL_DIAGRAMS_BY_SUBJECT, { 
        page, 
        limit, 
        subjectId 
      }).then((data) => data.getAllDiagramsBySubjectType);
    } else {
      // Fetch All Diagrams (No Filter)
      return request(GRAPHQL_ENDPOINT, GET_ALL_DIAGRAMS_QUERY, { 
        page, 
        limit 
      }).then((data) => data.getAllDiagrams);
    }
  }
};

// Function to fetch autocomplete suggestions
const fetchAutocompleteSuggestions = async (prefix) => {
  if (!prefix || prefix.length < 2) return [];
  
  try {
    const response = await axios.get(AUTOCOMPLETE_ENDPOINT, {
      params: { 
        prefix, 
        limit: 5 
      }
    });
    return response.data;
  } catch (error) {
    console.error("Autocomplete error:", error);
    return [];
  }
};

export default function DiagramSearchPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  
  // Advanced search options
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState({
    quality: "",
    dateFrom: "",
    dateTo: "",
    format: "",
    sourceType: ""
  });
  
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch Subjects
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch Diagrams (with Atlas Search integration)
  const { data: imagesData, isLoading, error, refetch } = useQuery({
    queryKey: ["diagrams", page, limit, selectedSubject, debouncedSearchTerm, filters], 
    queryFn: fetchDiagrams,
    staleTime: 1000 * 60 * 2,
  });

  // Handle filters change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply advanced filters
  const applyAdvancedFilters = () => {
    setPage(1); // Reset to first page
    refetch();
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  // Handle subject selection
  const handleSubjectClick = (subjectId) => {
    setSelectedSubject(subjectId);
    setPage(1); // Reset to first page when changing subjects
  };
  
  // Reset all filters
  const resetAllFilters = () => {
    setFilters({
      quality: "",
      dateFrom: "",
      dateTo: "",
      format: "",
      sourceType: ""
    });
    setSearchTerm("");
    setSelectedSubject(null);
    setPage(1);
  };

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-slate-300">Quality Rating</label>
              <select 
                value={filters.quality} 
                onChange={(e) => handleFilterChange('quality', e.target.value)}
                className="border border-slate-600 bg-slate-700 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Any Quality</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-slate-300">Source Type</label>
              <select 
                value={filters.sourceType} 
                onChange={(e) => handleFilterChange('sourceType', e.target.value)}
                className="border border-slate-600 bg-slate-700 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Any Source</option>
                <option value="Book">Book</option>
                <option value="Research Paper">Research Paper</option>
                <option value="Website">Website</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-slate-300">Format</label>
              <select 
                value={filters.format} 
                onChange={(e) => handleFilterChange('format', e.target.value)}
                className="border border-slate-600 bg-slate-700 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Any Format</option>
                <option value="PNG">PNG</option>
                <option value="JPG">JPG</option>
                <option value="SVG">SVG</option>
                <option value="PDF">PDF</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-slate-300">Date From</label>
              <input 
                type="date" 
                value={filters.dateFrom} 
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="border border-slate-600 bg-slate-700 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-slate-300">Date To</label>
              <input 
                type="date" 
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="border border-slate-600 bg-slate-700 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
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

      {/* Active Filters Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(debouncedSearchTerm || selectedSubject || Object.values(filters).some(v => v)) && (
          <div className="text-slate-400 mr-2 self-center">Active filters:</div>
        )}
        
        {debouncedSearchTerm && (
          <div className="bg-slate-800 text-cyan-400 px-3 py-1 rounded-full text-sm border border-slate-700 flex items-center">
            <span>Search: {debouncedSearchTerm}</span>
            <button 
              onClick={() => setSearchTerm("")}
              className="ml-2 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {selectedSubject && subjects && (
          <div className="bg-slate-800 text-cyan-400 px-3 py-1 rounded-full text-sm border border-slate-700 flex items-center">
            <span>Subject: {subjects.find(s => s._id === selectedSubject)?.name}</span>
            <button 
              onClick={() => setSelectedSubject(null)}
              className="ml-2 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {filters.quality && (
          <div className="bg-slate-800 text-cyan-400 px-3 py-1 rounded-full text-sm border border-slate-700 flex items-center">
            <span>Quality: {filters.quality}</span>
            <button 
              onClick={() => handleFilterChange('quality', '')}
              className="ml-2 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {filters.format && (
          <div className="bg-slate-800 text-cyan-400 px-3 py-1 rounded-full text-sm border border-slate-700 flex items-center">
            <span>Format: {filters.format}</span>
            <button 
              onClick={() => handleFilterChange('format', '')}
              className="ml-2 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {filters.sourceType && (
          <div className="bg-slate-800 text-cyan-400 px-3 py-1 rounded-full text-sm border border-slate-700 flex items-center">
            <span>Source: {filters.sourceType}</span>
            <button 
              onClick={() => handleFilterChange('sourceType', '')}
              className="ml-2 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {(filters.dateFrom || filters.dateTo) && (
          <div className="bg-slate-800 text-cyan-400 px-3 py-1 rounded-full text-sm border border-slate-700 flex items-center">
            <span>Date: {filters.dateFrom || 'Any'} - {filters.dateTo || 'Any'}</span>
            <button 
              onClick={() => {
                handleFilterChange('dateFrom', '');
                handleFilterChange('dateTo', '');
              }}
              className="ml-2 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Subject Buttons */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        <button
          onClick={() => handleSubjectClick(null)}
          className={`px-4 py-2 text-white rounded-md shadow-lg transition-colors ${
            selectedSubject === null 
              ? "bg-cyan-600 ring-2 ring-cyan-400" 
              : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          All Diagrams
        </button>

        {subjectsLoading ? (
          <p className="text-slate-400 animate-pulse">Loading subjects...</p>
        ) : (
          subjects?.map((subject) => (
            <button
              key={subject._id}
              onClick={() => handleSubjectClick(subject._id)}
              className={`px-4 py-2 text-white rounded-md shadow-lg transition-colors ${
                selectedSubject === subject._id 
                  ? "bg-cyan-600 ring-2 ring-cyan-400" 
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              {subject.name}
            </button>
          ))
        )}
      </div>

      {/* Image Grid */}
      <div className="bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700">
        <ImageGrid 
          images={imagesData?.diagrams || []} 
          loading={isLoading} 
          error={error?.message}
          darkMode={true} 
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-red-400 bg-red-900/30 border border-red-800 p-4 rounded-md my-4">
            Error: {error.message}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && imagesData?.diagrams?.length === 0 && (
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
      {imagesData && imagesData.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2 bg-slate-800 p-2 rounded-lg shadow-lg border border-slate-700">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-4 py-2 rounded-md transition-colors ${
                page === 1
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-cyan-600 text-white hover:bg-cyan-700"
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center px-4 text-slate-300">
              Page {page} of {imagesData.totalPages}
            </div>
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === imagesData.totalPages}
              className={`px-4 py-2 rounded-md transition-colors ${
                page === imagesData.totalPages
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-cyan-600 text-white hover:bg-cyan-700"
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