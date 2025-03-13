interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string;
    setSelectedCategory: (cat: string) => void;
  }
  const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, setSelectedCategory }) => (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex flex-wrap gap-4 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-md ${
              selectedCategory === cat ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300"
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );


  export default CategoryFilter