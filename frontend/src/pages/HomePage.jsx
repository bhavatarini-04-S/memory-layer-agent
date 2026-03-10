import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/api";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";

function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
      } catch (error) {
        console.error("Not authenticated:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      title: "Dashboard",
      icon: "📊",
      description: "View analytics and recent activity",
      path: "/dashboard",
      color: "from-indigo-500 to-purple-600"
    },
    {
      title: "Upload Files",
      icon: "📤",
      description: "Upload documents for AI analysis",
      path: "/upload",
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Search",
      icon: "🔍",
      description: "Search through your documents",
      path: "/chat",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "File Details",
      icon: "📁",
      description: "Manage and view your files",
      path: "/file-details",
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size="xl" showText={false} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your AI-powered document assistant is ready to help
          </p>
        </div>

        {/* Quick Stats */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Files</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Processed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Searches</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.user_type || "User"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Account Type</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            What would you like to do?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <button
                key={feature.path}
                onClick={() => navigate(feature.path)}
                className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                {/* Content */}
                <div className="relative p-8 flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-4xl shadow-lg`}>
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to get started?
            </h3>
            <p className="text-indigo-100 mb-6">
              Upload your first document and let our AI analyze it for you
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition shadow-lg"
            >
              Upload Your First File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
