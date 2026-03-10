import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchAPI, fileAPI } from "../services/api";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await searchAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    navigate(`/chat?q=${encodeURIComponent(query)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} placeholder="Search your documents..." />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-indigo-600">
            <h3 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{stats?.total_files || 0}</h3>
            <p className="text-gray-600 dark:text-gray-400">Files Uploaded</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-600">
            <h3 className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{stats?.total_searches || 0}</h3>
            <p className="text-gray-600 dark:text-gray-400">Searches Performed</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-600">
            <h3 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{stats?.processed_files || 0}</h3>
            <p className="text-gray-600 dark:text-gray-400">Processed Successfully</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Searches */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Searches</h3>
            <div className="space-y-3">
              {stats?.recent_searches?.length > 0 ? (
                stats.recent_searches.map((search, index) => (
                  <div key={index} className="flex items-center justify-between border-b dark:border-gray-700 pb-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{search.query}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{search.results_count} results</p>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(search.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">No searches yet</p>
              )}
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Uploads</h3>
            <div className="space-y-3">
              {stats?.recent_uploads?.length > 0 ? (
                stats.recent_uploads.map((file, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium text-textPrimary">{file.filename}</p>
                      <p className="text-sm text-textSecondary">
                        <span className={`badge-${file.status}`}>{file.status}</span>
                      </p>
                    </div>
                    <span className="text-sm text-textSecondary">
                      {new Date(file.upload_date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-textSecondary text-center py-4">No files uploaded yet</p>
              )}
            </div>
            <button
              onClick={() => navigate("/upload")}
              className="mt-4 w-full btn-primary"
            >
              Upload Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;