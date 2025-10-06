import axios from 'axios';

const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test the base URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    console.log('Testing base URL:', baseUrl);
    
    // Test root endpoint
    const rootResponse = await axios.get(baseUrl);
    console.log('Root endpoint response:', rootResponse.data);
    
    // Test login
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('Login successful');
    console.log('Token:', loginResponse.data.token ? 'Received' : 'Not received');
    console.log('User:', loginResponse.data.user.username);
    
    // Test getting current user with the token
    const userResponse = await axios.get(`${baseUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('Current user fetched successfully');
    console.log('User ID:', userResponse.data.id);
    console.log('User role:', userResponse.data.role);
    
    // Test getting users
    const usersResponse = await axios.get(`${baseUrl}/users`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('Users fetched successfully');
    console.log('User count:', usersResponse.data.length);
    
  } catch (error) {
    console.error('API connection test failed:', error.response?.data || error.message);
  }
};

testApiConnection();