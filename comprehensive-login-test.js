const axios = require('axios');

// Test the login endpoint from the new domain
async function testLogin() {
  try {
    console.log('Testing login from new domain: https://d-nothi-zenith.vercel.app');
    
    const response = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Origin': 'https://d-nothi-zenith.vercel.app',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', response.data);
  } catch (error) {
    console.log('Login failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error headers:', error.response?.headers);
    console.log('Error data:', error.response?.data);
    console.log('Error message:', error.message);
  }
  
  try {
    console.log('\nTesting login from old domain: https://d-nothi-system-quodo3-all.vercel.app');
    
    const response = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Origin': 'https://d-nothi-system-quodo3-all.vercel.app',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', response.data);
  } catch (error) {
    console.log('Login failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error headers:', error.response?.headers);
    console.log('Error data:', error.response?.data);
    console.log('Error message:', error.message);
  }
}

testLogin();