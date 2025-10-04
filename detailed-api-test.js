// Detailed test script to verify API functionality
const axios = require('axios');

async function detailedAPITest() {
  try {
    console.log('Testing detailed API endpoints...');
    
    // Test base URL
    const baseURL = 'http://localhost:5000/api';
    console.log(`Testing base URL: ${baseURL}`);
    
    // Test auth endpoint
    try {
      const authResponse = await axios.post(`${baseURL}/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      console.log('✅ Auth endpoint working, token received');
      
      const token = authResponse.data.token;
      console.log('Token length:', token.length);
      
      // Test user fetching (SystemAdmin only)
      try {
        const userResponse = await axios.get(`${baseURL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ User fetching successful, found:', userResponse.data.length, 'users');
      } catch (userError) {
        console.log('❌ User fetching failed:', userError.response?.status, userError.response?.data || userError.message);
      }
      
      // Test dropdown fetching
      try {
        const dropdownResponse = await axios.get(`${baseURL}/dropdowns/Category`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Dropdown fetching successful, found:', dropdownResponse.data.length, 'categories');
      } catch (dropdownError) {
        console.log('❌ Dropdown fetching failed:', dropdownError.response?.status, dropdownError.response?.data || dropdownError.message);
      }
      
      // Test task fetching
      try {
        const taskResponse = await axios.get(`${baseURL}/tasks`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Task fetching successful, found:', taskResponse.data.length, 'tasks');
      } catch (taskError) {
        console.log('❌ Task fetching failed:', taskError.response?.status, taskError.response?.data || taskError.message);
      }
      
      // Test leave fetching
      try {
        const leaveResponse = await axios.get(`${baseURL}/leaves`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Leave fetching successful, found:', leaveResponse.data.length, 'leaves');
      } catch (leaveError) {
        console.log('❌ Leave fetching failed:', leaveError.response?.status, leaveError.response?.data || leaveError.message);
      }
      
      console.log('\n🎉 Basic API tests completed!');
      
    } catch (authError) {
      console.error('❌ Auth test failed:', authError.response?.status, authError.response?.data || authError.message);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

detailedAPITest();