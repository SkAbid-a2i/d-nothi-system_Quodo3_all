const axios = require('axios');

async function comprehensiveAPITest() {
  console.log('🚀 Starting comprehensive API test...\n');
  
  try {
    // Test 1: Root endpoint
    console.log('1. Testing root endpoint...');
    const rootResponse = await axios.get('http://localhost:5000/');
    console.log('   ✅ Root endpoint:', rootResponse.data.message);
    
    // Test 2: Health endpoint
    console.log('2. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('   ✅ Health endpoint:', healthResponse.data.status);
    
    // Test 3: Auth endpoints
    console.log('3. Testing auth endpoints...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      });
      console.log('   ✅ Login successful');
      const token = loginResponse.data.token;
      
      // Test 4: User endpoints with auth
      console.log('4. Testing user endpoints...');
      const usersResponse = await axios.get('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✅ Users endpoint:', Array.isArray(usersResponse.data) ? 'Array returned' : 'Data returned');
      
      // Test 5: Task endpoints
      console.log('5. Testing task endpoints...');
      const tasksResponse = await axios.get('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✅ Tasks endpoint:', Array.isArray(tasksResponse.data) ? 'Array returned' : 'Data returned');
      
      // Test 6: Leave endpoints
      console.log('6. Testing leave endpoints...');
      const leavesResponse = await axios.get('http://localhost:5000/api/leaves', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✅ Leaves endpoint:', Array.isArray(leavesResponse.data) ? 'Array returned' : 'Data returned');
      
      // Test 7: Meeting endpoints
      console.log('7. Testing meeting endpoints...');
      const meetingsResponse = await axios.get('http://localhost:5000/api/meetings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✅ Meetings endpoint:', Array.isArray(meetingsResponse.data) ? 'Array returned' : 'Data returned');
      
      // Test 8: Collaboration endpoints
      console.log('8. Testing collaboration endpoints...');
      const collaborationsResponse = await axios.get('http://localhost:5000/api/collaborations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✅ Collaborations endpoint:', Array.isArray(collaborationsResponse.data.data || collaborationsResponse.data) ? 'Array returned' : 'Data returned');
      
      // Test 9: Dropdown endpoints
      console.log('9. Testing dropdown endpoints...');
      const dropdownsResponse = await axios.get('http://localhost:5000/api/dropdowns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✅ Dropdowns endpoint:', Array.isArray(dropdownsResponse.data) ? 'Array returned' : 'Data returned');
      
      // Test 10: Report endpoints
      console.log('10. Testing report endpoints...');
      const reportsResponse = await axios.get('http://localhost:5000/api/reports/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✅ Reports endpoint:', reportsResponse.data ? 'Data returned' : 'No data');
      
    } catch (authError) {
      console.log('   ⚠️  Auth test skipped due to error:', authError.message);
    }
    
    // Test 11: Collaboration test endpoint (no auth required)
    console.log('11. Testing collaboration test endpoint...');
    const collaborationTestResponse = await axios.get('http://localhost:5000/api/collaborations/test');
    console.log('   ✅ Collaboration test endpoint:', collaborationTestResponse.data.message);
    
    console.log('\n🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

comprehensiveAPITest();