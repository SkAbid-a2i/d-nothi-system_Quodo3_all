const axios = require('axios');

async function debugTasks() {
  try {
    console.log('=== DEBUG TASKS ENDPOINT ===\n');
    
    const baseURL = 'https://quodo3-backend.onrender.com/api';
    console.log(`Testing with base URL: ${baseURL}\n`);
    
    // Test authentication
    console.log('1. Testing authentication...');
    const authResponse = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = authResponse.data.token;
    const user = authResponse.data.user;
    console.log('   ✓ Authentication successful');
    console.log('   ✓ User:', user.username, `(${user.role})`);
    console.log('   ✓ Office:', user.office || 'No office');
    
    // Test tasks endpoint with detailed error handling
    console.log('\n2. Testing tasks endpoint...');
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const tasksResponse = await axios.get(`${baseURL}/tasks`, config);
      console.log('   ✓ Tasks retrieval successful');
      console.log('   ✓ Total tasks:', tasksResponse.data.length);
      
      // Try to create a task
      console.log('\n3. Testing task creation...');
      const newTask = {
        date: new Date().toISOString().split('T')[0],
        source: 'Debug Test',
        category: 'Testing',
        service: 'Debug',
        description: 'Debug task creation test',
        status: 'Pending',
        office: user.office || 'Head Office'
      };
      
      const createTaskResponse = await axios.post(`${baseURL}/tasks`, newTask, config);
      console.log('   ✓ Task creation successful');
      console.log('   ✓ New task ID:', createTaskResponse.data.id);
      
    } catch (taskError) {
      console.log('   ❌ Tasks endpoint failed');
      console.log('   Status:', taskError.response?.status);
      console.log('   Status Text:', taskError.response?.statusText);
      console.log('   Data:', taskError.response?.data);
      console.log('   Message:', taskError.message);
      
      if (taskError.response?.data) {
        console.log('   Error Details:', JSON.stringify(taskError.response.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('=== DEBUG FAILED ===');
    console.error('Error:', error.response?.data || error.message);
  }
}

debugTasks();