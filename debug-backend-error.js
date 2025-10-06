const axios = require('axios');

async function debugBackendError() {
  try {
    console.log('=== DEBUG BACKEND ERROR ===\n');
    
    const baseURL = 'https://quodo3-backend.onrender.com/api';
    console.log(`Testing with base URL: ${baseURL}\n`);
    
    // Test authentication
    console.log('1. Testing authentication...');
    const authResponse = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = authResponse.data.token;
    console.log('   ✓ Authentication successful');
    
    // Test tasks endpoint with detailed error handling
    console.log('\n2. Testing tasks endpoint with detailed error info...');
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Increase timeout
        timeout: 30000
      };
      
      const tasksResponse = await axios.get(`${baseURL}/tasks`, config);
      console.log('   ✓ Tasks retrieval successful');
      console.log('   ✓ Total tasks:', tasksResponse.data.length);
      
    } catch (taskError) {
      console.log('   ❌ Tasks endpoint failed');
      console.log('   Status:', taskError.response?.status);
      console.log('   Status Text:', taskError.response?.statusText);
      console.log('   Headers:', taskError.response?.headers);
      
      if (taskError.response?.data) {
        console.log('   Error Data:', JSON.stringify(taskError.response.data, null, 2));
      }
      
      console.log('   Message:', taskError.message);
      console.log('   Stack:', taskError.stack);
    }
    
  } catch (error) {
    console.error('=== DEBUG FAILED ===');
    console.error('Error:', error.response?.data || error.message);
  }
}

debugBackendError();