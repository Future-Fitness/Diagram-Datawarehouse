import React, { useState, useEffect, useRef } from "react";
interface Suggestion {
  _id: string;
  title: string;
  image_url?: string;
  subjectId?: {
    name: string;
  };
}

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
  getSuggestions?: (term: string) => Promise<Suggestion[]>;
  darkMode?: boolean;
}
const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  placeholder = "Search...",
  getSuggestions = null,
  darkMode = false,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Color theme classes based on dark mode
  const themeClasses = {
    container: darkMode ? "bg-slate-800 shadow-xl" : "bg-white shadow-md",
    input: darkMode
      ? "bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500",
    suggestions: darkMode
      ? "bg-slate-800 border-slate-600 shadow-xl"
      : "bg-white border-gray-300 shadow-lg",
    suggestionItem: darkMode
      ? "hover:bg-slate-700 border-b border-slate-700 text-slate-200"
      : "hover:bg-gray-100 border-b border-gray-100",
    searchButton: darkMode
      ? "text-slate-400 hover:text-cyan-400"
      : "text-gray-600 hover:text-gray-800",
    loadingText: darkMode ? "text-slate-400" : "text-gray-500",
    notFoundText: darkMode ? "text-slate-400" : "text-gray-500",
    subjectText: darkMode ? "text-slate-400" : "text-gray-500",
  };

  // Fetch suggestions when user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!getSuggestions || searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getSuggestions(searchTerm);
        setSuggestions(results);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [searchTerm, getSuggestions]);

  // Handle clicks outside the suggestion box to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [suggestionsRef, inputRef]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearchTerm(suggestion.title);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuggestions(false);
    // The actual search is handled by the parent component through the debounced search term
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`relative w-full ${themeClasses.container} rounded-lg`}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border rounded-md ${themeClasses.input} focus:outline-none focus:ring-2`}
          />
          <button
            type="submit"
            className={`absolute right-0 top-0 h-full px-4 ${themeClasses.searchButton} transition-colors`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && searchTerm.length >= 2 && (
        <div
          ref={suggestionsRef}
          className={`absolute z-10 w-full mt-1 border rounded-md ${themeClasses.suggestions} overflow-hidden`}
        >
          {isLoading ? (
            <div className={`p-3 text-center ${themeClasses.loadingText}`}>
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-cyan-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading suggestions...
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion._id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-4 py-2 cursor-pointer ${themeClasses.suggestionItem}`}
                >
                  <div className="flex items-center">
                    {suggestion.image_url && (
                      <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded mr-3 border border-slate-600">
                        <img
                          src={suggestion.image_url}
                          alt={suggestion.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{suggestion.title}</div>
                      {suggestion.subjectId?.name && (
                        <div className={`text-sm ${themeClasses.subjectText}`}>
                          {suggestion.subjectId.name}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className={`p-3 text-center ${themeClasses.notFoundText}`}>
              No suggestions found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
