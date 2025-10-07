import axios from 'axios';
import frontendLogger from './frontendLogger';

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
    const startTime = Date.now();
    config.metadata = { startTime };
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    frontendLogger.logApiCall(config.method.toUpperCase(), config.url, 'pending', 0);
    return config;
  },
  (error) => {
    frontendLogger.error('API Request Error', { error: error.message });
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration and log responses
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    frontendLogger.logApiCall(
      response.config.method.toUpperCase(), 
      response.config.url, 
      response.status, 
      duration
    );
    return response;
  },
  (error) => {
    const duration = Date.now() - (error.config?.metadata?.startTime || Date.now());
    frontendLogger.logApiCall(
      error.config?.method?.toUpperCase() || 'UNKNOWN', 
      error.config?.url || 'UNKNOWN', 
      error.response?.status || 'ERROR', 
      duration,
      error
    );
    
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      frontendLogger.warn('Authentication token expired or invalid, redirecting to login');
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
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
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
  updateLeave: (id, leaveData) => api.put(`/leaves/${id}`, leaveData),
  deleteLeave: (id) => api.delete(`/leaves/${id}`),
  approveLeave: (id) => api.put(`/leaves/${id}/approve`),
  rejectLeave: (id, rejectionData) => api.put(`/leaves/${id}/reject`, rejectionData),
};

// Dropdown endpoints
export const dropdownAPI = {
  getDropdownValues: (type, parentValue) => api.get(`/dropdowns/${type}`, { params: { parentValue } }),
  createDropdownValue: (dropdownData) => api.post('/dropdowns', dropdownData),
  updateDropdownValue: (id, dropdownData) => api.put(`/dropdowns/${id}`, dropdownData),
  deleteDropdownValue: (id) => api.delete(`/dropdowns/${id}`),
  getAllDropdowns: () => api.get('/dropdowns'),
};

// Report endpoints
export const reportAPI = {
  getTaskReport: (params) => api.get('/reports/tasks', { params }),
  getLeaveReport: (params) => api.get('/reports/leaves', { params }),
  getSummaryReport: (params) => api.get('/reports/summary', { params }),
};

// Audit endpoints
export const auditAPI = {
  getAllLogs: (params) => api.get('/audit', { params }),
  createLog: (logData) => api.post('/audit', logData),
};

// File endpoints
export const fileAPI = {
  uploadFile: (fileData) => api.post('/files/upload', fileData),
  getFiles: () => api.get('/files'),
  downloadFile: (id) => api.get(`/files/${id}/download`),
  deleteFile: (id) => api.delete(`/files/${id}`),
};

// Log endpoints
export const logAPI = {
  getLogs: (params) => api.get('/logs', { params }),
  getRecentLogs: () => api.get('/logs/recent'),
  analyzeLogs: (params) => api.get('/logs/analyze', { params }),
};

// Permission template endpoints
export const permissionAPI = {
  getAllTemplates: () => api.get('/permissions/templates'),
  createTemplate: (templateData) => api.post('/permissions/templates', templateData),
  updateTemplate: (id, templateData) => api.put(`/permissions/templates/${id}`, templateData),
  deleteTemplate: (id) => api.delete(`/permissions/templates/${id}`),
};

// Meeting endpoints
export const meetingAPI = {
  getAllMeetings: () => api.get('/meetings'),
  createMeeting: (meetingData) => api.post('/meetings', meetingData),
  updateMeeting: (id, meetingData) => api.put(`/meetings/${id}`, meetingData),
  deleteMeeting: (id) => api.delete(`/meetings/${id}`),
};

export default api;