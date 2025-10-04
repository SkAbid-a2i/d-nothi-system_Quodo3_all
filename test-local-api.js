// Test script to verify local API functionality
const axios = require('axios');

async function testLocalAPI() {
  try {
    console.log('Testing local API endpoints...');
    
    // Test base URL
    const baseURL = 'http://localhost:5000/api';
    console.log(`Testing base URL: ${baseURL}`);
    
    // Test root endpoint
    const rootResponse = await axios.get('http://localhost:5000');
    console.log('Root endpoint response:', rootResponse.data);
    
    // Test auth endpoint
    try {
      const authResponse = await axios.post(`${baseURL}/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      console.log('✅ Auth endpoint working, token received');
      
      const token = authResponse.data.token;
      console.log('Token:', token.substring(0, 20) + '...');
      
      // Test dropdown fetching
      const dropdownResponse = await axios.get(`${baseURL}/dropdowns/Category`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Dropdown fetching successful, found:', dropdownResponse.data.length, 'categories');
      
      // Test task fetching
      const taskResponse = await axios.get(`${baseURL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Task fetching successful, found:', taskResponse.data.length, 'tasks');
      
      // Test leave fetching
      const leaveResponse = await axios.get(`${baseURL}/leaves`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Leave fetching successful, found:', leaveResponse.data.length, 'leaves');
      
      console.log('\n🎉 All local API tests passed!');
      
    } catch (authError) {
      console.error('❌ Auth/API test failed:', authError.response?.data || authError.message);
    }
    
  } catch (error) {
    console.error('❌ Local API test failed:', error.response?.data || error.message);
  }
}

testLocalAPI();