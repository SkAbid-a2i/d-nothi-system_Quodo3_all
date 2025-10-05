// Test script to check frontend data handling
const axios = require('axios');

async function testFrontendDataHandling() {
  try {
    console.log('=== TESTING FRONTEND DATA HANDLING ===');
    
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
    
    console.log('Tasks response analysis:');
    console.log('- Response type:', typeof tasksResponse);
    console.log('- Response keys:', Object.keys(tasksResponse));
    console.log('- Data property type:', typeof tasksResponse.data);
    console.log('- Data is array:', Array.isArray(tasksResponse.data));
    
    // Simulate frontend data handling
    console.log('\n3. Simulating frontend data handling...');
    
    // This is what the frontend was doing before the fix
    const oldTasksHandling = tasksResponse.data || [];
    console.log('- Old handling result type:', typeof oldTasksHandling);
    console.log('- Old handling result is array:', Array.isArray(oldTasksHandling));
    console.log('- Old handling result length:', oldTasksHandling.length);
    
    // This is what the frontend is doing after the fix
    const newTasksHandling = Array.isArray(tasksResponse.data) ? tasksResponse.data : 
                           tasksResponse.data?.data || tasksResponse.data || [];
    console.log('- New handling result type:', typeof newTasksHandling);
    console.log('- New handling result is array:', Array.isArray(newTasksHandling));
    console.log('- New handling result length:', newTasksHandling.length);
    
    // Test leaves API
    console.log('\n4. Testing leaves API...');
    const leavesResponse = await axios.get('https://quodo3-backend.onrender.com/api/leaves', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Leaves response analysis:');
    console.log('- Response type:', typeof leavesResponse);
    console.log('- Response keys:', Object.keys(leavesResponse));
    console.log('- Data property type:', typeof leavesResponse.data);
    console.log('- Data is array:', Array.isArray(leavesResponse.data));
    
    // Simulate frontend data handling for leaves
    console.log('\n5. Simulating frontend data handling for leaves...');
    
    // This is what the frontend was doing before the fix
    const oldLeavesHandling = leavesResponse.data || [];
    console.log('- Old handling result type:', typeof oldLeavesHandling);
    console.log('- Old handling result is array:', Array.isArray(oldLeavesHandling));
    console.log('- Old handling result length:', oldLeavesHandling.length);
    
    // This is what the frontend is doing after the fix
    const newLeavesHandling = Array.isArray(leavesResponse.data) ? leavesResponse.data : 
                             leavesResponse.data?.data || leavesResponse.data || [];
    console.log('- New handling result type:', typeof newLeavesHandling);
    console.log('- New handling result is array:', Array.isArray(newLeavesHandling));
    console.log('- New handling result length:', newLeavesHandling.length);
    
    console.log('\n=== TEST COMPLETE ===');
    console.log('If both old and new handling produce the same results, the issue might be elsewhere.');
    
  } catch (error) {
    console.error('Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testFrontendDataHandling();