import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, setAuthToken, setUser } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const loginData = {
      password,
      ...(loginMethod === 'email' ? { email } : { phone })
    };

    try {
      console.log('Attempting login with:', { ...loginData, password: '***' });
      const response = await authAPI.login(loginData);
      console.log('Login successful:', response.data);
      
      // Store token and user info
      setAuthToken(response.data.access_token);
      setUser(response.data.user);
      
      // Redirect to home page
      navigate('/home');
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:8000';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email/phone or password. Please check your credentials.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">I</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-textPrimary">
            Welcome to InboxAI
          </h1>
          <p className="text-textSecondary mt-2">
            AI-powered information retrieval platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-heading font-semibold text-textPrimary mb-6">
            Sign In
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Method Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                loginMethod === 'email'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                loginMethod === 'phone'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Phone
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMethod === 'email' ? (
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  disabled={isLoading}
                  className="input-field disabled:bg-gray-50"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  required
                  disabled={isLoading}
                  className="input-field disabled:bg-gray-50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-textPrimary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="input-field disabled:bg-gray-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-textSecondary text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-primary hover:text-indigo-700 font-semibold transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-textSecondary hover:text-textPrimary text-sm transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;