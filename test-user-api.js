// Test script to verify user API functionality
require('dotenv').config();
const axios = require('axios');

async function testUserAPI() {
  try {
    console.log('Testing User API...');
    
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    console.log('Token:', token.substring(0, 20) + '...');
    
    // Test getting all users
    const usersResponse = await axios.get('http://localhost:5000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Users API call successful');
    console.log('Users count:', usersResponse.data.length);
    console.log('First user:', usersResponse.data[0]);
    
  } catch (error) {
    console.error('❌ Error testing User API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testUserAPI();