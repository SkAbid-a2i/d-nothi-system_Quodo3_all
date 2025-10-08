// Simple test script to verify task functionality
const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('Testing Task Logger functionality...');

// Test 1: Check if we can access the tasks endpoint
async function testTasksEndpoint() {
  try {
    console.log('Testing tasks endpoint...');
    const response = await api.get('/tasks');
    console.log('✓ Tasks endpoint accessible');
    console.log(`Found ${response.data.length} tasks`);
    return true;
  } catch (error) {
    console.error('✗ Error accessing tasks endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Test 2: Check if we can create a task with user information
async function testCreateTask() {
  try {
    console.log('Testing task creation...');
    
    // Sample task data
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
    console.error('✗ Error creating task:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Test 3: Check if we can update a task status
async function testUpdateTaskStatus(taskId) {
  if (!taskId) {
    console.log('Skipping task status update test (no task ID)');
    return;
  }
  
  try {
    console.log('Testing task status update...');
    
    const updateData = {
      status: 'In Progress'
    };
    
    const response = await api.put(`/tasks/${taskId}`, updateData);
    console.log('✓ Task status updated successfully');
    console.log('Updated status:', response.data.status);
    return true;
  } catch (error) {
    console.error('✗ Error updating task status:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting Task Logger tests...\n');
  
  // Test 1: Check tasks endpoint
  const tasksAccessible = await testTasksEndpoint();
  
  if (!tasksAccessible) {
    console.log('\nCannot access tasks endpoint. Stopping tests.');
    return;
  }
  
  // Test 2: Create task
  const taskId = await testCreateTask();
  
  // Test 3: Update task status
  if (taskId) {
    await testUpdateTaskStatus(taskId);
  }
  
  console.log('\nAll tests completed!');
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = {
  testTasksEndpoint,
  testCreateTask,
  testUpdateTaskStatus
};