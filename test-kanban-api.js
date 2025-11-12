// Test script for Kanban API endpoints with authentication
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  username: 'admin',
  password: 'admin123'
};

async function testKanbanAPI() {
  try {
    console.log('Testing Kanban API endpoints with authentication...\n');

    // Step 1: Login to get JWT token
    console.log('1. Testing login to get JWT token');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    const token = loginResponse.data.token;
    console.log('   ✓ Login successful');
    console.log('   Token:', token.substring(0, 20) + '...');

    // Create axios instance with auth
    const api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Step 2: Get all kanban items (should be empty initially)
    console.log('\n2. Testing GET /kanban');
    try {
      const getAllResponse = await api.get('/kanban');
      console.log('   ✓ GET /kanban successful');
      console.log('   Found', getAllResponse.data.data.length, 'items');
    } catch (error) {
      console.log('   ✗ GET /kanban failed:', error.response?.data || error.message);
    }

    // Step 3: Create a new kanban item
    console.log('\n3. Testing POST /kanban');
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
      console.log('   Created item ID:', createdItem.id);
    } catch (error) {
      console.log('   ✗ POST /kanban failed:', error.response?.data || error.message);
      return;
    }

    // Step 4: Get all kanban items (should now have 1 item)
    console.log('\n4. Testing GET /kanban again');
    try {
      const getAllResponse = await api.get('/kanban');
      console.log('   ✓ GET /kanban successful');
      console.log('   Found', getAllResponse.data.data.length, 'items');
    } catch (error) {
      console.log('   ✗ GET /kanban failed:', error.response?.data || error.message);
    }

    // Step 5: Update the kanban item
    console.log('\n5. Testing PUT /kanban/:id');
    if (createdItem) {
      try {
        const updateData = {
          title: 'Updated Test Kanban Item',
          description: 'This is an updated test kanban item',
          status: 'InProgress'
        };
        const updateResponse = await api.put(`/kanban/${createdItem.id}`, updateData);
        console.log('   ✓ PUT /kanban/:id successful');
        console.log('   Updated item ID:', updateResponse.data.data.id);
      } catch (error) {
        console.log('   ✗ PUT /kanban/:id failed:', error.response?.data || error.message);
      }
    }

    // Step 6: Delete the kanban item
    console.log('\n6. Testing DELETE /kanban/:id');
    if (createdItem) {
      try {
        const deleteResponse = await api.delete(`/kanban/${createdItem.id}`);
        console.log('   ✓ DELETE /kanban/:id successful');
        console.log('   Response:', deleteResponse.data.message);
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