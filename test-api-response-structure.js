// Test script to check the exact structure of API responses
const axios = require('axios');

async function testApiResponseStructure() {
  try {
    console.log('=== TESTING API RESPONSE STRUCTURE ===');
    
    // Login and get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Login successful, token received');
    console.log('Token:', token.substring(0, 20) + '...');
    
    // Test tasks API response structure
    console.log('\n2. Testing tasks API response structure...');
    const tasksResponse = await axios.get('https://quodo3-backend.onrender.com/api/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Tasks response structure:');
    console.log('- Status:', tasksResponse.status);
    console.log('- Data type:', typeof tasksResponse.data);
    console.log('- Is array:', Array.isArray(tasksResponse.data));
    console.log('- Data keys:', tasksResponse.data ? Object.keys(tasksResponse.data) : 'null');
    console.log('- Data length:', Array.isArray(tasksResponse.data) ? tasksResponse.data.length : 
                (typeof tasksResponse.data === 'object' && tasksResponse.data !== null) ? Object.keys(tasksResponse.data).length : 'N/A');
    
    if (Array.isArray(tasksResponse.data)) {
      console.log('- First item type:', typeof tasksResponse.data[0]);
      if (tasksResponse.data[0]) {
        console.log('- First item keys:', Object.keys(tasksResponse.data[0]));
      }
    } else if (typeof tasksResponse.data === 'object' && tasksResponse.data !== null) {
      console.log('- Data object sample:', JSON.stringify(tasksResponse.data, null, 2).substring(0, 200) + '...');
    }
    
    // Test leaves API response structure
    console.log('\n3. Testing leaves API response structure...');
    const leavesResponse = await axios.get('https://quodo3-backend.onrender.com/api/leaves', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Leaves response structure:');
    console.log('- Status:', leavesResponse.status);
    console.log('- Data type:', typeof leavesResponse.data);
    console.log('- Is array:', Array.isArray(leavesResponse.data));
    console.log('- Data keys:', leavesResponse.data ? Object.keys(leavesResponse.data) : 'null');
    console.log('- Data length:', Array.isArray(leavesResponse.data) ? leavesResponse.data.length : 
                (typeof leavesResponse.data === 'object' && leavesResponse.data !== null) ? Object.keys(leavesResponse.data).length : 'N/A');
    
    if (Array.isArray(leavesResponse.data)) {
      console.log('- First item type:', typeof leavesResponse.data[0]);
      if (leavesResponse.data[0]) {
        console.log('- First item keys:', Object.keys(leavesResponse.data[0]));
      }
    } else if (typeof leavesResponse.data === 'object' && leavesResponse.data !== null) {
      console.log('- Data object sample:', JSON.stringify(leavesResponse.data, null, 2).substring(0, 200) + '...');
    }
    
    // Test users API response structure
    console.log('\n4. Testing users API response structure...');
    const usersResponse = await axios.get('https://quodo3-backend.onrender.com/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Users response structure:');
    console.log('- Status:', usersResponse.status);
    console.log('- Data type:', typeof usersResponse.data);
    console.log('- Is array:', Array.isArray(usersResponse.data));
    console.log('- Data keys:', usersResponse.data ? Object.keys(usersResponse.data) : 'null');
    console.log('- Data length:', Array.isArray(usersResponse.data) ? usersResponse.data.length : 
                (typeof usersResponse.data === 'object' && usersResponse.data !== null) ? Object.keys(usersResponse.data).length : 'N/A');
    
    if (Array.isArray(usersResponse.data)) {
      console.log('- First item type:', typeof usersResponse.data[0]);
      if (usersResponse.data[0]) {
        console.log('- First item keys:', Object.keys(usersResponse.data[0]));
      }
    } else if (typeof usersResponse.data === 'object' && usersResponse.data !== null) {
      console.log('- Data object sample:', JSON.stringify(usersResponse.data, null, 2).substring(0, 200) + '...');
    }
    
    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testApiResponseStructure();