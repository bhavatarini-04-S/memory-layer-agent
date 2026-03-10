import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useTheme } from "../context/ThemeContext";

function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Logo size="md" showText={true} />
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-800 dark:text-white mb-6">
          AI that manages your inbox
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          InboxAI is your intelligent inbox assistant that organizes, prioritizes,
          and helps you manage all your emails, documents, and communications effortlessly.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 transition shadow-lg"
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
          How InboxAI Helps You
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🧠</div>
            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Smart Memory</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Never forget important information. Our AI remembers everything across
              your emails, documents, and notes, making it instantly searchable.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">📄</div>
            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Multi-Source Search</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Search across all your data sources simultaneously. Find information
              from PDFs, CSVs, emails, and documents in seconds.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">💬</div>
            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Natural Conversations</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Ask questions naturally and get intelligent answers. Our AI understands
              context and provides relevant information instantly.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🎤</div>
            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Voice Assistant</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Use voice commands to upload files, search documents, and retrieve information.
              Hands-free document management powered by AI.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🔒</div>
            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Secure & Private</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Your data stays private. All processing happens securely, and your
              information is never shared with third parties.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Lightning Fast</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Get instant answers powered by advanced vector embeddings and
              intelligent caching for optimal performance.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose InboxAI?
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-bold text-lg mb-2">Save Time</h4>
                <p className="text-gray-600">
                  Stop wasting hours searching for information. Get instant answers
                  to any question about your data.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-bold text-lg mb-2">Boost Productivity</h4>
                <p className="text-gray-600">
                  Focus on what matters. Let AI handle document management and
                  information retrieval.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-bold text-lg mb-2">Make Better Decisions</h4>
                <p className="text-gray-600">
                  Access all your information instantly to make informed decisions
                  based on complete context.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-bold text-lg mb-2">Stay Organized</h4>
                <p className="text-gray-600">
                  Keep all your documents, emails, and data organized and easily
                  accessible in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-6">
          Ready to Transform Your Inbox?
        </h3>
        <p className="text-lg text-gray-600 mb-8">
          Join thousands of users who trust InboxAI to manage their communications
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 transition shadow-lg"
        >
          Get Started Free
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2026 InboxAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
