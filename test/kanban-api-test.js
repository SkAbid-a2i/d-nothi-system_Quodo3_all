// Test script for Kanban API endpoints
const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const TEST_TOKEN = process.env.TEST_TOKEN || 'your-jwt-token-here';

// Axios instance with auth
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_TOKEN}`
  }
});

async function testKanbanAPI() {
  try {
    console.log('Testing Kanban API endpoints...\n');

    // Test 1: Get all kanban items
    console.log('1. Testing GET /kanban');
    try {
      const getAllResponse = await api.get('/kanban');
      console.log('   ✓ GET /kanban successful');
      console.log('   Response:', JSON.stringify(getAllResponse.data, null, 2));
    } catch (error) {
      console.log('   ✗ GET /kanban failed:', error.response?.data || error.message);
    }

    // Test 2: Create a new kanban item
    console.log('\n2. Testing POST /kanban');
    const newKanbanItem = {
      title: 'Test Kanban Item',
      description: 'This is a test kanban item created via API',
      status: 'Backlog'
    };

    let createdItem;
    try {
      const createResponse = await api.post('/kanban', newKanbanItem);
      console.log('   ✓ POST /kanban successful');
      createdItem = createResponse.data.data;
      console.log('   Created item:', JSON.stringify(createdItem, null, 2));
    } catch (error) {
      console.log('   ✗ POST /kanban failed:', error.response?.data || error.message);
      return;
    }

    // Test 3: Update the kanban item
    console.log('\n3. Testing PUT /kanban/:id');
    if (createdItem) {
      try {
        const updateData = {
          title: 'Updated Test Kanban Item',
          description: 'This is an updated test kanban item',
          status: 'InProgress'
        };
        const updateResponse = await api.put(`/kanban/${createdItem.id}`, updateData);
        console.log('   ✓ PUT /kanban/:id successful');
        console.log('   Updated item:', JSON.stringify(updateResponse.data.data, null, 2));
      } catch (error) {
        console.log('   ✗ PUT /kanban/:id failed:', error.response?.data || error.message);
      }
    }

    // Test 4: Delete the kanban item
    console.log('\n4. Testing DELETE /kanban/:id');
    if (createdItem) {
      try {
        const deleteResponse = await api.delete(`/kanban/${createdItem.id}`);
        console.log('   ✓ DELETE /kanban/:id successful');
        console.log('   Response:', JSON.stringify(deleteResponse.data, null, 2));
      } catch (error) {
        console.log('   ✗ DELETE /kanban/:id failed:', error.response?.data || error.message);
      }
    }

    console.log('\nKanban API tests completed.');
  } catch (error) {
    console.error('Unexpected error during testing:', error.message);
  }
}

// Run the tests
if (require.main === module) {
  testKanbanAPI();
}

module.exports = { testKanbanAPI };