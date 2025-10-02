// Comprehensive test script to verify all functionalities
const axios = require('axios');

async function comprehensiveTest() {
  try {
    console.log('=== Comprehensive Functionality Test ===\n');
    
    // Test base URL
    const baseURL = 'https://quodo3-backend.onrender.com/api';
    console.log(`Testing base URL: ${baseURL}`);
    
    // Test 1: Root endpoint
    try {
      const rootResponse = await axios.get(baseURL.replace('/api', ''));
      console.log('✓ Root endpoint working:', rootResponse.data.message);
    } catch (error) {
      console.log('✗ Root endpoint failed:', error.message);
    }
    
    // Test 2: Authentication
    let token = null;
    let testUser = null;
    
    try {
      const authResponse = await axios.post(`${baseURL}/auth/login`, {
        username: 'testuser3',
        password: 'password123'
      });
      token = authResponse.data.token;
      testUser = authResponse.data.user;
      console.log('✓ Authentication successful, user role:', testUser.role);
    } catch (error) {
      console.log('✗ Authentication failed:', error.response?.data?.message || error.message);
      return;
    }
    
    // Configure axios with token
    const api = axios.create({
      baseURL: baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test 3: Get current user
    try {
      const userResponse = await api.get('/auth/me');
      console.log('✓ Current user retrieval successful, user ID:', userResponse.data.id);
    } catch (error) {
      console.log('✗ Current user retrieval failed:', error.response?.data?.message || error.message);
    }
    
    // Test 4: Get all users (SystemAdmin only)
    try {
      const usersResponse = await api.get('/users');
      console.log('✓ Users retrieval successful, count:', usersResponse.data.length);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('ℹ Users retrieval denied (expected for non-SystemAdmin users)');
      } else {
        console.log('✗ Users retrieval failed:', error.response?.data?.message || error.message);
      }
    }
    
    // Test 5: Get all tasks
    try {
      const tasksResponse = await api.get('/tasks');
      console.log('✓ Tasks retrieval successful, count:', tasksResponse.data.length);
    } catch (error) {
      console.log('✗ Tasks retrieval failed:', error.response?.data?.message || error.message);
    }
    
    // Test 6: Create a task
    try {
      const taskResponse = await api.post('/tasks', {
        date: new Date().toISOString(),
        source: 'API Test',
        category: 'IT Support',
        service: 'Software',
        description: 'Test task from comprehensive test',
        status: 'Pending',
        office: testUser.office || 'Test Office'
      });
      console.log('✓ Task creation successful, task ID:', taskResponse.data.id);
    } catch (error) {
      console.log('✗ Task creation failed:', error.response?.data?.message || error.message);
    }
    
    // Test 7: Get all leaves
    try {
      const leavesResponse = await api.get('/leaves');
      console.log('✓ Leaves retrieval successful, count:', leavesResponse.data.length);
    } catch (error) {
      console.log('✗ Leaves retrieval failed:', error.response?.data?.message || error.message);
    }
    
    // Test 8: Create a leave request
    let leaveId = null;
    try {
      const leaveResponse = await api.post('/leaves', {
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        endDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
        reason: 'Comprehensive test leave request',
        appliedDate: new Date().toISOString().split('T')[0]
      });
      leaveId = leaveResponse.data.id;
      console.log('✓ Leave creation successful, leave ID:', leaveId);
    } catch (error) {
      console.log('✗ Leave creation failed:', error.response?.data?.message || error.message);
    }
    
    // Test 9: Get dropdown values
    try {
      const dropdownsResponse = await api.get('/dropdowns/category');
      console.log('✓ Dropdown retrieval successful, categories count:', dropdownsResponse.data.length);
    } catch (error) {
      console.log('✗ Dropdown retrieval failed:', error.response?.data?.message || error.message);
    }
    
    // Test 10: Get reports (if user has permission)
    try {
      const reportsResponse = await api.get('/reports/tasks');
      console.log('✓ Task reports retrieval successful');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('ℹ Task reports retrieval denied (expected for non-admin users)');
      } else {
        console.log('✗ Task reports retrieval failed:', error.response?.data?.message || error.message);
      }
    }
    
    // Test 11: Get audit logs (SystemAdmin only)
    try {
      const auditResponse = await api.get('/audit');
      console.log('✓ Audit logs retrieval successful, count:', auditResponse.data.length);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('ℹ Audit logs retrieval denied (expected for non-SystemAdmin users)');
      } else {
        console.log('✗ Audit logs retrieval failed:', error.response?.data?.message || error.message);
      }
    }
    
    console.log('\n=== Test Summary ===');
    console.log('All tests completed. Check output above for results.');
    
  } catch (error) {
    console.error('Comprehensive test failed with unexpected error:', error);
  }
}

comprehensiveTest();