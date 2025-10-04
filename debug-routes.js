// Debug script to test route handling
const axios = require('axios');

async function debugRoutes() {
  try {
    console.log('Debugging route handling...');
    
    // Test auth endpoint
    const authResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ Auth successful');
    
    const token = authResponse.data.token;
    
    // Test dropdown route with detailed error handling
    try {
      console.log('\nTesting dropdown route...');
      const dropdownResponse = await axios.get('http://localhost:5000/api/dropdowns/Category', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Dropdown route successful');
    } catch (dropdownError) {
      console.log('❌ Dropdown route failed:');
      console.log('Status:', dropdownError.response?.status);
      console.log('Status Text:', dropdownError.response?.statusText);
      console.log('Data:', dropdownError.response?.data);
      console.log('Headers:', dropdownError.response?.headers);
    }
    
    // Test task route
    try {
      console.log('\nTesting task route...');
      const taskResponse = await axios.get('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Task route successful');
    } catch (taskError) {
      console.log('❌ Task route failed:');
      console.log('Status:', taskError.response?.status);
      console.log('Status Text:', taskError.response?.statusText);
      console.log('Data:', taskError.response?.data);
    }
    
    // Test leave route
    try {
      console.log('\nTesting leave route...');
      const leaveResponse = await axios.get('http://localhost:5000/api/leaves', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Leave route successful');
    } catch (leaveError) {
      console.log('❌ Leave route failed:');
      console.log('Status:', leaveError.response?.status);
      console.log('Status Text:', leaveError.response?.statusText);
      console.log('Data:', leaveError.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

debugRoutes();