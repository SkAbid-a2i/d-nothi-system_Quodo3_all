const axios = require('axios');

async function backendSchemaTest() {
  try {
    console.log('=== BACKEND SCHEMA TEST ===\n');
    
    const baseURL = 'https://quodo3-backend.onrender.com/api';
    console.log(`Testing with base URL: ${baseURL}\n`);
    
    // Test authentication
    console.log('1. Testing authentication...');
    const authResponse = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = authResponse.data.token;
    console.log('   ✓ Authentication successful');
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Test if we can get more detailed error information
    console.log('\n2. Testing detailed error information...');
    try {
      const tasksResponse = await axios.get(`${baseURL}/tasks`, config);
      console.log('   ✓ Unexpected success - tasks endpoint working');
      console.log('   ✓ Tasks count:', tasksResponse.data.length);
    } catch (error) {
      console.log('   ❌ Tasks endpoint failed as expected');
      console.log('   Status:', error.response?.status);
      console.log('   Headers:', Object.keys(error.response?.headers || {}));
      
      // Try to get more information about the error
      if (error.response?.status === 500) {
        console.log('   - This is likely a database schema issue');
        
        // Try a different endpoint to see if we can get more info
        try {
          const usersResponse = await axios.get(`${baseURL}/users`, config);
          console.log('   ✓ Users endpoint working (schema is correct for users)');
          console.log('   ✓ Users count:', usersResponse.data.length);
        } catch (userError) {
          console.log('   ❌ Users endpoint also failing');
        }
      }
    }
    
    // Test if we can create a task with minimal data
    console.log('\n3. Testing minimal task operations...');
    try {
      // First, let's try to understand what fields are required
      const minimalTask = {
        date: new Date().toISOString().split('T')[0],
        source: 'Test',
        category: 'Test',
        service: 'Test',
        description: 'Test task for schema detection',
        status: 'Pending'
        // Note: Not including files field to see if that's the issue
      };
      
      const createResponse = await axios.post(`${baseURL}/tasks`, minimalTask, config);
      console.log('   ✓ Minimal task creation successful');
      console.log('   ✓ Task ID:', createResponse.data.id);
      
      // Try to delete the task
      try {
        await axios.delete(`${baseURL}/tasks/${createResponse.data.id}`, config);
        console.log('   ✓ Task cleanup successful');
      } catch (deleteError) {
        console.log('   - Task cleanup failed (not critical)');
      }
    } catch (createError) {
      console.log('   ❌ Minimal task creation failed');
      console.log('   Status:', createError.response?.status);
      console.log('   Message:', createError.response?.data?.message);
      console.log('   Error:', createError.response?.data?.error);
    }
    
  } catch (error) {
    console.error('=== TEST FAILED ===');
    console.error('Error:', error.response?.data || error.message);
  }
}

backendSchemaTest();