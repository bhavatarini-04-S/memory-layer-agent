import { useState } from 'react';

function SearchBar({ onSearch, placeholder = "Search messages or documents using natural language..." }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSearch(query);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg
            className="w-5 h-5 text-textSecondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full pl-12 pr-32 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-textSecondary hover:text-textPrimary transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Searching...</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>
      </div>

      {/* Example queries */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-sm text-textSecondary">Try:</span>
        {['Find emails about project deadlines', 'Show budget documents', 'Meeting notes from last week'].map((example, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setQuery(example)}
            className="text-sm text-primary hover:text-indigo-700 hover:underline transition-colors"
          >
            "{example}"
          </button>
        ))}
      </div>
    </form>
  );
}

export default SearchBar;
