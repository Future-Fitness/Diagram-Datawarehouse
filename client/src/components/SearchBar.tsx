interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
  }
  const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => (
    <div className="max-w-4xl mx-auto mb-6">
      <input
        type="text"
        placeholder="Search images or categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-blue-500"
      />
    </div>
  );


  export default SearchBar