// Debug script to check frontend data handling
const axios = require('axios');

async function debugFrontendData() {
  try {
    console.log('=== DEBUGGING FRONTEND DATA HANDLING ===');
    
    // Login and get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Login successful, token received');
    
    // Test tasks API
    console.log('\n2. Testing tasks API...');
    const tasksResponse = await axios.get('https://quodo3-backend.onrender.com/api/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Tasks response status:', tasksResponse.status);
    console.log('Tasks data type:', typeof tasksResponse.data);
    console.log('Tasks data length:', Array.isArray(tasksResponse.data) ? tasksResponse.data.length : 'Not an array');
    console.log('Sample tasks data:', JSON.stringify(tasksResponse.data.slice(0, 2), null, 2));
    
    // Test leaves API
    console.log('\n3. Testing leaves API...');
    const leavesResponse = await axios.get('https://quodo3-backend.onrender.com/api/leaves', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Leaves response status:', leavesResponse.status);
    console.log('Leaves data type:', typeof leavesResponse.data);
    console.log('Leaves data length:', Array.isArray(leavesResponse.data) ? leavesResponse.data.length : 'Not an array');
    console.log('Sample leaves data:', JSON.stringify(leavesResponse.data.slice(0, 2), null, 2));
    
    // Test users API
    console.log('\n4. Testing users API...');
    const usersResponse = await axios.get('https://quodo3-backend.onrender.com/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Users response status:', usersResponse.status);
    console.log('Users data type:', typeof usersResponse.data);
    console.log('Users data length:', Array.isArray(usersResponse.data) ? usersResponse.data.length : 'Not an array');
    console.log('Sample users data:', JSON.stringify(usersResponse.data.slice(0, 2), null, 2));
    
    // Test dropdowns API
    console.log('\n5. Testing dropdowns API...');
    const dropdownsResponse = await axios.get('https://quodo3-backend.onrender.com/api/dropdowns', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Dropdowns response status:', dropdownsResponse.status);
    console.log('Dropdowns data type:', typeof dropdownsResponse.data);
    console.log('Dropdowns data length:', Array.isArray(dropdownsResponse.data) ? dropdownsResponse.data.length : 'Not an array');
    console.log('Sample dropdowns data:', JSON.stringify(dropdownsResponse.data.slice(0, 5), null, 2));
    
    console.log('\n=== DEBUG COMPLETE ===');
    console.log('If you see this message, the backend APIs are working correctly.');
    console.log('The issue is likely in the frontend component data handling.');
    
  } catch (error) {
    console.error('Debug failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

debugFrontendData();