// Comprehensive test to check frontend data flow
const axios = require('axios');

async function comprehensiveFrontendTest() {
  try {
    console.log('=== COMPREHENSIVE FRONTEND TEST ===');
    
    // 1. Test backend connectivity
    console.log('1. Testing backend connectivity...');
    try {
      const healthCheck = await axios.get('https://quodo3-backend.onrender.com/api/health');
      console.log('✓ Backend is reachable');
    } catch (error) {
      console.log('! Backend health check failed, but continuing with login test');
    }
    
    // 2. Test login
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Login successful');
    console.log('  Token length:', token.length);
    
    // 3. Test user data
    console.log('\n3. Testing user data retrieval...');
    const userResponse = await axios.get('https://quodo3-backend.onrender.com/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const user = userResponse.data;
    console.log('✓ User data retrieved');
    console.log('  User ID:', user.id);
    console.log('  Username:', user.username);
    console.log('  Role:', user.role);
    
    // 4. Test all data endpoints
    console.log('\n4. Testing all data endpoints...');
    
    // Tasks
    const tasksResponse = await axios.get('https://quodo3-backend.onrender.com/api/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Tasks endpoint working, found', Array.isArray(tasksResponse.data) ? tasksResponse.data.length : 'unknown', 'items');
    
    // Leaves
    const leavesResponse = await axios.get('https://quodo3-backend.onrender.com/api/leaves', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Leaves endpoint working, found', Array.isArray(leavesResponse.data) ? leavesResponse.data.length : 'unknown', 'items');
    
    // Users
    const usersResponse = await axios.get('https://quodo3-backend.onrender.com/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Users endpoint working, found', Array.isArray(usersResponse.data) ? usersResponse.data.length : 'unknown', 'items');
    
    // Dropdowns
    const dropdownsResponse = await axios.get('https://quodo3-backend.onrender.com/api/dropdowns', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Dropdowns endpoint working, found', Array.isArray(dropdownsResponse.data) ? dropdownsResponse.data.length : 'unknown', 'items');
    
    console.log('\n=== ALL TESTS PASSED ===');
    console.log('Backend is working correctly and returning data.');
    console.log('The issue is likely in the frontend display layer.');
    
    // 5. Analyze data structure
    console.log('\n5. Analyzing data structure...');
    console.log('Tasks sample:', JSON.stringify(tasksResponse.data.slice(0, 1), null, 2));
    console.log('Leaves sample:', JSON.stringify(leavesResponse.data.slice(0, 1), null, 2));
    console.log('Users sample:', JSON.stringify(usersResponse.data.slice(0, 1), null, 2));
    
  } catch (error) {
    console.error('Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

comprehensiveFrontendTest();