// Test API connection from frontend
import axios from 'axios';

const testApiConnection = async () => {
  try {
    console.log('Testing API connection from frontend...');
    
    // Test the API URL being used
    console.log('API Base URL:', process.env.REACT_APP_API_URL);
    
    // Create a test axios instance
    const testApi = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Testing base URL:', testApi.defaults.baseURL);
    
    // Test a simple endpoint
    const response = await testApi.get('/');
    console.log('API Root Response:', response.data);
    
    return true;
  } catch (error) {
    console.error('Frontend API test failed:', error);
    return false;
  }
};

export default testApiConnection;