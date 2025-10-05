// Test script to check frontend API configuration
console.log('Testing frontend API configuration...');

// Check if environment variable is available
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Check if we're in production
console.log('NODE_ENV:', process.env.NODE_ENV);

// Simulate how the API service would be configured
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('Base URL that would be used:', baseURL);

// Check if we can access window.location in browser context
if (typeof window !== 'undefined') {
  console.log('Window location:', window.location.href);
  console.log('Window origin:', window.location.origin);
}