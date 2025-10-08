// Test script to verify Task Logger updates
const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || 'your-test-user-token';
const TEST_ADMIN_TOKEN = process.env.TEST_ADMIN_TOKEN || 'your-test-admin-token';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set auth token
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Test functions
const testTaskCreation = async () => {
  console.log('Testing task creation with user information...');
  
  try {
    setAuthToken(TEST_USER_TOKEN);
    
    const taskData = {
      date: new Date().toISOString().split('T')[0],
      source: 'Test Source',
      category: 'Test Category',
      service: 'Test Service',
      office: 'Test Office',
      userInformation: 'Test User Information',
      description: 'Test task description',
      status: 'Pending'
    };
    
    const response = await api.post('/tasks', taskData);
    console.log('✓ Task created successfully');
    console.log('Task ID:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('✗ Error creating task:', error.response?.data || error.message);
    return null;
  }
};

const testTaskUpdate = async (taskId) => {
  console.log('Testing task update with user information...');
  
  try {
    setAuthToken(TEST_USER_TOKEN);
    
    const updateData = {
      userInformation: 'Updated User Information',
      status: 'In Progress'
    };
    
    const response = await api.put(`/tasks/${taskId}`, updateData);
    console.log('✓ Task updated successfully');
    console.log('Updated task:', response.data);
    return response.data;
  } catch (error) {
    console.error('✗ Error updating task:', error.response?.data || error.message);
    return null;
  }
};

const testTaskStatusUpdate = async (taskId) => {
  console.log('Testing direct status update...');
  
  try {
    setAuthToken(TEST_USER_TOKEN);
    
    const updateData = {
      status: 'Completed'
    };
    
    const response = await api.put(`/tasks/${taskId}`, updateData);
    console.log('✓ Task status updated successfully');
    console.log('Updated task status:', response.data.status);
    return response.data;
  } catch (error) {
    console.error('✗ Error updating task status:', error.response?.data || error.message);
    return null;
  }
};

const testGetTasks = async () => {
  console.log('Testing get all tasks...');
  
  try {
    setAuthToken(TEST_USER_TOKEN);
    
    const response = await api.get('/tasks');
    console.log('✓ Tasks fetched successfully');
    console.log(`Total tasks: ${response.data.length}`);
    return response.data;
  } catch (error) {
    console.error('✗ Error fetching tasks:', error.response?.data || error.message);
    return null;
  }
};

// Run tests
const runTests = async () => {
  console.log('Starting Task Logger updates tests...\n');
  
  // Test 1: Create task with user information
  const taskId = await testTaskCreation();
  if (!taskId) {
    console.log('Failed to create task, stopping tests.');
    return;
  }
  
  // Test 2: Update task with user information
  await testTaskUpdate(taskId);
  
  // Test 3: Update task status directly
  await testTaskStatusUpdate(taskId);
  
  // Test 4: Get all tasks
  await testGetTasks();
  
  console.log('\nAll tests completed!');
};

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = {
  testTaskCreation,
  testTaskUpdate,
  testTaskStatusUpdate,
  testGetTasks
};