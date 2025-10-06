const axios = require('axios');

// Test the API endpoints
async function testComponents() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test base URL
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    console.log(`Base URL: ${baseURL}\n`);
    
    // Test tasks endpoint
    try {
      console.log('1. Testing tasks endpoint...');
      const tasksResponse = await axios.get(`${baseURL}/tasks`);
      console.log('✅ Tasks endpoint working');
      console.log(`   Found ${tasksResponse.data.length} tasks\n`);
    } catch (error) {
      console.log('❌ Tasks endpoint error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
      console.log('');
    }
    
    // Test dropdowns endpoint
    try {
      console.log('2. Testing dropdowns endpoint...');
      const dropdownsResponse = await axios.get(`${baseURL}/dropdowns`);
      console.log('✅ Dropdowns endpoint working');
      console.log(`   Found ${dropdownsResponse.data.length} dropdown values\n`);
    } catch (error) {
      console.log('❌ Dropdowns endpoint error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
      console.log('');
    }
    
    // Test permission templates endpoint
    try {
      console.log('3. Testing permission templates endpoint...');
      const permissionsResponse = await axios.get(`${baseURL}/permissions/templates`);
      console.log('✅ Permission templates endpoint working');
      console.log(`   Found ${permissionsResponse.data.length} permission templates\n`);
    } catch (error) {
      console.log('❌ Permission templates endpoint error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testComponents();