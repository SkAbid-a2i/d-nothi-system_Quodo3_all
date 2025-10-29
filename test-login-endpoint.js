// Test script to check login endpoint
const axios = require('axios');

async function testLoginEndpoint() {
  try {
    console.log('Testing login endpoint...');
    
    // Test the login endpoint
    const response = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Origin': 'https://d-nothi-zenith.vercel.app',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login response:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Login error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    }
  }
}

testLoginEndpoint();