// Test script to verify all functionality is working correctly
const axios = require('axios');

async function testFunctionality() {
  console.log('=== Testing Application Functionality ===\n');
  
  try {
    // Test 1: Server availability
    console.log('1. Testing server availability...');
    const serverResponse = await axios.get('https://quodo3-backend.onrender.com/');
    console.log('   ✓ Server is running:', serverResponse.data.message);
    
    // Test 2: Authentication
    console.log('2. Testing authentication...');
    const authResponse = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'testuser3',
      password: 'password123'
    });
    const token = authResponse.data.token;
    const user = authResponse.data.user;
    console.log('   ✓ Authentication successful, user role:', user.role);
    
    // Configure API client with authentication
    const api = axios.create({
      baseURL: 'https://quodo3-backend.onrender.com/api',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test 3: Dropdown values
    console.log('3. Testing dropdown values...');
    const sourcesResponse = await api.get('/dropdowns/Source');
    console.log('   ✓ Sources fetched, count:', sourcesResponse.data.length);
    
    const categoriesResponse = await api.get('/dropdowns/Category');
    console.log('   ✓ Categories fetched, count:', categoriesResponse.data.length);
    
    const servicesResponse = await api.get('/dropdowns/Service');
    console.log('   ✓ Services fetched, count:', servicesResponse.data.length);
    
    // Test 4: Task creation
    console.log('4. Testing task creation...');
    const taskData = {
      date: new Date().toISOString(),
      source: sourcesResponse.data[0]?.value || 'Email',
      category: categoriesResponse.data[0]?.value || 'IT Support',
      service: servicesResponse.data[0]?.value || 'Software',
      description: 'Test task from functionality test',
      status: 'Pending',
      office: user.office || 'Test Office'
    };
    
    const taskResponse = await api.post('/tasks', taskData);
    const taskId = taskResponse.data.id;
    console.log('   ✓ Task created with ID:', taskId);
    
    // Test 5: Task retrieval
    console.log('5. Testing task retrieval...');
    const tasksResponse = await api.get('/tasks');
    console.log('   ✓ Tasks retrieved, count:', tasksResponse.data.length);
    
    // Test 6: Leave creation
    console.log('6. Testing leave creation...');
    const leaveData = {
      startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      endDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
      reason: 'Test leave from functionality test',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    
    const leaveResponse = await api.post('/leaves', leaveData);
    const leaveId = leaveResponse.data.id;
    console.log('   ✓ Leave created with ID:', leaveId);
    
    // Test 7: Leave retrieval
    console.log('7. Testing leave retrieval...');
    const leavesResponse = await api.get('/leaves');
    console.log('   ✓ Leaves retrieved, count:', leavesResponse.data.length);
    
    console.log('\n=== Functionality Test Complete ===');
    console.log('✅ All core functionality is working correctly!');
    console.log('✅ Dropdown values are being fetched from API');
    console.log('✅ Tasks are being created and retrieved');
    console.log('✅ Leaves are being created and retrieved');
    
  } catch (error) {
    console.error('Functionality test failed:', error.message);
    console.error('Error details:', error.response?.data || error);
    process.exit(1);
  }
}

testFunctionality();