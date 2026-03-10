import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchAPI } from "../services/api";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ResultCard from "../components/ResultCard";

function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');
    setQuery(searchQuery);
    
    try {
      const response = await searchAPI.search({ query: searchQuery, limit: 10 });
      setResults(response.data.results);
      
      if (response.data.results.length === 0) {
        setError('No results found. Try uploading some documents first.');
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Search failed. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Search Your Documents</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} loading={loading} defaultValue={query} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-textSecondary">Searching your documents...</p>
          </div>
        )}

        {/* Search Results */}
        {!loading && results.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-textPrimary mb-4">
              Found {results.length} results for "{query}"
            </h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <ResultCard key={index} result={result} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && results.length === 0 && query && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">No results found</h3>
            <p className="text-textSecondary mb-6">Try different keywords or upload some documents first</p>
            <button onClick={() => navigate('/upload')} className="btn-primary">
              Upload Documents
            </button>
          </div>
        )}

        {/* Initial State */}
        {!loading && results.length === 0 && !query && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">Start Searching</h3>
            <p className="text-textSecondary mb-6">Enter a query above to search across your uploaded documents</p>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
              <p className="text-sm text-textSecondary mb-3">Example queries:</p>
              <div className="space-y-2">
                <button onClick={() => handleSearch('meeting notes')} className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm transition">
                  "meeting notes"
                </button>
                <button onClick={() => handleSearch('budget report')} className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm transition">
                  "budget report"
                </button>
                <button onClick={() => handleSearch('project deadline')} className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm transition">
                  "project deadline"
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;