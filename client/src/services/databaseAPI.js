import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Database API functions
export const databaseAPI = {
  // Get database information
  getDatabaseInfo: async () => {
    try {
      const response = await apiClient.get('/database/info');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get table structure information
  getTableInfo: async (tableName) => {
    try {
      const response = await apiClient.get(`/database/tables/${tableName}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default databaseAPI;