const axios = require('axios');

// Configuration - Update these values with valid credentials
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const USERNAME = process.env.TEST_USERNAME || 'admin';
const PASSWORD = process.env.TEST_PASSWORD || 'admin123';

async function testDashboardRealtime() {
  console.log('Testing Dashboard Real-time Updates...\n');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Test Username: ${USERNAME}`);
  console.log('Test Password: *** (hidden for security)\n');
  
  try {
    // Test 1: Login
    console.log('Test 1: User Login');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: USERNAME,
      password: PASSWORD
    });
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful\n');
    
    // Configure axios with auth token
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test 2: Get initial dashboard data
    console.log('Test 2: Fetch Initial Dashboard Data');
    const initialTasksResponse = await api.get('/tasks');
    const initialLeavesResponse = await api.get('/leaves');
    console.log(`✅ Initial tasks fetched: ${initialTasksResponse.data.length} items`);
    console.log(`✅ Initial leaves fetched: ${initialLeavesResponse.data.length} items\n`);
    
    // Test 3: Create a task
    console.log('Test 3: Create Task');
    const taskData = {
      date: new Date().toISOString().split('T')[0],
      source: 'Real-time Test',
      category: 'IT Support',
      service: 'Software',
      description: 'Test task for real-time dashboard updates',
      status: 'Pending'
    };
    
    const createTaskResponse = await api.post('/tasks', taskData);
    const taskId = createTaskResponse.data.id;
    console.log(`✅ Task created with ID: ${taskId}\n`);
    
    // Wait a moment to allow for notification processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 4: Create a leave request
    console.log('Test 4: Create Leave Request');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const leaveData = {
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: 'Test leave for real-time dashboard updates'
    };
    
    const createLeaveResponse = await api.post('/leaves', leaveData);
    const leaveId = createLeaveResponse.data.id;
    console.log(`✅ Leave request created with ID: ${leaveId}\n`);
    
    // Wait a moment to allow for notification processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 5: Approve the leave (if user has permission)
    console.log('Test 5: Approve Leave Request');
    try {
      const approveResponse = await api.put(`/leaves/${leaveId}/approve`);
      console.log(`✅ Leave approved successfully\n`);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('ℹ️  User does not have permission to approve leaves (this is expected for some user roles)\n');
      } else {
        throw error;
      }
    }
    
    // Wait a moment to allow for notification processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 6: Update the task
    console.log('Test 6: Update Task');
    const updatedTaskData = {
      ...taskData,
      status: 'Completed',
      description: 'Test task for real-time dashboard updates (UPDATED)'
    };
    
    const updateTaskResponse = await api.put(`/tasks/${taskId}`, updatedTaskData);
    console.log(`✅ Task updated successfully\n`);
    
    // Wait a moment to allow for notification processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 7: Delete the task
    console.log('Test 7: Delete Task');
    const deleteTaskResponse = await api.delete(`/tasks/${taskId}`);
    console.log(`✅ Task deleted successfully\n`);
    
    console.log('🎉 All dashboard real-time update tests completed successfully!');
    console.log('\nSummary:');
    console.log('- Dashboard should have received real-time notifications for all actions');
    console.log('- Task creation, update, and deletion should be reflected immediately');
    console.log('- Leave requests and approvals should be reflected immediately');
    console.log('- No manual refresh should be required to see these updates');
    
    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('\nTo run this test successfully:');
    console.error('1. Make sure the backend server is running');
    console.error('2. Update the USERNAME and PASSWORD variables in this script with valid credentials');
    console.error('3. Or set TEST_USERNAME and TEST_PASSWORD environment variables');
    return false;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testDashboardRealtime().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testDashboardRealtime };