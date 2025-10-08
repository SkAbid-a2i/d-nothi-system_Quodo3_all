const axios = require('axios');

async function testTaskLoggerCreateTask() {
  let authToken = null;
  
  try {
    console.log('🧪 Testing Task Logger Create Task Section...\n');
    
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
    
    // 2. Test fetching dropdown values specifically for Task Logger
    console.log('2. Testing dropdown values for Task Logger Create Task Section...');
    
    // Test Source dropdowns
    const sourceResponse = await axios.get('http://localhost:5001/api/dropdowns/Source', config);
    console.log(`✅ Fetched ${sourceResponse.data.length} source dropdowns`);
    console.log('Source values:', sourceResponse.data.map(d => d.value));
    
    // Test Category dropdowns
    const categoryResponse = await axios.get('http://localhost:5001/api/dropdowns/Category', config);
    console.log(`✅ Fetched ${categoryResponse.data.length} category dropdowns`);
    console.log('Category values:', categoryResponse.data.map(d => d.value));
    
    // Test Service dropdowns
    const serviceResponse = await axios.get('http://localhost:5001/api/dropdowns/Service', config);
    console.log(`✅ Fetched ${serviceResponse.data.length} service dropdowns`);
    console.log('Service values:', serviceResponse.data.map(d => d.value));
    
    // 3. Test creating a task with dropdown values
    console.log('\n3. Testing task creation with dropdown values...');
    
    const newTask = {
      date: new Date().toISOString().split('T')[0],
      source: sourceResponse.data[0].value, // Use first source value
      category: categoryResponse.data[0].value, // Use first category value
      service: serviceResponse.data[0].value, // Use first service value
      description: 'Test task created from Task Logger Create Task Section',
      status: 'Pending'
    };
    
    console.log('Creating task with data:', newTask);
    
    const createTaskResponse = await axios.post('http://localhost:5001/api/tasks', newTask, config);
    const taskId = createTaskResponse.data.id;
    console.log('✅ Task created successfully with ID:', taskId);
    
    // 4. Clean up - delete the test task
    await axios.delete(`http://localhost:5001/api/tasks/${taskId}`, config);
    console.log('✅ Test task deleted successfully');
    
    console.log('\n🎉 Task Logger Create Task Section is working correctly!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testTaskLoggerCreateTask();