import axios from 'axios';

// Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => axiosInstance.post('/auth/signup', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  getCurrentUser: () => axiosInstance.get('/auth/me'),
  updateTheme: (theme) => axiosInstance.put(`/auth/theme?theme=${theme}`),
};

// File APIs
export const fileAPI = {
  upload: (formData) => {
    return axiosInstance.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  list: (skip = 0, limit = 50) => axiosInstance.get(`/files/?skip=${skip}&limit=${limit}`),
  getDetails: (fileId) => axiosInstance.get(`/files/${fileId}`),
  delete: (fileId) => axiosInstance.delete(`/files/${fileId}`),
};

// Search APIs
export const searchAPI = {
  search: (data) => axiosInstance.post('/search/', data),
  getDashboard: () => axiosInstance.get('/search/dashboard'),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (limit = 50, unreadOnly = false) => 
    axiosInstance.get('/notifications/', { params: { limit, unread_only: unreadOnly } })
      .then(res => res.data),
  
  getUnreadCount: () => 
    axiosInstance.get('/notifications/unread-count')
      .then(res => res.data),
  
  markRead: (notificationId) => 
    axiosInstance.put(`/notifications/${notificationId}/read`)
      .then(res => res.data),
  
  markAllRead: () => 
    axiosInstance.put('/notifications/mark-all-read')
      .then(res => res.data),
  
  delete: (notificationId) => 
    axiosInstance.delete(`/notifications/${notificationId}`)
      .then(res => res.data),
  
  createTest: () => 
    axiosInstance.post('/notifications/test')
      .then(res => res.data),
};

// Combined API object for convenience
export const api = {
  // Auth
  signup: authAPI.signup,
  login: authAPI.login,
  getCurrentUser: authAPI.getCurrentUser,
  updateTheme: authAPI.updateTheme,
  
  // Files
  uploadFile: fileAPI.upload,
  getFiles: fileAPI.list,
  getFileDetails: fileAPI.getDetails,
  deleteFile: fileAPI.delete,
  
  // Search
  search: searchAPI.search,
  getDashboard: searchAPI.getDashboard,
  
  // Notifications
  getNotifications: notificationAPI.getNotifications,
  getUnreadNotificationCount: notificationAPI.getUnreadCount,
  markNotificationRead: notificationAPI.markRead,
  markAllNotificationsRead: notificationAPI.markAllRead,
  deleteNotification: notificationAPI.delete,
  createTestNotification: notificationAPI.createTest,
};

// Helper functions
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export default axiosInstance;
