// Detailed test to check login process
const axios = require('axios');

async function detailedLoginTest() {
  try {
    console.log('Starting detailed login test...');
    
    // Test 1: Check if we can access the API root
    console.log('\n1. Testing API root endpoint...');
    const rootResponse = await axios.get('https://quodo3-backend.onrender.com/', {
      headers: {
        'Origin': 'https://d-nothi-zenith.vercel.app'
      }
    });
    console.log('Root endpoint response:', rootResponse.status);
    console.log('Root endpoint data:', rootResponse.data);
    
    // Test 2: Test the login endpoint with proper headers
    console.log('\n2. Testing login endpoint...');
    const loginResponse = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Origin': 'https://d-nothi-zenith.vercel.app',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', loginResponse.headers);
    console.log('Login response data token length:', loginResponse.data.token?.length);
    console.log('Login response user:', loginResponse.data.user?.username);
    
    // Test 3: Test using the token to access protected endpoints
    console.log('\n3. Testing protected endpoint with token...');
    const authResponse = await axios.get('https://quodo3-backend.onrender.com/api/auth/me', {
      headers: {
        'Origin': 'https://d-nothi-zenith.vercel.app',
        'Authorization': `Bearer ${loginResponse.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Auth response status:', authResponse.status);
    console.log('Auth response user:', authResponse.data?.username);
    
    console.log('\nAll tests passed! The API is working correctly with the new domain.');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    }
  }
}

detailedLoginTest();