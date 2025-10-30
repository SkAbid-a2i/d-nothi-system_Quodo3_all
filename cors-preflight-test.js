const axios = require('axios');

// Test the CORS preflight request from the new domain
async function testPreflight() {
  try {
    console.log('Testing CORS preflight from new domain: https://d-nothi-zenith.vercel.app');
    
    const response = await axios.options('https://quodo3-backend.onrender.com/api/auth/login', {
      headers: {
        'Origin': 'https://d-nothi-zenith.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('Preflight successful!');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
  } catch (error) {
    console.log('Preflight failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error headers:', error.response?.headers);
    console.log('Error message:', error.message);
  }
  
  try {
    console.log('\nTesting CORS preflight from old domain: https://d-nothi-system-quodo3-all.vercel.app');
    
    const response = await axios.options('https://quodo3-backend.onrender.com/api/auth/login', {
      headers: {
        'Origin': 'https://d-nothi-system-quodo3-all.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('Preflight successful!');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
  } catch (error) {
    console.log('Preflight failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error headers:', error.response?.headers);
    console.log('Error message:', error.message);
  }
}

testPreflight();