const axios = require('axios');

async function testBackendEnvironment() {
  try {
    console.log('=== TESTING BACKEND ENVIRONMENT ===\n');
    
    const baseURL = 'https://quodo3-backend.onrender.com';
    console.log(`Testing backend at: ${baseURL}\n`);
    
    // Test root endpoint
    console.log('1. Testing root endpoint...');
    const rootResponse = await axios.get(baseURL);
    console.log('   ✓ Root endpoint accessible');
    console.log('   ✓ Message:', rootResponse.data.message);
    console.log('   ✓ Status:', rootResponse.data.status);
    
    // Test auth endpoint to verify user exists
    console.log('\n2. Testing authentication...');
    const authResponse = await axios.post(`${baseURL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = authResponse.data.token;
    const user = authResponse.data.user;
    console.log('   ✓ Authentication successful');
    console.log('   ✓ User:', user.username, `(${user.role})`);
    
    // Test a simple endpoint that doesn't require complex database operations
    console.log('\n3. Testing simple API endpoint...');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Try the dropdowns endpoint which might be simpler
    try {
      const dropdownsResponse = await axios.get(`${baseURL}/api/dropdowns`, config);
      console.log('   ✓ Dropdowns endpoint accessible');
      console.log('   ✓ Total dropdowns:', dropdownsResponse.data.length);
    } catch (dropdownError) {
      console.log('   ❌ Dropdowns endpoint failed');
      console.log('   Status:', dropdownError.response?.status);
      console.log('   Data:', dropdownError.response?.data);
    }
    
    // Try the users endpoint
    try {
      const usersResponse = await axios.get(`${baseURL}/api/users`, config);
      console.log('   ✓ Users endpoint accessible');
      console.log('   ✓ Total users:', usersResponse.data.length);
    } catch (userError) {
      console.log('   ❌ Users endpoint failed');
      console.log('   Status:', userError.response?.status);
      console.log('   Data:', userError.response?.data);
    }
    
  } catch (error) {
    console.error('=== BACKEND TEST FAILED ===');
    console.error('Error:', error.response?.data || error.message);
  }
}

testBackendEnvironment();