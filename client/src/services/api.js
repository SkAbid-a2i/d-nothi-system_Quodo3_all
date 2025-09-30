import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// User endpoints
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Task endpoints
export const taskAPI = {
  getAllTasks: () => api.get('/tasks'),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

// Leave endpoints
export const leaveAPI = {
  getAllLeaves: () => api.get('/leaves'),
  createLeave: (leaveData) => api.post('/leaves', leaveData),
  approveLeave: (id) => api.put(`/leaves/${id}/approve`),
  rejectLeave: (id, rejectionData) => api.put(`/leaves/${id}/reject`),
};

// Dropdown endpoints
export const dropdownAPI = {
  getDropdownValues: (type, parentValue) => api.get(`/dropdowns/${type}`, { params: { parentValue } }),
  createDropdownValue: (dropdownData) => api.post('/dropdowns', dropdownData),
  updateDropdownValue: (id, dropdownData) => api.put(`/dropdowns/${id}`, dropdownData),
};

// Report endpoints
export const reportAPI = {
  getTaskReport: (params) => api.get('/reports/tasks', { params }),
  getLeaveReport: (params) => api.get('/reports/leaves', { params }),
  getSummaryReport: (params) => api.get('/reports/summary', { params }),
};

export default api;