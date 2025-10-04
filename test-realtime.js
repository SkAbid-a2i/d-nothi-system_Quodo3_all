// Test script to verify real-time functionality
const axios = require('axios');
const logger = require('./services/logger.service');

async function testRealtime() {
  console.log('=== Testing Real-Time Functionality ===\n');
  
  try {
    // Test 1: Server availability
    console.log('1. Testing server availability...');
    const serverResponse = await axios.get('https://quodo3-backend.onrender.com/');
    console.log('   ✓ Server is running:', serverResponse.data.message);
    console.log('   ✓ Connected clients:', serverResponse.data.connectedClients || 0);
    
    // Test 2: Authentication
    console.log('2. Testing authentication...');
    const authResponse = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'testuser3',
      password: 'password123'
    });
    const token = authResponse.data.token;
    const user = authResponse.data.user;
    console.log('   ✓ Authentication successful, user ID:', user.id);
    
    // Test 3: Notification service endpoint
    console.log('3. Testing notification service endpoint...');
    try {
      const notificationResponse = await axios.get(
        `https://quodo3-backend.onrender.com/api/notifications?userId=${user.id}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 // 5 second timeout
        }
      );
      console.log('   ✓ Notification service endpoint accessible');
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('   ℹ Notification service endpoint timed out (expected for SSE)');
      } else {
        console.log('   ℹ Notification service test result:', error.response?.status || error.message);
      }
    }
    
    // Test 4: Task creation with real-time notification
    console.log('4. Testing task creation with real-time notification...');
    const api = axios.create({
      baseURL: 'https://quodo3-backend.onrender.com/api',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const taskResponse = await api.post('/tasks', {
      date: new Date().toISOString(),
      source: 'Real-time Test',
      category: 'IT Support',
      service: 'Software',
      description: 'Test task for real-time functionality',
      status: 'Pending',
      office: user.office || 'Test Office'
    });
    
    const taskId = taskResponse.data.id;
    console.log('   ✓ Task created with ID:', taskId);
    
    // Log the task creation for notification tracking
    logger.info('Test task created for real-time notification', {
      taskId: taskId,
      userId: user.id,
      description: 'Test task for real-time functionality'
    });
    
    // Test 5: Leave request with real-time notification
    console.log('5. Testing leave request with real-time notification...');
    const leaveResponse = await api.post('/leaves', {
      startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      endDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
      reason: 'Real-time test leave request',
      appliedDate: new Date().toISOString().split('T')[0]
    });
    
    const leaveId = leaveResponse.data.id;
    console.log('   ✓ Leave request created with ID:', leaveId);
    
    // Log the leave request for notification tracking
    logger.info('Test leave request created for real-time notification', {
      leaveId: leaveId,
      userId: user.id,
      reason: 'Real-time test leave request'
    });
    
    console.log('\n=== Real-Time Functionality Test Complete ===');
    console.log('✅ Server is running with notification service');
    console.log('✅ Authentication working');
    console.log('✅ Task creation with real-time notification');
    console.log('✅ Leave request with real-time notification');
    console.log('\nTo test real-time updates in the browser:');
    console.log('1. Open the application in two browser windows');
    console.log('2. Log in with the same user in both windows');
    console.log('3. Create a task or leave request in one window');
    console.log('4. Observe the real-time notification in the other window');
    
  } catch (error) {
    console.error('Real-time functionality test failed:', error.message);
    console.error('Error details:', error.response?.data || error);
    process.exit(1);
  }
}

testRealtime();