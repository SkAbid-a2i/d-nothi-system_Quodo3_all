// Test script to verify frontend-backend communication
const axios = require('axios');

async function testFrontendBackend() {
  try {
    console.log('Testing frontend-backend communication...');
    
    // Test the API URL that the frontend uses
    const apiURL = 'https://quodo3-backend.onrender.com/api';
    console.log(`Testing API URL: ${apiURL}`);
    
    // Test root endpoint (no authentication required)
    const rootResponse = await axios.get(apiURL.replace('/api', ''));
    console.log('Root endpoint response:', rootResponse.data);
    
    // Test auth endpoint with a known user
    console.log('Testing authentication...');
    const authResponse = await axios.post(`${apiURL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('Authentication successful');
    const token = authResponse.data.token;
    
    // Test endpoints that require authentication
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const usersResponse = await axios.get(`${apiURL}/users`, config);
    console.log(`Users endpoint working, found ${usersResponse.data.length} users`);
    
    const tasksResponse = await axios.get(`${apiURL}/tasks`, config);
    console.log(`Tasks endpoint working, found ${tasksResponse.data.length} tasks`);
    
    const leavesResponse = await axios.get(`${apiURL}/leaves`, config);
    console.log(`Leaves endpoint working, found ${leavesResponse.data.length} leaves`);
    
    console.log('Frontend-backend communication test completed successfully');
    
  } catch (error) {
    console.error('Frontend-backend communication test failed:', error.response?.data || error.message);
  }
}

testFrontendBackend();