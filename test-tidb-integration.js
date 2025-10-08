const axios = require('axios');

async function testTiDBIntegration() {
  let authToken = null;
  
  try {
    console.log('🧪 Testing TiDB database integration...\n');
    
    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    authToken = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    const config = { 
      headers: { 
        'Authorization': `Bearer ${authToken}` 
      } 
    };
    
    // 2. Test fetching all data types
    console.log('2. Testing data fetching from TiDB...');
    
    // Test users
    const usersResponse = await axios.get('http://localhost:5001/api/users', config);
    console.log(`✅ Fetched ${usersResponse.data.length} users from TiDB`);
    
    // Test tasks
    const tasksResponse = await axios.get('http://localhost:5001/api/tasks', config);
    console.log(`✅ Fetched ${tasksResponse.data.length} tasks from TiDB`);
    
    // Test leaves
    const leavesResponse = await axios.get('http://localhost:5001/api/leaves', config);
    console.log(`✅ Fetched ${leavesResponse.data.length} leaves from TiDB`);
    
    // Test dropdowns
    const dropdownsResponse = await axios.get('http://localhost:5001/api/dropdowns', config);
    console.log(`✅ Fetched ${dropdownsResponse.data.length} dropdowns from TiDB`);
    
    // Test meetings
    const meetingsResponse = await axios.get('http://localhost:5001/api/meetings', config);
    console.log(`✅ Fetched ${meetingsResponse.data.length} meetings from TiDB`);
    
    console.log('\n🎉 All data types fetched successfully from TiDB!');
    
    // 3. Test CRUD operations
    console.log('\n3. Testing CRUD operations with TiDB...');
    
    // Create a test task
    const newTask = {
      date: new Date().toISOString().split('T')[0],
      source: 'Email',
      category: 'IT Support',
      service: 'Software',
      description: 'Test task for TiDB integration',
      status: 'Pending'
    };
    
    const createTaskResponse = await axios.post('http://localhost:5001/api/tasks', newTask, config);
    const taskId = createTaskResponse.data.id;
    console.log('✅ Created test task in TiDB');
    
    // Update the task
    const updatedTask = {
      status: 'Completed',
      description: 'Test task for TiDB integration - Updated'
    };
    
    await axios.put(`http://localhost:5001/api/tasks/${taskId}`, updatedTask, config);
    console.log('✅ Updated test task in TiDB');
    
    // Delete the task
    await axios.delete(`http://localhost:5001/api/tasks/${taskId}`, config);
    console.log('✅ Deleted test task from TiDB');
    
    console.log('\n🎉 All CRUD operations completed successfully with TiDB!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testTiDBIntegration();