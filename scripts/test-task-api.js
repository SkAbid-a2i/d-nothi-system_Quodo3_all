#!/usr/bin/env node

/**
 * Task API Test Script
 * Tests the task API endpoints to verify fixes for 500 errors and field visibility issues
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || 'test-token';

console.log('🧪 Task API Test Script');
console.log('======================');

// Test data
const testTask = {
  date: new Date().toISOString().split('T')[0],
  source: 'Test Source',
  category: 'Test Category',
  service: 'Test Service',
  description: 'This is a test task for verifying API fixes',
  status: 'Pending',
  userId: 1,
  userName: 'Test User'
};

async function testTaskCreation() {
  console.log('\n📝 Testing Task Creation...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/tasks`, testTask, {
      headers: {
        'Authorization': `Bearer ${TEST_USER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Task creation successful');
    console.log(`   Status: ${response.status}`);
    console.log(`   Task ID: ${response.data.id}`);
    
    return response.data.id;
  } catch (error) {
    console.error('❌ Task creation failed');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Message: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testTaskRetrieval(taskId) {
  console.log('\n🔍 Testing Task Retrieval...');
  
  if (!taskId) {
    console.log('⚠️  Skipping retrieval test - no task ID provided');
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${TEST_USER_TOKEN}`
      }
    });
    
    console.log('✅ Task retrieval successful');
    console.log(`   Status: ${response.status}`);
    console.log(`   Tasks found: ${response.data.length}`);
    
    // Check if our test task is in the list
    const testTaskFound = response.data.find(task => task.id === taskId);
    if (testTaskFound) {
      console.log('✅ Test task found in task list');
    } else {
      console.log('⚠️  Test task not found in task list');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Task retrieval failed');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Message: ${error.response?.data?.message || error.message}`);
  }
}

async function testTaskUpdate(taskId) {
  console.log('\n✏️  Testing Task Update...');
  
  if (!taskId) {
    console.log('⚠️  Skipping update test - no task ID provided');
    return;
  }
  
  const updatedTask = {
    ...testTask,
    description: 'This is an updated test task',
    status: 'In Progress'
  };
  
  try {
    const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, updatedTask, {
      headers: {
        'Authorization': `Bearer ${TEST_USER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Task update successful');
    console.log(`   Status: ${response.status}`);
    console.log(`   Updated description: ${response.data.description}`);
    console.log(`   Updated status: ${response.data.status}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Task update failed');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Message: ${error.response?.data?.message || error.message}`);
  }
}

async function testTaskDeletion(taskId) {
  console.log('\n🗑️  Testing Task Deletion...');
  
  if (!taskId) {
    console.log('⚠️  Skipping deletion test - no task ID provided');
    return;
  }
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${TEST_USER_TOKEN}`
      }
    });
    
    console.log('✅ Task deletion successful');
    console.log(`   Status: ${response.status}`);
    console.log(`   Message: ${response.data.message}`);
  } catch (error) {
    console.error('❌ Task deletion failed');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Message: ${error.response?.data?.message || error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Task API Tests...\n');
  
  // Test task creation
  const taskId = await testTaskCreation();
  
  // Test task retrieval
  await testTaskRetrieval(taskId);
  
  // Test task update
  await testTaskUpdate(taskId);
  
  // Test task deletion
  await testTaskDeletion(taskId);
  
  console.log('\n🏁 Task API Tests Completed');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Test script interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test script terminated');
  process.exit(0);
});

// Run the tests
if (require.main === module) {
  runTests()
    .catch(error => {
      console.error('💥 Test script failed with unhandled error:', error);
      process.exit(1);
    });
}

module.exports = {
  testTaskCreation,
  testTaskRetrieval,
  testTaskUpdate,
  testTaskDeletion,
  runTests
};