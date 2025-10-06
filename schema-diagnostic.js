const axios = require('axios');

async function schemaDiagnostic() {
  try {
    console.log('=== DATABASE SCHEMA DIAGNOSTIC ===\n');
    
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
    
    // Test if we can create a minimal task without the files field
    console.log('\n2. Testing minimal task creation...');
    try {
      const minimalTask = {
        date: new Date().toISOString().split('T')[0],
        source: 'Diagnostic Test',
        category: 'Testing',
        service: 'Diagnostics',
        description: 'Schema diagnostic task',
        status: 'Pending'
      };
      
      // We'll try to create a task without the files field to see if that works
      const createTaskResponse = await axios.post(`${baseURL}/tasks`, minimalTask, config);
      console.log('   ✓ Minimal task creation successful');
      console.log('   ✓ Task ID:', createTaskResponse.data.id);
      
      // Try to delete the task to clean up
      try {
        await axios.delete(`${baseURL}/tasks/${createTaskResponse.data.id}`, config);
        console.log('   ✓ Task cleanup successful');
      } catch (deleteError) {
        console.log('   - Task cleanup failed (not critical)');
      }
      
    } catch (createError) {
      console.log('   ❌ Minimal task creation failed');
      console.log('   Status:', createError.response?.status);
      console.log('   Error:', createError.response?.data?.error || createError.response?.data?.message);
    }
    
    // Test fetching a single task if any exist
    console.log('\n3. Testing task fetching...');
    try {
      const tasksResponse = await axios.get(`${baseURL}/tasks`, config);
      console.log('   ✓ Task fetching responded');
      console.log('   ✓ Response type:', typeof tasksResponse.data);
      console.log('   ✓ Response length:', Array.isArray(tasksResponse.data) ? tasksResponse.data.length : 'Not an array');
      
      if (Array.isArray(tasksResponse.data) && tasksResponse.data.length > 0) {
        const firstTask = tasksResponse.data[0];
        console.log('   ✓ First task keys:', Object.keys(firstTask));
        
        // Check if files field exists in the response
        if ('files' in firstTask) {
          console.log('   ✓ Files field present in task data');
        } else {
          console.log('   - Files field missing from task data');
        }
        
        if ('assignedTo' in firstTask) {
          console.log('   - assignedTo field present in task data');
        } else {
          console.log('   ✓ assignedTo field missing from task data');
        }
      }
    } catch (fetchError) {
      console.log('   ❌ Task fetching failed');
      console.log('   Status:', fetchError.response?.status);
      console.log('   Error:', fetchError.response?.data?.error || fetchError.response?.data?.message);
    }
    
  } catch (error) {
    console.error('=== DIAGNOSTIC FAILED ===');
    console.error('Error:', error.response?.data || error.message);
  }
}

schemaDiagnostic();