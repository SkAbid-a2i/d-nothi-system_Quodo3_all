// Test script to verify Kanban board functionality
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

async function runTest() {
  try {
    console.log('🧪 Testing Kanban Board Functionality...\n');
    
    // 1. Login as Admin
    console.log('1. Logging in as Admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful\n');
    
    // 2. Create a Kanban card
    console.log('2. Creating a Kanban card...');
    const cardData = {
      title: 'Test Kanban Card',
      description: 'This is a test card for the Kanban board',
      status: 'backlog'
    };
    
    const createCardResponse = await axios.post(`${BASE_URL}/kanban`, cardData, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const cardId = createCardResponse.data.data.id;
    console.log('✅ Kanban card created successfully\n');
    
    // 3. Fetch all Kanban cards
    console.log('3. Fetching all Kanban cards...');
    const getCardsResponse = await axios.get(`${BASE_URL}/kanban`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const cardsCount = getCardsResponse.data.data.length;
    console.log(`✅ Successfully fetched ${cardsCount} Kanban cards\n`);
    
    // 4. Update the Kanban card
    console.log('4. Updating the Kanban card...');
    const updatedCardData = {
      title: 'Updated Test Kanban Card',
      description: 'This card has been updated',
      status: 'inProgress'
    };
    
    const updateCardResponse = await axios.put(`${BASE_URL}/kanban/${cardId}`, updatedCardData, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('✅ Kanban card updated successfully\n');
    
    // 5. Delete the Kanban card
    console.log('5. Deleting the Kanban card...');
    const deleteCardResponse = await axios.delete(`${BASE_URL}/kanban/${cardId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('✅ Kanban card deleted successfully\n');
    
    console.log('\n🎉 Test completed! Kanban board functionality is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
  }
}

// Run the test
runTest();